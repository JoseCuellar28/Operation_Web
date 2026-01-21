import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ConnectionBanner from '../components/ConnectionBanner';
import { checkConnection } from '../connections/supabase';

const MainLayout = () => {
    const [isConnected, setIsConnected] = React.useState<boolean | null>(null);
    const [isChecking, setIsChecking] = React.useState(true);

    React.useEffect(() => {
        const verifyConnection = async () => {
            // Re-enabling connection check which was commented out by intruder
            // Assuming this is safe and available as per original plan
            const connected = await checkConnection();
            setIsConnected(connected);
            setIsChecking(false);
        };
        verifyConnection();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 flex-col">
            <ConnectionBanner isConnected={isConnected} isChecking={isChecking} />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
