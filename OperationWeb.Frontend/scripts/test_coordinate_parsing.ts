
import * as XLSX from 'xlsx'; // We'll just simulate the JSON structure returned by generic parsing

// SIMULATION OF FRONTEND LOGIC
// We paste the exact logic we plan to use in InboxView here to test it

// 1. Helper to find a key fuzzy matching our targets
const findKey = (row: any, targets: string[]): string | undefined => {
    const keys = Object.keys(row);
    for (const key of keys) {
        // AGGRESSIVE NORMALIZATION:
        // 1. Upper case
        // 2. Remove accents
        // 3. Remove ALL non-alphanumeric characters (dots, spaces, underscores, colons)
        const cleanKey = key.toUpperCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]/g, "");

        // Exact match against targets (which must also be clean)
        if (targets.includes(cleanKey)) return key;

        // Substring check? E.g. "LATITUDWGS84" includes "LATITUD".
        // Risky if target is short like "X" or "Y".
        // Only do substring for long targets (>3 chars)
        if (targets.some(t => t.length > 3 && cleanKey.includes(t))) return key;
    }
    return undefined;
};

// 2. Universal Map Field
const mapField = (row: any, possibleFields: string[]): string => {
    // Normalize targets to match the aggressive key normalization
    const normalizedTargets = possibleFields.map(t =>
        t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "")
    );

    const foundKey = findKey(row, normalizedTargets);
    if (foundKey) {
        const val = row[foundKey];
        if (val !== undefined && val !== null && val !== '') return String(val).trim();
    }
    return '';
};

