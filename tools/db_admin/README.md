# Database Utility Scripts

Scripts de utilidad para administración y verificación de la base de datos.

## 📋 Scripts Disponibles

### `apply_migration.py`
Aplica migraciones a la base de datos.

**Uso**:
```bash
python3 tools/database/apply_migration.py
```

---

### `check_user_role.py`
Verifica los roles de un usuario en la base de datos.

**Uso**:
```bash
python3 tools/database/check_user_role.py
```

---

### `inspect_roles.py`
Inspecciona todos los roles disponibles en la base de datos.

**Uso**:
```bash
python3 tools/database/inspect_roles.py
```

---

### `inspect_schema.py`
Inspecciona el esquema de la base de datos.

**Uso**:
```bash
python3 tools/database/inspect_schema.py
```

---

### `update_user_role.py`
Actualiza el rol de un usuario.

**Uso**:
```bash
python3 tools/database/update_user_role.py
```

---

## ⚙️ Configuración

Estos scripts requieren las siguientes variables de entorno:

```bash
DB_SERVER=your_server
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
DB_PORT=1433
```

Puedes configurarlas en un archivo `.env` o exportarlas directamente:

```bash
export DB_SERVER=100.112.55.58
export DB_NAME=DB_Operation
export DB_USER=sa
export DB_PASSWORD=your_password
```

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**: Estos scripts están diseñados para uso administrativo con el usuario `sa`.

- **NO** usar en producción sin supervisión
- **NO** commitear credenciales en el código
- **SIEMPRE** usar variables de entorno

---

## 📝 Notas

- Estos scripts son herramientas de desarrollo/administración
- No forman parte del flujo normal de la aplicación
- Se ejecutan manualmente según sea necesario
