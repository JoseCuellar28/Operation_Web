export interface User {
    idEmpleado: number;
    dni: string;
    nombre: string;
    email?: string;
    telefono?: string;
    idArea?: number; // Backend uses IdArea
    idUnidad?: number; // Backend uses IdUnidad
    // Legacy mappings handled in UI layer if needed, or mapped here if backend provides them directly
    area?: string; // Mapped from DB 'area'
    division?: string; // Mapped from DB 'division'
    cargo?: string; // Mapped from 'rol' or calculated
    rol?: string;
    photoUrl?: string;
    estadoOperativo?: string;
    fechaInicio?: string; // ISO Date
    distrito?: string;
    codigoCebe?: string;
    active?: boolean;
}

export interface LoginResponse {
    token: string;
    expiration: string;
    mustChangePassword?: boolean;
    user?: User; // Optional if backend returns user info in login response
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialLoading: boolean; // New: prevents checking me before storage read
    mustChangePassword?: boolean;
}

export interface LoginRequest {
    Username: string;
    Password: string;
    CaptchaId?: string;
    CaptchaAnswer?: string;
    Platform: 'web';
}
