// Login Manager Class
// Restoration of Dynamic Configuration (User Request) - Priority Fix: Console (localStorage) wins over Config
const API_NET = localStorage.getItem('api_net') || (window.APP_CONFIG && window.APP_CONFIG.API_URL) || 'https://operationweb-api-815a0eaa.azurewebsites.net';
class LoginManager {
    constructor() {
        console.log('🏗️ Constructor LoginManager iniciado');
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = document.querySelector('.btn-login');
        this.messageContainer = document.getElementById('messageContainer');

        console.log('📝 Elementos del DOM encontrados:');
        console.log('  - Formulario:', this.form);
        console.log('  - Usuario:', this.usernameInput);
        console.log('  - Contraseña:', this.passwordInput);
        console.log('  - Botón:', this.submitButton);
        console.log('  - Contenedor mensajes:', this.messageContainer);

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupImageSlider();
        console.log('🔐 Login Manager inicializado');
    }

    setupEventListeners() {
        // Event listener para el formulario
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Event listener para el toggle de contraseña
        if (this.passwordToggle) {
            this.passwordToggle.addEventListener('click', () => this.togglePassword());
        }

        // Event listeners para validación en tiempo real
        if (this.usernameInput) {
            this.usernameInput.addEventListener('input', () => this.validateForm());
        }

        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', () => this.validateForm());
        }

