import { useState, useEffect } from 'react';
import {
    Activity,
    Truck,
    Map,
    AlertTriangle,
    Trophy,
    TrendingUp,
    AlertOctagon,
    Gauge
} from 'lucide-react';
import api from '../../services/api';

interface FleetStats {
    total_km_traveled: number;
    active_vehicles: number;
    total_vehicles: number;
    utilization_rate: number;
}

interface DriverScore {
    placa: string;
    speeding_count: number;
    geofence_count: number;
    safety_score: number;
    status: 'EXCELENTE' | 'REGULAR' | 'RIESGOSO';
}

export default function FleetAnalyticsView() {
    const [stats, setStats] = useState<FleetStats | null>(null);
    const [leaderboard, setLeaderboard] = useState<DriverScore[]>([]);

    useEffect(() => {
        fetchStats();
        fetchScores();
        // Refresh every 30s
        const interval = setInterval(() => {
            fetchStats();
            fetchScores();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/v1/analytics/stats');
            setStats(res.data);
        } catch (e) {
            console.error('Error fetching stats', e);
        }
    };

    const fetchScores = async () => {
        try {
            const res = await api.get('/api/v1/analytics/fleet-score');
            const data = res.data;
            // Sort by worst score first for visibility of risk
            setLeaderboard(data.sort((a: DriverScore, b: DriverScore) => a.safety_score - b.safety_score));
        } catch (e) {
            console.error('Error fetching scores', e);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (!stats) return <div className="p-8 text-center text-gray-500">Cargando Analítica...</div>;

    return (
        <div className="p-6 h-full overflow-auto bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-600" /> Analítica de Comportamiento
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Uso de Flota</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.utilization_rate}%</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            {stats.active_vehicles} activos de {stats.total_vehicles}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Activity />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Recorrido Total (Acum)</p>
                        <p className="text-2xl font-bold text-gray-900">{(stats.total_km_traveled || 0).toLocaleString()} km</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                        <Map />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Conductores Críticos</p>
                        <p className="text-2xl font-bold text-red-600">
                            {leaderboard.filter(d => d.safety_score < 70).length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Score &lt; 70</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                        <AlertTriangle />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Flota Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_vehicles}</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600">
                        <Truck />
                    </div>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="text-yellow-500" /> Ranking de Seguridad
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Ordenado por: Mayor Riesgo
                    </span>
                </div>

                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ranking</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vehículo</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-1/3">Safety Score (0-100)</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Excesos Velocidad</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Violaciones Geocerca</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {leaderboard.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    No hay datos de comportamiento registrados aún.
                                </td>
                            </tr>
                        ) : (
                            leaderboard.map((driver, index) => (
                                <tr key={driver.placa} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`font-bold text-lg ${index < 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                                            #{index + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{driver.placa}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${getScoreBarColor(driver.safety_score)}`}
                                                    style={{ width: `${driver.safety_score}%` }}
                                                />
                                            </div>
                                            <span className={`font-bold ${getScoreColor(driver.safety_score)} w-8`}>
                                                {driver.safety_score}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        {driver.speeding_count > 0 ? (
                                            <span className="text-red-600 font-bold flex items-center justify-center gap-1">
                                                <Gauge size={14} /> {driver.speeding_count}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        {driver.geofence_count > 0 ? (
                                            <span className="text-red-600 font-bold flex items-center justify-center gap-1">
                                                <AlertOctagon size={14} /> {driver.geofence_count}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border
                                            ${driver.safety_score >= 90 ? 'bg-green-100 text-green-800 border-green-200' :
                                                driver.safety_score >= 70 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    'bg-red-100 text-red-800 border-red-200'}
                                        `}>
                                            {driver.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
