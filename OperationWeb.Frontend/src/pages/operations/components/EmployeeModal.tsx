import React, { useState, useEffect, useRef, useMemo } from 'react';
import { personalService, Employee } from '../../../services/personalService';
import { userService } from '../../../services/userService';
import { X, Save, Camera, Upload, UserCog } from 'lucide-react';

// Constant to prevent re-evaluation of placeholder path
const PLACEHOLDER_IMAGE = '/img/placeholder-user.png';

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Employee>) => Promise<void>;
    initialData?: Employee;
    mode: 'create' | 'edit' | 'view';
    onUserUpdate?: () => void; // Callback to refresh parent
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, initialData, mode, onUserUpdate }) => {
    const [formData, setFormData] = useState<Partial<Employee>>({});
    const [splitName, setSplitName] = useState({
        nombres: '',
        paterno: '',
        materno: ''
    });
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [signaturePreview, setSignaturePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [cargos, setCargos] = useState<string[]>([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const meta = await personalService.getMetadata();
                if (meta && meta.cargos) {
                    setCargos(meta.cargos);
                }
            } catch (error) {
                console.error('Error loading metadata:', error);
                // Fallback options
                setCargos(['OPERARIO', 'SUPERVISOR', 'INSPECTOR', 'JEFE', 'ANALISTA', 'ASISTENTE', 'COORDINADOR']);
            }
        };
        fetchMetadata();
    }, []);

    // Memoize image sources to prevent unnecessary re-renders
    const profileImageSrc = useMemo(() => photoPreview || PLACEHOLDER_IMAGE, [photoPreview]);
    const signatureImageSrc = useMemo(() => signaturePreview || PLACEHOLDER_IMAGE, [signaturePreview]);

    // Use ref to track if we've already initialized with this data
    const initializedRef = useRef<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Create a unique key for this modal instance
            const instanceKey = `${mode}-${initialData?.dni || 'new'}`;

            // Only initialize if this is a new instance
            if (initializedRef.current !== instanceKey) {
                initializedRef.current = instanceKey;

                if (initialData && (mode === 'edit' || mode === 'view')) {
                    setFormData({ ...initialData });

                    // Use fotoUrl/firmaUrl from backend if available, otherwise fall back to base64 foto/firma
                    setPhotoPreview(initialData.fotoUrl || initialData.foto || '');
                    setSignaturePreview(initialData.firmaUrl || initialData.firma || '');

                    // Name splitting logic
                    const parts = (initialData.inspector || '').split(' ');
                    if (parts.length >= 3) {
                        setSplitName({
                            paterno: parts[0],
                            materno: parts[1],
                            nombres: parts.slice(2).join(' ')
                        });
                    } else if (parts.length === 2) {
                        setSplitName({
                            paterno: parts[0],
                            materno: parts[1],
                            nombres: ''
                        });
                    } else {
                        setSplitName({
                            nombres: initialData.inspector || '',
                            paterno: '',
                            materno: ''
                        });
                    }
                } else {
                    setFormData({
                        estado: 'ACTIVO',
                        fechaInicio: new Date().toISOString().split('T')[0],
                        tipo: 'OPERARIO'
                    });
                    setSplitName({ nombres: '', paterno: '', materno: '' });
                    setPhotoPreview('');
                    setSignaturePreview('');
                }
            }
        } else {
            // Reset when modal closes
            initializedRef.current = null;
        }
    }, [isOpen, mode, initialData?.dni]); // Only depend on stable values

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'signature') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (type === 'photo') setPhotoPreview(result);
                else setSignaturePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Join name
            const fullName = `${splitName.paterno} ${splitName.materno} ${splitName.nombres}`.trim();
            const dataToSave = {
                ...formData,
                inspector: fullName,
                foto: photoPreview,
                firma: signaturePreview
            };
            await onSave(dataToSave);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleUserManagement = async () => {
        if (!formData.dni) return;
        if (!confirm('¿Proceder con la gestión de usuario?')) return;

        setLoading(true);
        try {
            if (!initialData?.hasUser) {
                const res = await userService.createUser(formData.dni, 'Usuario');
                alert(`Usuario Creado.\nContraseña Temporal: ${res.tempPassword}`);
            } else {
                await userService.toggleStatus(formData.dni);
                alert('Estado de usuario actualizado.');
            }
            if (onUserUpdate) onUserUpdate();
            onClose();
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isReadOnly = mode === 'view';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1000px] max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {mode === 'create' && 'Nuevo Colaborador'}
                        {mode === 'edit' && 'Editar Colaborador'}
                        {mode === 'view' && 'Detalle del Colaborador'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Left Column: Profile Card */}
                        <div className="w-full lg:w-1/3 flex flex-col space-y-8">
                            {/* Profile Info */}
                            <div className="flex flex-col items-center">
                                <div className="relative mb-4">
                                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                        <img
                                            src={profileImageSrc}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {!isReadOnly && (
                                        <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 cursor-pointer transition-colors border-2 border-white">
                                            <Camera className="w-4 h-4" />
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'photo')} />
                                        </label>
                                    )}
                                </div>

                                <div className="text-center w-full space-y-1">
                                    <h4 className="font-bold text-lg text-gray-900 uppercase leading-tight">
                                        {splitName.nombres} {splitName.paterno}
                                    </h4>
                                    <p className="text-gray-500 text-sm font-medium uppercase min-h-[20px]">
                                        {formData.tipo || 'Puesto'}
                                    </p>
                                </div>
                            </div>

                            {/* Signature Section */}
                            <div className="w-full pt-4 border-t border-gray-100/50">
                                <h5 className="text-sm font-semibold text-gray-700 mb-3">Firma Digital</h5>
                                <label className={`relative w-full h-32 border-2 border-dashed ${isReadOnly ? 'border-gray-200 cursor-default' : 'border-gray-300 hover:border-blue-400 cursor-pointer'} rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all bg-gray-50/30 group`}>
                                    {signaturePreview ? (
                                        <img src={signatureImageSrc} alt="Firma" className="max-h-full max-w-full object-contain p-2" />
                                    ) : (
                                        <span className="text-sm text-gray-400 font-medium">Sin firma</span>
                                    )}

                                    {!isReadOnly && (
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'signature')} />
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Right Column: Form Fields */}
                        <div className="w-full lg:w-2/3">
                            <form id="employee-form" onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-600 block">Nombre</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={isReadOnly}
                                            value={splitName.nombres}
                                            onChange={e => setSplitName({ ...splitName, nombres: e.target.value })}
                                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 uppercase"
                                            placeholder="Nombres"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-600 block">Apellido Paterno</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={isReadOnly}
                                            value={splitName.paterno}
                                            onChange={e => setSplitName({ ...splitName, paterno: e.target.value })}
                                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 uppercase"
                                            placeholder="Apellido Paterno"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-600 block">Apellido Materno</label>
                                        <input
                                            type="text"
                                            disabled={isReadOnly}
                                            value={splitName.materno}
                                            onChange={e => setSplitName({ ...splitName, materno: e.target.value })}
                                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 uppercase"
                                            placeholder="Apellido Materno"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-600 block">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            disabled={isReadOnly}
                                            value={formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString().split('T')[0] : ''}
                                            onChange={e => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-600 block">Email</label>
                                    <input
                                        type="email"
                                        disabled={isReadOnly}
                                        value={formData.email || ''}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-600 block">Teléfono</label>
                                        <input
                                            type="tel"
                                            disabled={isReadOnly}
                                            value={formData.telefono || ''}
                                            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50"
                                            placeholder="Teléfono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-600 block">DNI / Documento</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={mode !== 'create'}
                                            value={formData.dni || ''}
                                            onChange={e => setFormData({ ...formData, dni: e.target.value })}
                                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            placeholder="DNI"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-600 block">Area / Unidad</label>
                                        <input
                                            type="text"
                                            disabled={isReadOnly}
                                            value={formData.area || ''} // Using 'area' for Unit based on legacy confusion
                                            onChange={e => setFormData({ ...formData, area: e.target.value })}
                                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 uppercase"
                                            placeholder="Unidad"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-600 block">Puesto</label>
                                        <select
                                            disabled={isReadOnly}
                                            value={formData.tipo || 'OPERARIO'}
                                            onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 bg-white"
                                        >
                                            {cargos.map((cargo) => (
                                                <option key={cargo} value={cargo}>{cargo}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-600 block">Estado</label>
                                    <select
                                        disabled={isReadOnly}
                                        value={formData.estado || 'ACTIVO'}
                                        onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 bg-white"
                                    >
                                        <option value="ACTIVO">ACTIVO</option>
                                        <option value="INACTIVO">INACTIVO</option>
                                        <option value="CESADO">CESADO</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-white">
                    <div>
                        {mode !== 'create' && (
                            <button
                                type="button"
                                onClick={handleUserManagement}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 border border-blue-100"
                            >
                                <UserCog className="w-4 h-4" />
                                {initialData?.hasUser ? 'Gestionar Usuario' : 'Crear Usuario'}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm hover:underline transition-all"
                        >
                            Cancelar
                        </button>
                        {!isReadOnly && (
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e as any)}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 shadow-sm"
                            >
                                {loading ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Guardar Colaborador
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
