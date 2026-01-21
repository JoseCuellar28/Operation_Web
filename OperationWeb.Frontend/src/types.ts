export interface Employee {
    id: string;
    name: string;
    photo_url: string | null;
    phone: string | null;
    role: string;
    active: boolean;
    estado_operativo?: string;
    created_at: string;
    updated_at: string;
}

export interface AttendanceRecord {
    id: string;
    employee_id: string;
    check_in_time: string;
    location_lat: number | null;
    location_lng: number | null;
    location_address: string | null;
    health_status: string;
    system_status: string;
    whatsapp_sync: boolean;
    sync_date: string | null;
    notes: string | null;
    date: string;
    created_at: string;
    gps_justification?: string | null;
    alert_status?: string;
    resolved_by?: string | null;
    resolved_at?: string | null;
    resolution_notes?: string | null;
    employee?: Employee;
}

export interface Vehicle {
    id: string;
    plate: string;
    model: string;
    status: 'operativo' | 'taller';
    capacity: number;
    created_at: string;
    updated_at: string;
}

export interface Zone {
    id: string;
    name: string;
    code: string;
    created_at: string;
}

export interface WorkProfile {
    id: string;
    name: string;
    code: string;
    description: string;
    default_material_kit_id?: number | string;
    default_document_kit_id?: number | string;
    created_at: string;
}

export interface MaterialKit {
    id: string;
    name: string;
    code: string;
    description: string;
    items: string[];
    created_at: string;
}

export interface DocumentKit {
    id: string;
    name: string;
    code: string;
    description: string;
    forms: string[];
    created_at: string;
}

export interface Crew {
    id: string;
    code: string;
    name?: string; // Added for dispatch view compatibility
    current_capacity?: number;
    max_capacity?: number;
    zone_id: string;
    leader_id: string;
    assistant_id: string | null;
    vehicle_id: string;
    work_profile_id: string;
    material_kit_id: string;
    document_kit_id: string;
    status: 'draft' | 'published' | 'active' | 'completed';
    published_at: string | null;
    created_at: string;
    updated_at: string;
    zone?: Zone;
    leader?: Employee;
    assistant?: Employee;
    vehicle?: Vehicle;
    work_profile?: WorkProfile;
    material_kit?: MaterialKit;
    document_kit?: DocumentKit;
}
