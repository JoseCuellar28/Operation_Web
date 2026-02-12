import { useState } from 'react';
import { ShieldCheck, UserX, Lock, Unlock, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export default function SafetyAuditView() {
    const [auditState, setAuditState] = useState<'FORM' | 'LOCKED' | 'UNLOCK_MODAL'>('FORM');
    const [score, setScore] = useState(100);
    const [supervisorPin, setSupervisorPin] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChecklistChange = (value: boolean) => {
        // Simple logic: if any check fails, score drops to 0 (Critical)
        if (!value) setScore(0);
        else setScore(100); // Reset logic simplified
    };

    const submitAudit = async () => {
        if (score === 0) {
            try {
                // Post to Real SQL Server API
                await api.post('/api/v1/hse/audit', {
                    id_colaborador: 1, // Mocked ID until Auth context exists
                    id_supervisor: 2,
                    score: score,
                    resultado: 'BLOQUEADO',
                    motivo: 'Falla en EPP Crítico (Señalización/Casco)',
                    checklist: { casco: true, guantes: true, senalizacion: false }, // Should assume from state
                    id_ot: 'OT-MOCK-123'
                });
                setAuditState('LOCKED');
            } catch (e) {
                alert("Error de conexión con Servidor");
            }
        } else {
            alert("Auditoría Aprobada y Registrada en BD.");
        }
    };

    const attemptUnlock = async () => {
        if (supervisorPin === '1234') {
            await api.post('/api/v1/hse/unlock-resource', { id_colaborador: 1, pin: supervisorPin });
            setAuditState('FORM');
            setScore(100);
            setSupervisorPin('');
        } else {
            setErrorMsg('PIN INCORRECTO. ACCESO DENEGADO.');
        }
    };

    if (auditState === 'LOCKED') {
        return (
            <div className="fixed inset-0 bg-red-600 z-50 flex flex-col items-center justify-center p-8 text-center text-white">
                <Lock size={80} className="mb-4" />
                <h1 className="text-4xl font-black mb-2">ACCESO BLOQUEADO</h1>
                <p className="text-xl mb-8">INCUMPLIMIENTO CRÍTICO DE SEGURIDAD</p>

                <div className="bg-red-800 p-6 rounded-lg mb-8 w-full max-w-sm">
                    <p className="font-bold">Motivo:</p>
                    <p className="text-red-200">Falla en EPP Crítico (Detectado en Auditoría)</p>
                </div>

                <button
                    onClick={() => setAuditState('UNLOCK_MODAL')}
                    className="bg-white text-red-700 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-gray-100"
                >
                    <Unlock size={20} /> LIBERAR RECURSO (SUPERVISOR)
                </button>
            </div>
        );
    }

    if (auditState === 'UNLOCK_MODAL') {
        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center">
                    <ShieldCheck className="mx-auto text-blue-600 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Autenticación de Supervisor</h2>
                    <p className="text-sm text-gray-500 mb-6">Ingrese su PIN de seguridad para levantar el bloqueo.</p>

                    <input
                        type="password"
                        value={supervisorPin}
                        onChange={(e) => setSupervisorPin(e.target.value)}
                        className="w-full text-center text-3xl tracking-widest border-2 border-gray-300 rounded-lg py-3 mb-4 focus:border-blue-500 outline-none"
                        maxLength={4}
                        placeholder="••••"
                        autoFocus
                    />

                    {errorMsg && <p className="text-red-600 font-bold text-xs mb-4 animate-pulse">{errorMsg}</p>}

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => { setAuditState('LOCKED'); setErrorMsg(''); }}
                            className="text-gray-500 font-bold py-3"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={attemptUnlock}
                            className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                        >
                            DESBLOQUEAR
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto bg-white min-h-screen">
            <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="text-green-600" /> Auditoría de Campo
            </h1>

            <div className="space-y-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-medium">Casco y Botas Dieléctricas</span>
                    <input type="checkbox" defaultChecked onChange={(e) => handleChecklistChange(e.target.checked)} className="w-6 h-6 accent-green-600" />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-medium">Guantes Aislantes</span>
                    <input type="checkbox" defaultChecked onChange={(e) => handleChecklistChange(e.target.checked)} className="w-6 h-6 accent-green-600" />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-medium">Detector de Tensión</span>
                    <input type="checkbox" defaultChecked onChange={(e) => handleChecklistChange(e.target.checked)} className="w-6 h-6 accent-green-600" />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-medium">Señalización de Zona</span>
                    {/* Mock failing this item */}
                    <input type="checkbox" defaultChecked onChange={(e) => handleChecklistChange(e.target.checked)} className="w-6 h-6 accent-red-600" />
                </div>
            </div>

            <button
                onClick={submitAudit}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-colors ${score === 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
                {score === 100 ? 'APROBAR AUDITORÍA' : 'BLOQUEAR POR INCUMPLIMIENTO'}
            </button>
        </div>
    );
}
