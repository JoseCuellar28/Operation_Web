
import axios from 'axios';

const API = 'http://localhost:3000/api/v1';

async function verifyFrontendFlow() {
    console.log("🕵️ SIMULATING FRONTEND FLOW...");

    try {
        // STEP 1: Search Crew (GET /cuadrillas)
        console.log("\n1️⃣  Fetching Crews (GET /cuadrillas)...");
        const res1 = await axios.get(`${API}/cuadrillas`);
        const crews = res1.data;
        console.log(`   Found ${crews.length} crews today.`);

        const target = crews.find((c: any) => c.vehicle?.plate === 'ABC-123');
        if (!target) {
            console.error("   ❌ ERROR: Crew 'ABC-123' NOT found in the list!");
            console.log("   Dumping received plates:", crews.map((c: any) => c.vehicle?.plate));
            return;
        }
        console.log(`   ✅ Found Crew: ABC-123 (ID: ${target.id})`);

        // STEP 2: Fetch Stock (GET /crew-stock/:id)
        console.log(`\n2️⃣  Fetching Stock for ${target.id}...`);
        const res2 = await axios.get(`${API}/logistics/crew-stock/${target.id}`);
        const stock = res2.data;
        console.log(`   Found ${stock.length} stock items.`);

        if (stock.length === 0) {
            console.warn("   ⚠️ WARNING: Crew has NO stock locally. Returns might be impossible.");
            return;
        }

        const itemToReturn = stock[0];
        console.log(`   ✅ Selected Item: ${itemToReturn.nombre} (ID: ${itemToReturn.id_material}) - Qty: ${itemToReturn.cantidad}`);

        // STEP 3: Process Return (POST /return)
        console.log(`\n3️⃣  Processing Return (1 Unit - BUENO)...`);
        const payload = {
            id_cuadrilla: target.id,
            items: [
                {
                    id_material: itemToReturn.id_material,
                    cantidad: 1,
                    estado: 'BUENO'
                }
            ]
        };

        const res3 = await axios.post(`${API}/logistics/return`, payload);
        console.log("   ✅ Return Response:", res3.data);

    } catch (error: any) {
        console.error("   ❌ ERROR:", error.response?.data || error.message);
    }
}

verifyFrontendFlow();
