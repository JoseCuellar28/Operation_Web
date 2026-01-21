/**
 * Utility functions for Excel data processing
 * Ported from legacy dashboard_moderno.js
 */

export const excelDateToJSDate = (serial: number | string | null | undefined): Date | null => {
    if (!serial) return null;

    // If it's a number (Excel serial date)
    // Excel base date: Dec 30 1899 (usually). JS base date: Jan 1 1970.
    // Difference is 25569 days.
    // 86400 seconds/day * 1000 ms/second
    if (typeof serial === 'number') {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);

        // Adjust for timezone offset to get the correct local date
        const fractional_day = serial - Math.floor(serial) + 0.0000001;
        const total_seconds = Math.floor(86400 * fractional_day);
        const seconds = total_seconds % 60;
        const minutes = Math.floor(total_seconds / 60) % 60;
        const hours = Math.floor(total_seconds / (60 * 60));

        return new Date(date_info.getUTCFullYear(), date_info.getUTCMonth(), date_info.getUTCDate(), hours, minutes, seconds);
    }

    // If it's already a string, try parsing it
    if (typeof serial === 'string') {
        // Try parsing DD/MM/YYYY or YYYY-MM-DD
        const d = new Date(serial);
        if (!isNaN(d.getTime())) return d;
    }

    return null;
};

export const normalizeColumnName = (name: string): string => {
    return name.toUpperCase().trim().replace(/_/g, ' ').replace(/\s+/g, ' ');
};
