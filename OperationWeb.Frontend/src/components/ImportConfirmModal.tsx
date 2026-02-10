import React from 'react';

interface ImportConfirmModalProps {
    isOpen: boolean;
    recordCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ImportConfirmModal: React.FC<ImportConfirmModalProps> = ({
    isOpen,
    recordCount,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '32px',
                    maxWidth: '500px',
                    width: '90%',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{
                    margin: '0 0 16px 0',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                }}>
                    📊 Confirmar Importación
                </h2>

                <div style={{ marginBottom: '24px', color: '#4b5563', lineHeight: '1.6' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
                        Se han detectado <strong style={{ color: '#2563eb', fontSize: '18px' }}>{recordCount}</strong> registros en el archivo Excel.
                    </p>
                    <p style={{ margin: '0 0 12px 0' }}>
                        ¿Desea proceder con la importación masiva?
                    </p>
                    <div style={{
                        backgroundColor: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '4px',
                        padding: '12px',
                        marginTop: '16px'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
                            ⏱️ <strong>Nota:</strong> Este proceso puede tardar 10-30 segundos.
                            <br />
                            Por favor, no cierre esta ventana durante la importación.
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            color: '#374151',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                    >
                        ✅ Confirmar Importación
                    </button>
                </div>
            </div>
        </div>
    );
};
