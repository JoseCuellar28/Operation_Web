// Re-export types from independent file
export * from '../types';

// Improved Mock Helper for chaining
const mockBuilder = (): any => {
  const p = Promise.resolve({ data: [{ id: 'mock-id-1' }], error: null });
  return Object.assign(p, {
    select: (..._args: any[]) => mockBuilder(),
    insert: (..._args: any[]) => mockBuilder(),
    update: (..._args: any[]) => mockBuilder(),
    delete: (..._args: any[]) => mockBuilder(),
    eq: (..._args: any[]) => mockBuilder(),
    single: () => Promise.resolve({ data: { id: 'mock-id-singe' }, error: null }),
  });
};

// Mock Supabase Client to avoid breaking imports that rely on it (if any remain)
export const supabase = {
  from: (_table: string) => mockBuilder(),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  }
};

/**
 * Checks connection to the Backend API (SQL Server) instead of Supabase.
 */
export const checkConnection = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5132';
    // Remove trailing /api if present to avoid duplication if the check adds it, 
    // but here we just want to ping the root or a known path. 
    // Let's ping the /api/auth/captcha endpoint as a lightweight check since we saw it in authService
    // or just the root.
    const res = await fetch(`${apiUrl}/api/auth/captcha`);
    return res.ok;
  } catch (err) {
    console.error('API connection check failed:', err);
    return false;
  }
};
