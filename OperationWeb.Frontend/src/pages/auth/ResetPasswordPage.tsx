import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { userService } from '../../services/userService';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const token = searchParams.get('token') || '';
    const isActivation = location.pathname.includes('/activate');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token de acceso no encontrado.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setIsLoading(true);

        try {
            if (isActivation) {
                await userService.activate(token, password);
                setSuccess('¡Cuenta activada con éxito! Ahora puedes iniciar sesión.');
            } else {
                await userService.resetPassword(token, password);
                setSuccess('Contraseña restablecida con éxito.');
            }

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            console.error("Action error", err);
            setError(err.response?.data?.message || 'Error al procesar la solicitud. El enlace puede haber expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-inter">
            {/* Left Side - Image (Consistent with Login) */}
            <div className="hidden lg:flex w-1/2 bg-blue-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply"></div>

                <div className="relative z-10 text-center px-12 max-w-xl">
                    <div className="mb-8 flex justify-center">
                        <div className="h-16 w-16 bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-2xl">
                            <Lock className="text-blue-100" size={32} />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Operation Smart</h2>
                    <p className="text-blue-100 text-lg leading-relaxed font-light">
                        {isActivation ? 'Configuración de acceso inicial para nuevos colaboradores.' : 'Recuperación de acceso al sistema.'}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isActivation ? 'Activar Cuenta' : 'Restablecer Contraseña'}
                        </h1>
                        <p className="text-gray-500 mt-2">
                            {isActivation
                                ? 'Establece tu contraseña permanente para comenzar.'
                                : 'Ingresa tu nueva contraseña para recuperar el acceso.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start gap-3 shadow-sm">
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-start gap-3 shadow-sm">
                                <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{success}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nueva Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                                        placeholder="Min. 6 caracteres"
                                        required
                                        disabled={!!success}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                                        placeholder="Repite la contraseña"
                                        required
                                        disabled={!!success}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !!success || !token}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 transform active:scale-[0.99]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                isActivation ? 'Activar Cuenta' : 'Cambiar Contraseña'
                            )}
                        </button>
                    </form>

                    <div className="mt-12 border-t border-gray-100 pt-6 text-center">
                        <p className="text-xs text-gray-400 font-medium tracking-tight">
                            ¿Ya tienes una cuenta activa? <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">Inicia sesión aquí</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
