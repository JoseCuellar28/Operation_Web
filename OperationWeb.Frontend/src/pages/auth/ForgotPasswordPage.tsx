import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function ForgotPasswordPage() {
    const [dniOrEmail, setDniOrEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            await authService.forgotPassword(dniOrEmail);
            setMessage({
                type: 'success',
                text: 'Si el DNI o correo existe, recibirás un email con instrucciones para restablecer tu contraseña.'
            });
            setDniOrEmail('');
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error al procesar la solicitud. Inténtalo de nuevo.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Recuperar Contraseña
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Ingresa tu DNI o correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {message && (
                        <div
                            className={`rounded-md p-4 ${message.type === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                        >
                            <p className="text-sm">{message.text}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="dniOrEmail" className="sr-only">
                            DNI o Correo Electrónico
                        </label>
                        <input
                            id="dniOrEmail"
                            name="dniOrEmail"
                            type="text"
                            required
                            value={dniOrEmail}
                            onChange={(e) => setDniOrEmail(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            placeholder="DNI o Correo Electrónico"
                        />
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Volver al Inicio de Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
