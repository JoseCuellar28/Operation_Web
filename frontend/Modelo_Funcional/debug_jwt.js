// DEBUG: Add this to browser console to check JWT token
const jwt = localStorage.getItem('jwt');
console.log('JWT Token exists:', !!jwt);
if (jwt) {
    try {
        const parts = jwt.split('.');
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        console.log('Token role:', payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Token expired:', new Date(payload.exp * 1000) < new Date());
    } catch (e) {
        console.error('Error parsing token:', e);
    }
} else {
    console.error('No JWT token found in localStorage');
}
