
import { getConnection } from '../src/connections/sql';

async function updateProfileDefaults() {
    try {
        const pool = await getConnection();
        const request = pool.request();

        // 1. Instalación HFC (id_perfil=1) -> Kit HFC Básico (id_kit=4) + Acta (id_formato=1)
        await request.query(`UPDATE PERFILES_TRABAJO SET id_kit_material = 4, id_kit_documento = 1 WHERE id_perfil = 1`);

        // 2. Instalación FTTH (id_perfil=2) -> Kit FTTH Premium (id_kit=5) + Acta (1)
        await request.query(`UPDATE PERFILES_TRABAJO SET id_kit_material = 5, id_kit_documento = 1 WHERE id_perfil = 2`);

        // 3. Mantenimiento HFC (id_perfil=3) -> Kit Mant. Básico (id_kit=2) + Boleta (3)
        await request.query(`UPDATE PERFILES_TRABAJO SET id_kit_material = 2, id_kit_documento = 3 WHERE id_perfil = 3`);

        // 4. Mantenimiento FTTH (id_perfil=4) -> Kit Mant. Gral (id_kit=6) + Boleta (3)
        await request.query(`UPDATE PERFILES_TRABAJO SET id_kit_material = 6, id_kit_documento = 3 WHERE id_perfil = 4`);

        // 5. Postventa (id_perfil=5) -> Kit Mant. Básico (2) + Checklist (2)
        await request.query(`UPDATE PERFILES_TRABAJO SET id_kit_material = 2, id_kit_documento = 2 WHERE id_perfil = 5`);

        // 6. Averías (id_perfil=6) -> Kit Mant. Gral (6) + Boleta (3)
        await request.query(`UPDATE PERFILES_TRABAJO SET id_kit_material = 6, id_kit_documento = 3 WHERE id_perfil = 6`);

        console.log('✅ Default kits assigned successfully.');
        await pool.close();
    } catch (err) {
        console.error('Error updating defaults:', err);
    }
}

updateProfileDefaults();
