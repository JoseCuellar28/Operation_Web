import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, RefreshCw, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Captcha State
    const [captchaId, setCaptchaId] = useState('');
    const [captchaImage, setCaptchaImage] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Initial redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Preventative Flow: Load Captcha on Mount
    useEffect(() => {
        fetchCaptcha();
    }, []);

    const fetchCaptcha = async () => {
        try {
            const data = await authService.getCaptcha();
            setCaptchaId(data.id);
            setCaptchaImage(data.image);
            setCaptchaAnswer(''); // Reset answer on refresh
        } catch (err) {
            console.error("Failed to load captcha", err);
            // Non-blocking, can retry
            setError('No se pudo cargar el código de seguridad. Intente recargar.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login({
                Username: username,
                Password: password,
                Platform: 'web',
                CaptchaId: captchaId,
                CaptchaAnswer: captchaAnswer,
            });
            // Login successful
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Login error", err);
            // Determine error based on status or logic
            if (err.response?.status === 401) {
                setError('Credenciales inválidas. Intente nuevamente.');
                setPassword(''); // Security best practice
            } else if (err.response?.status === 400) {
                setError('Código de seguridad incorrecto.');
                setCaptchaAnswer('');
            } else {
                setError('Error al conectar con el servidor.');
            }
            // Always refresh captcha on failure to prevent replay attacks
            await fetchCaptcha();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-inter">
            {/* Left Side - Image (Full Height Split) */}
            <div className="hidden lg:flex w-1/2 bg-blue-900 relative items-center justify-center overflow-hidden">
                {/* Construction Site Image matching User's uploaded reference request */}
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
                        Gestión integral de operaciones de campo, control de calidad y equipos de trabajo.
                    </p>
                    <div className="mt-12 flex justify-center gap-3">
                        <div className="h-1.5 w-12 bg-blue-400 rounded-full"></div>
                        <div className="h-1.5 w-3 bg-white/20 rounded-full"></div>
                        <div className="h-1.5 w-3 bg-white/20 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form (Full Height Split) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
                        <p className="text-gray-500 mt-2">Ingresa tus credenciales para acceder</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usuario / DNI</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                                        placeholder="Ej. 41007510"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                                        placeholder="••••••••"
                                        required
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

                            {/* Captcha - Integrated Design */}
                            {captchaImage && (
                                <div className="pt-2 animate-in fade-in zoom-in duration-300">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1 mb-2 block">Código de Seguridad</label>
                                    <div className="relative rounded-xl border border-gray-200 bg-white p-1.5 flex items-center gap-3 shadow-sm group hover:border-blue-300 transition-colors cursor-text" onClick={() => document.getElementById('captcha-input')?.focus()}>
                                        <div className="relative flex-none h-11 w-32 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                                            <img
                                                src={captchaImage}
                                                alt="Security Check"
                                                className="h-full w-full object-cover opacity-90 mix-blend-multiply"
                                            />
                                        </div>

                                        <input
                                            id="captcha-input"
                                            type="text"
                                            value={captchaAnswer}
                                            onChange={(e) => setCaptchaAnswer(e.target.value)}
                                            className="flex-1 min-w-0 bg-transparent py-2 px-1 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none tracking-widest uppercase font-mono"
                                            placeholder="CÓDIGO"
                                            maxLength={6}
                                            required
                                        />

                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); fetchCaptcha(); }}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-none"
                                            title="Generar nuevo código"
                                        >
                                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                                    Recordarme
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99] hover:shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    <span>Ingresando...</span>
                                </>
                            ) : (
                                'Ingresar'
                            )}
                        </button>
                    </form>

                    <div className="mt-12 border-t border-gray-100 pt-6 text-center">
                        <p className="text-xs text-gray-400 font-medium">Web 2.0 Core &copy; {new Date().getFullYear()} OperationSmart</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