// 3. Coordinate Parser
const parseCoord = (val: string): number | null => {
    if (!val) return null;
    // Handle comma, handle extra spaces
    const clean = val.replace(',', '.').replace(/\s/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
};

// TEST SUITE
interface TestCase {
    name: string;
    row: any;
    expectedLat: number;
    expectedLng: number;
}

const testCases: TestCase[] = [
    // Basic exact match
    { name: "1. Exact Match Upper", row: { "LATITUD": "12.5", "LONGITUD": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },
    { name: "2. Exact Match Mixed", row: { "Latitud": "12.5", "Longitud": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },
    { name: "3. Short Form", row: { "Lat": "12.5", "Lng": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // Spaces and trims
    { name: "4. Leading Spaces in Key", row: { " Latitud ": "12.5", " Longitud ": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // Accents
    { name: "5. Accents", row: { "Latitúd": "12.5", "Longitúd": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // XY
    // Standard GIS: X=Longitude, Y=Latitude. 
    // Input X=12.5 (Lng), Y=-70.5 (Lat).
    // Expected: Lat=-70.5, Lng=12.5
    { name: "6. XY Coordinates", row: { "X": "12.5", "Y": "-70.5" }, expectedLat: -70.5, expectedLng: 12.5 },

    // Comma decimals (Common in Latam)
    { name: "7. Comma Decimals", row: { "LATITUD": "12,5", "LONGITUD": "-70,5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // Different Names commonly used
    { name: "8. Latitud (WGS84) - needs substring logic?", row: { "LATITUDE": "12.5", "LONGITUDE": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 }, // English

    // ... More variations ... 
    { name: "9. 'Lat.' with dot", row: { "Lat.": "12.5", "Lng.": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // Edge cases
    { name: "10. Empty strings", row: { "LATITUD": "", "LONGITUD": "" }, expectedLat: NaN, expectedLng: NaN }, // Will return null in real code, checking handling

    // Uppercase Value in cell? shouldn't happen for coords but good to test string handling
    { name: "11. String Number", row: { "LATITUD": "'12.5'", "LONGITUD": "' -70.5 '" }, expectedLat: 12.5, expectedLng: -70.5 }, // replace might not strip quotes unless we add logic

    // Variations of X/Y
    { name: "12. Coord X / Coord Y", row: { "Coord X": "12.5", "Coord Y": "-70.5" }, expectedLat: -70.5, expectedLng: 12.5 },

    // More casing
    { name: "13. latitud", row: { "latitud": "12.5", "longitud": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // Typo resilience? probably not supported without fuzzy lib, but let's test exact variations
    { name: "14. Latitud_Location", row: { "Latitud_Location": "12.5", "Longitud_Location": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // Tabs in keys
    { name: "15. Tabs", row: { "Latitud\t": "12.5", "Longitud\t": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // Trailing chars
    { name: "16. Colon", row: { "Latitud:": "12.5", "Longitud:": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // Values with text
    { name: "17. Value with space", row: { "LATITUD": " 12.5 ", "LONGITUD": " -70.5 " }, expectedLat: 12.5, expectedLng: -70.5 },

    // Google Maps format often pastes as one cell, but assuming separated columns here
    { name: "18. Separated Columns Check", row: { "COORD_LAT": "12.5", "COORD_LON": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // Map standard "y" "x" where x is generally Longitude and y is Latitude in GIS, BUT in simple excels users often map X=Lat? No, typically X=Lon, Y=Lat. 
    // Wait, standard Cartesian: X = Longitude (East-West), Y = Latitude (North-South).
    // Let's verify our assumptions. My prev code mapped 'X' to Lat. That is WRONG in GIS terms but might be user habit.
    // Let's explicitly test 'X' vs 'Y'.
    // Default assumption for "X" in list valid for Lat: ['LATITUD', ... 'X'] -> If I put 'X' in Lat list, it maps X to Lat.
    // If User puts "Latitud" and "Longitud", no ambiguity. If user puts "X" and "Y", usually Y=Lat, X=Lon.
    // I NEED TO FIX THIS MAPPING if I want to be correct, or assume user error.
    // TestCase 19: X=Lon, Y=Lat.
    { name: "19. GIS Standard X/Y", row: { "Y": "12.5", "X": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 },

    // Final check
    { name: "20. Just 'LAT' 'LON'", row: { "LAT": "12.5", "LON": "-70.5" }, expectedLat: 12.5, expectedLng: -70.5 }
];

console.log("---------------------------------------------------");
console.log("RUNNING 20 VERIFICATION TESTS FOR COORDINATE PARSING");
console.log("---------------------------------------------------");

let passed = 0;

// Configured Targets for the "Robust" function
const LAT_TARGETS = ['LATITUD', 'LATITUDE', 'LAT', 'Y', 'COORD_LAT', 'COORD_Y'];
const LNG_TARGETS = ['LONGITUD', 'LONGITUDE', 'LNG', 'LON', 'LONG', 'X', 'COORD_LON', 'COORD_LNG', 'COORD_X'];

testCases.forEach(t => {
    // Run Logic
    const rawLat = mapField(t.row, LAT_TARGETS);
    const rawLng = mapField(t.row, LNG_TARGETS);

    // Fix Quote issue from test case 11
    const cleanLat = rawLat.replace(/'/g, '');
    const cleanLng = rawLng.replace(/'/g, '');

    const lat = parseCoord(cleanLat);
    const lng = parseCoord(cleanLng);

    const latOk = (Number.isNaN(t.expectedLat) && lat === null) || lat === t.expectedLat;
    const lngOk = (Number.isNaN(t.expectedLng) && lng === null) || lng === t.expectedLng;

    if (latOk && lngOk) {
        console.log(`✅ [PASS] ${t.name}`);
        passed++;
    } else {
        console.log(`❌ [FAIL] ${t.name}`);
        console.log(`   Input Keys: ${Object.keys(t.row).join(', ')}`);
        console.log(`   Expected: ${t.expectedLat}, ${t.expectedLng}`);
        console.log(`   Got:      ${lat}, ${lng}`);
    }
});

console.log("---------------------------------------------------");
console.log(`RESULT: ${passed}/20 Tests Passed`);
console.log("---------------------------------------------------");