        // Event listener para tecla Enter
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.form) {
                this.handleSubmit(e);
            }
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log('🚀 Formulario enviado');

        if (this.validateForm()) {
            console.log('✅ Formulario válido, procediendo con autenticación');
            const username = this.usernameInput.value.trim();
            const password = this.passwordInput.value.trim();

            console.log('👤 Usuario:', username);
            console.log('🔑 Contraseña:', password);

            this.setLoadingState(true);
            this.authenticate(username, password);
        } else {
            console.log('❌ Formulario inválido');
        }
    }

    validateForm() {
        console.log('🔍 Validando formulario...');
        let isValid = true;

        // Validar usuario
        if (!this.usernameInput.value.trim()) {
            console.log('❌ Usuario vacío');
            this.showFieldError(this.usernameInput, 'El usuario es obligatorio');
            isValid = false;
        } else {
            console.log('✅ Usuario válido');
            this.clearFieldError(this.usernameInput);
        }

        // Validar contraseña
        if (!this.passwordInput.value.trim()) {
            console.log('❌ Contraseña vacía');
            this.showFieldError(this.passwordInput, 'La contraseña es obligatoria');
            isValid = false;
        } else {
            console.log('✅ Contraseña válida');
            this.clearFieldError(this.passwordInput);
        }

        console.log('📋 Formulario válido:', isValid);
        return isValid;
    }

    showFieldError(input, message) {
        const fieldContainer = input.closest('.form-group');
        let errorElement = fieldContainer.querySelector('.field-error');

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error text-danger mt-1';
            fieldContainer.appendChild(errorElement);
        }

        errorElement.textContent = message;
        input.classList.add('is-invalid');
    }

    clearFieldError(input) {
        const fieldContainer = input.closest('.form-group');
        const errorElement = fieldContainer.querySelector('.field-error');

        if (errorElement) {
            errorElement.remove();
        }

        input.classList.remove('is-invalid');
    }

    setLoadingState(loading) {
        if (loading) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = DOMPurify.sanitize('<i class="fas fa-spinner fa-spin me-2"></i>Iniciando sesión...');
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = DOMPurify.sanitize('<i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión');
        }
    }

    authenticate(username, password) {
        const urls = [
            `${API_NET}/api/auth/login`
        ];
        const cid = localStorage.getItem('captcha_id') || '';
        const cans = (document.getElementById('captchaAnswer')?.value || '').trim();
        const body = JSON.stringify({ Username: username, Password: password, CaptchaId: cid, CaptchaAnswer: cans, Platform: 'web' });
        const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };
        (async () => {
            let errorType = '';
            for (let u of urls) {
                try {
                    const r = await fetch(u, opts);
                    if (r.status === 401) { errorType = 'auth'; continue; }
                    if (!r.ok) { errorType = r.status === 400 ? 'captcha' : 'network'; continue; }
                    const data = await r.json();
                    const token = data.token || '';
                    if (!token) break;
                    localStorage.setItem('jwt', token);
                    localStorage.setItem('sesionActiva', '1');
                    localStorage.setItem('usuario', username);
                    try {
                        const meResp = await fetch(`${API_NET}/api/auth/me`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
                        if (meResp.ok) {
                            const me = await meResp.json();
                            if (me && me.fullName) localStorage.setItem('fullName', me.fullName);
                            if (me && me.company) localStorage.setItem('company', me.company);
                            if (me && me.role) localStorage.setItem('role', me.role);
                        }
                    } catch { }
                    if (!localStorage.getItem('fullName')) {
                        const map = {
                            'jose.arbildo': { fullName: 'Jose Arbildo Cuellar', company: 'Ferreyros', role: 'Admin' },
                            'edward.vega': { fullName: 'Edward Vega Vergara', company: 'Siderperu', role: 'Usuario' },
                            'eder.torres': { fullName: 'Eder Torres Gonzales', company: 'V&V', role: 'Usuario' }
                        };
                        const m = map[username];
                        if (m) {
                            localStorage.setItem('fullName', m.fullName);
                            localStorage.setItem('company', m.company);
                            localStorage.setItem('role', m.role);
                        }
                    }
                    if (data.mustChangePassword) {
                        this.showMessage('Debes cambiar tu contraseña', 'warning');
                        this.setLoadingState(false);
                        this.showChangePasswordModal(token);
                        return;
                    }

                    this.showMessage('¡Login exitoso!', 'success');
                    setTimeout(() => { window.location.href = 'menu_moderno.html'; }, 500);
                    return;
                } catch (e) {
                    errorType = 'network';
                }
            }
            if (errorType === 'auth') {
                this.showMessage('Credenciales incorrectas', 'error');
            } else if (errorType === 'captcha') {
                this.showMessage('Captcha incorrecto', 'error');
                try { refreshCaptcha(); } catch { }
            } else {
                this.showMessage('Servicio no disponible', 'error');
            }
            this.setLoadingState(false);
        })();
    }

    togglePassword() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;

        const icon = this.passwordToggle.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    showMessage(message, type) {
        if (!this.messageContainer) return;

        this.messageContainer.innerHTML = DOMPurify.sanitize(`
            <div class="alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);

        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                const alert = this.messageContainer.querySelector('.alert');
                if (alert) {
                    alert.remove();
                }
            }, 3000);
        }
    }

    loadSavedCredentials() {
        const savedUser = localStorage.getItem('remember_user');
        const savedPass = localStorage.getItem('remember_pass');
        const shouldRemember = localStorage.getItem('remember_me') === 'true';

        if (shouldRemember && savedUser && this.usernameInput) {
            this.usernameInput.value = savedUser;
            if (this.rememberMeCheckbox) this.rememberMeCheckbox.checked = true;

            if (savedPass && this.passwordInput) {
                try {
                    this.passwordInput.value = atob(savedPass);
                } catch (e) {
                    console.error('Error decoding password', e);
                }
            }
        }
    }

    setupImageSlider() {
        const slides = document.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        let currentSlide = 0;
        const totalSlides = slides.length;

        function showSlide(index) {
            // Ocultar todas las slides
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));

            // Mostrar la slide actual
            slides[index].classList.add('active');
            indicators[index].classList.add('active');
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        }

        // Event listeners para botones
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Event listeners para indicadores
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });

        // Auto-play cada 5 segundos
        setInterval(nextSlide, 5000);
    }

    showChangePasswordModal(token) {
        const modalEl = document.getElementById('changePasswordModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        const form = document.getElementById('changePasswordForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const oldPass = document.getElementById('oldPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmNewPassword').value;

            if (newPass !== confirmPass) {
                alert('Las contraseñas no coinciden');
                return;
            }

            try {
                const res = await fetch(`${API_NET}/api/auth/change-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
                });

                if (res.ok) {
                    alert('Contraseña actualizada. Por favor inicia sesión nuevamente.');
                    modal.hide();
                    // Clear fields
                    this.passwordInput.value = '';
                    // Optionally refresh page or just let them login again
                } else {
                    const txt = await res.text();
                    alert('Error: ' + txt);
                }
            } catch (err) {
                console.error(err);
                alert('Error de conexión');
            }
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    console.log('📋 DOM cargado, iniciando login...');
    new LoginManager();
});

// Timestamp: dom 10 ago 2025 04:15:00 -05 - Redirección corregida al puerto 8080 // Forzar recarga - dom 10 ago 2025 14:08:23 -05
