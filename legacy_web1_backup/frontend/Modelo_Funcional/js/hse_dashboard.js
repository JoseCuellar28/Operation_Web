
const API_BASE = 'http://localhost:5132/api';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadHseStats();
    loadInspections();

    // Setup UI
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    document.getElementById('userName').textContent = userData.dni || 'Usuario';
    document.getElementById('userRole').textContent = userData.role || 'Rol';
});

async function loadHseStats() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/hse/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            document.getElementById('safeDays').textContent = data.safeDays;
            document.getElementById('totalInspections').textContent = data.totalInspections;
            document.getElementById('openIncidents').textContent = data.openIncidents;
            document.getElementById('ppeDeliveries').textContent = data.ppeDeliveries;
        }
    } catch (e) {
        console.error("Error loading stats", e);
    }
}

async function loadInspections() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/hse/inspections`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const list = await res.json();
            const tbody = document.getElementById('inspectionsTableBody');
            tbody.innerHTML = '';

            list.forEach(i => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="ps-4 fw-bold">#${i.id}</td>
                    <td>${new Date(i.date).toLocaleDateString()}</td>
                    <td><span class="badge bg-light text-dark border">${i.type}</span></td>
                    <td>${i.referenceId}</td>
                    <td>${getStatusBadge(i.status)}</td>
                    <td>${i.score || 0}%</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error("Error loading inspections", e);
    }
}

function getStatusBadge(status) {
    if (status === 'Submitted') return '<span class="badge bg-success">Enviado</span>';
    if (status === 'Draft') return '<span class="badge bg-secondary">Borrador</span>';
    return `<span class="badge bg-primary">${status}</span>`;
}

async function createInspection() {
    const type = document.getElementById('inspType').value;
    const ref = document.getElementById('inspRef').value;
    const comments = document.getElementById('inspComments').value;
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    const payload = {
        inspectorDNI: userData.dni || 'Unknown',
        type: type,
        referenceId: ref,
        comments: comments,
        status: 'Submitted',
        score: 100 // Default for now
    };

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/hse/inspections`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Inspección guardada correctamente');
            const modal = bootstrap.Modal.getInstance(document.getElementById('newInspectionModal'));
            modal.hide();
            loadInspections();
            loadHseStats();
        } else {
            alert('Error al guardar');
        }
    } catch (e) {
        console.error(e);
        alert('Error de conexión');
    }
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}
