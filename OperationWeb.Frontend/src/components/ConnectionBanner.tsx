import { WifiOff } from 'lucide-react';

interface ConnectionBannerProps {
    isConnected: boolean | null;
    isChecking: boolean;
}

const ConnectionBanner = ({ isConnected, isChecking }: ConnectionBannerProps) => {
    if (isChecking) {
        return null; // Don't show anything while checking to avoid flicker usually, or show a loading state if preferred.
        // Ideally we might want a small indicator, but for a banner, silence is golden until error.
    }

    if (isConnected === true) {
        return null; // Everything is fine
    }

    return (
        <div className="bg-red-600 text-white px-4 py-3 shadow-md relative flex items-center justify-center gap-3">
            <WifiOff className="w-6 h-6" />
            <div className="flex flex-col">
                <span className="font-bold">Error de Conexión</span>
                <span className="text-sm">
                    No se pudo conectar a la base de datos. Por favor verifica tu configuración de internet y las credenciales.
                </span>
            </div>
        </div>
    );
};

export default ConnectionBanner;
