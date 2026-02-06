import React, { useState } from 'react';
import { X, AlertTriangle, Save } from 'lucide-react';

interface CessationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: string, reason: string) => Promise<void>;
    employeeName: string;
}

export const CessationModal: React.FC<CessationModalProps> = ({ isOpen, onClose, onConfirm, employeeName }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm(date, reason);
            // Modal needs to be closed by parent or we can reset here
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="text-lg font-bold">Confirmar Cese de Colaborador</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-gray-600 text-sm">
                        ¿Estás seguro que deseas cesar a <span className="font-bold text-gray-900">{employeeName}</span>?
                        Esta acción registrará la fecha de salida y desactivará su estado activo.
                    </p>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 block">Fecha de Cese</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 block">Motivo de Cese (Opcional)</label>
                        <textarea
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                            placeholder="Ingrese el motivo del cese..."
                        />
                    </div>

                    {/* Footer inside form to submit */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm hover:underline transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Confirmar Cese
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
