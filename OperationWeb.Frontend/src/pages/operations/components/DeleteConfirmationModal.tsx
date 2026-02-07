import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    employeeName: string;
    dni: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    employeeName,
    dni
}) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-in-center">
                {/* Header with red warning stripe */}
                <div className="h-2 bg-red-600 w-full" />

                <div className="flex flex-col items-center p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Colaborador?</h3>
                    <p className="text-gray-600 text-sm mb-6">
                        Estás a punto de eliminar permanentemente a <br />
                        <span className="font-bold text-gray-900">{employeeName}</span> (DNI: {dni}). <br />
                        Esta acción no se puede deshacer y borrará toda la información asociada.
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="w-full py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-red-200 disabled:opacity-70"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    <span>Eliminar Definitivamente</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-3 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-all font-medium text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>

                {/* Close X */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
