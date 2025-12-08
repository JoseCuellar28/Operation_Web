/**
 * HSE Logic - Dashboard & Inspections
 * Handles interaction with hse_dashboard.html
 */

const API_BASE = (localStorage.getItem('api_net') || 'http://localhost:5132') + "/api";

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserDisplay();
    loadHseStats();
    loadInspectionsList();
});

// --- Auth Utilities ---
function getToken() {
    return localStorage.getItem('jwt');
}

function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user_role');
    window.location.href = 'index.html';
}

function loadUserDisplay() {
    // Only basic display, real app fetches /me
    const token = getToken();
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            document.getElementById('user-display').textContent = payload.sub || "Usuario";
        } catch (e) {
            console.error("Token parse error", e);
        }
    }
}

// --- API Calls ---

async function fetchWithAuth(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        logout();
        return null;
    }

    return response;
}

async function loadHseStats() {
    try {
        const res = await fetchWithAuth('/hse/stats');
        if (res && res.ok) {
            const data = await res.json();
            document.getElementById('kpi-safe-days').textContent = data.safeDays;
            document.getElementById('kpi-inspections').textContent = data.totalInspections;
            document.getElementById('kpi-incidents').textContent = data.openIncidents;
            document.getElementById('kpi-ppe').textContent = data.ppeDeliveries;
        }
    } catch (e) {
        console.error("Error loading stats:", e);
    }
}

async function loadInspectionsList() {
    const tbody = document.getElementById('inspections-table-body');
    try {
        const res = await fetchWithAuth('/hse/inspections');
        if (res && res.ok) {
            const data = await res.json();

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400">No hay inspecciones registradas.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.map(item => `
                <tr class="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none">
                    <td class="px-6 py-4 font-mono text-xs text-slate-500">#${item.id}</td>
                    <td class="px-6 py-4 text-slate-600">${new Date(item.date).toLocaleDateString()}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">${item.type}</span></td>
                    <td class="px-6 py-4 font-medium text-slate-800">${item.referenceId || '-'}</td>
                    <td class="px-6 py-4 text-slate-600">${item.inspectorDNI}</td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center gap-1 ${getStatusColor(item.status)}">
                            <i class="fas fa-circle text-[8px]"></i> ${item.status}
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        console.error("Error loading list:", e);
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-red-400">Error al cargar datos.</td></tr>`;
    }
}

function getStatusColor(status) {
    if (status === 'Submitted' || status === 'Approved') return 'text-green-600';
    if (status === 'Draft') return 'text-slate-500';
    if (status === 'Flagged') return 'text-red-600';
    return 'text-blue-600';
}

// --- Modal Logic ---

function openInspectionModal() {
    document.getElementById('modal-inspection').classList.add('active');
}

function closeInspectionModal() {
    document.getElementById('modal-inspection').classList.remove('active');
    document.getElementById('inspection-form').reset();
}

async function handleInspectionSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    // Get DNI from token for InspectorDNI
    const token = getToken();
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userDNI = payload.sub;

    const body = {
        inspectorDNI: userDNI,
        type: formData.get('type'),
        referenceId: formData.get('reference'),
        comments: formData.get('comments'),
        score: 100 // Default score for quick input
    };

    try {
        const res = await fetchWithAuth('/hse/inspections', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (res && res.ok) {
            closeInspectionModal();
            loadHseStats(); // Refresh KPIs
            loadInspectionsList(); // Refresh Table
            // Optional: Show toast success
        } else {
            alert("Error al guardar inspección");
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión");
    }
}
