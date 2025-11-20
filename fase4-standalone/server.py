from flask import Flask, request, jsonify
import os
from pathlib import Path
from lib.db_tools import test, deploy_sql, tables, load_staging, merge_snapshot, audit
from lib.procesar_personas import procesar_archivo
import pandas as pd
try:
    import pytds
except Exception:
    pytds = None
try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None
try:
    from flask_cors import CORS
except Exception:
    CORS = None

app = Flask(__name__)
base_dir = Path(__file__).resolve().parent
if load_dotenv:
    env_path = base_dir / '.env'
    if env_path.exists():
        load_dotenv(dotenv_path=str(env_path))
if CORS:
    CORS(app)

@app.get('/api/health')
def health():
    try:
        return jsonify(test())
    except Exception as e:
        return jsonify({
            "connected": False,
            "error": str(e),
            "server": os.getenv('DB_SERVER', ''),
            "database": os.getenv('DB_NAME', ''),
            "port": int(os.getenv('DB_PORT', '1433')),
            "has_user": bool(os.getenv('DB_USER', '')),
            "has_password": bool(os.getenv('DB_PASSWORD', ''))
        }), 500

@app.post('/api/analyze')
def api_analyze():
    data = request.get_json() or {}
    archivo = data.get('archivo','')
    hoja = data.get('hoja','')
    header_row = int(data.get('header_row',-1))
    usecols = data.get('usecols','')
    res = procesar_archivo(archivo, hoja=hoja, header_row=header_row, usecols=usecols)
    return jsonify(res["resumen"])

@app.post('/api/load-staging')
def api_load_staging():
    data = request.get_json() or {}
    archivo = data.get('archivo','')
    hoja = data.get('hoja','')
    header_row = int(data.get('header_row',-1))
    usecols = data.get('usecols','')
    res = procesar_archivo(archivo, hoja=hoja, header_row=header_row, usecols=usecols)
    stg = load_staging(res, archivo, hoja)
    return jsonify(stg)

@app.post('/api/merge-snapshot')
def api_merge_snapshot():
    data = request.get_json() or {}
    archivo = data.get('archivo','')
    hoja = data.get('hoja','')
    header_row = int(data.get('header_row',-1))
    usecols = data.get('usecols','')
    res = procesar_archivo(archivo, hoja=hoja, header_row=header_row, usecols=usecols)
    snap = merge_snapshot(res)
    return jsonify(snap)

@app.post('/api/audit')
def api_audit():
    data = request.get_json() or {}
    archivo = data.get('archivo','')
    hoja = data.get('hoja','')
    header_row = int(data.get('header_row',-1))
    usecols = data.get('usecols','')
    res = procesar_archivo(archivo, hoja=hoja, header_row=header_row, usecols=usecols)
    periodo = res["resumen"]["periodos_detectados"][0] if res["resumen"]["periodos_detectados"] else ""
    out = audit(archivo, hoja, periodo, res, {"inserted":0,"updated":0}, {"inserted":0})
    return jsonify(out)

@app.post('/api/deploy-sql')
def api_deploy_sql():
    base = Path(__file__).resolve().parent
    return jsonify(deploy_sql(str(base / 'sql')))

@app.get('/api/tables')
def api_tables():
    return jsonify(tables())

@app.get('/api/personal')
def api_personal():
    try:
        # Conectar usando variables de entorno
        server = os.getenv('DB_SERVER', '')
        user = os.getenv('DB_USER', '')
        password = os.getenv('DB_PASSWORD', '')
        database = os.getenv('DB_NAME', '')
        port = int(os.getenv('DB_PORT', '1433'))
        if pytds is None:
            return jsonify({"error": "python-tds no instalado"}), 500
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cur = conn.cursor()
            # Parámetros opcionales: paginación y orden
            limit = request.args.get('limit', '')
            offset = int(request.args.get('offset', '0') or '0')
            order_by = request.args.get('order_by', 'FechaCreacion')
            order_dir = request.args.get('order_dir', 'DESC').upper()
            if order_dir not in ['ASC', 'DESC']:
                order_dir = 'DESC'

            # Total
            cur.execute("SELECT COUNT(*) FROM dbo.Personal")
            total = cur.fetchone()[0]

            base_select = (
                f"SELECT DNI, Inspector, Telefono, Distrito, Tipo, Estado, FechaInicio, FechaCese, FechaCreacion "
                f"FROM dbo.Personal ORDER BY {order_by} {order_dir}"
            )

            if limit:
                try:
                    nlimit = int(limit)
                    query = base_select + " OFFSET %s ROWS FETCH NEXT %s ROWS ONLY"
                    cur.execute(query, (offset, nlimit))
                except Exception:
                    cur.execute(base_select)
            else:
                cur.execute(base_select)
            rows = cur.fetchall()
            cols = [c[0] for c in cur.description]
            data = []
            for r in rows:
                item = {cols[i].lower(): r[i] for i in range(len(cols))}
                data.append(item)
            return jsonify({"success": True, "data": data, "total": total})
    except Exception as e:
        return jsonify({"success": False, "error": str(e), "details": repr(e)}), 500

@app.get('/api/table-schema')
def api_table_schema():
    try:
        table = request.args.get('table','')
        if not table:
            return jsonify({"success": False, "message": "Parámetro 'table' requerido"}), 400
        server = os.getenv('DB_SERVER', '')
        user = os.getenv('DB_USER', '')
        password = os.getenv('DB_PASSWORD', '')
        database = os.getenv('DB_NAME', '')
        port = int(os.getenv('DB_PORT', '1433'))
        if pytds is None:
            return jsonify({"error": "python-tds no instalado"}), 500
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = %s ORDER BY ORDINAL_POSITION",
                (table,)
            )
            rows = cur.fetchall()
            cols = [c[0] for c in cur.description]
            data = [{cols[i].lower(): r[i] for i in range(len(cols))} for r in rows]
            return jsonify({"success": True, "table": table, "columns": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.post('/api/upload-excel')
def api_upload_excel():
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "message": "Archivo no adjuntado (campo 'file')"}), 400
        f = request.files['file']
        hoja = request.form.get('hoja', '')
        header_row = int(request.form.get('header_row', '-1'))
        usecols = request.form.get('usecols', '')
        # Validar extensión
        filename = f.filename or ''
        if not filename.lower().endswith(('.xlsx', '.xlsm')):
            return jsonify({"success": False, "message": "Formato de archivo no soportado"}), 400
        # Guardar temporalmente
        base = Path(__file__).resolve().parent
        tmpdir = base / 'tmp'
        tmpdir.mkdir(exist_ok=True)
        tmp_path = tmpdir / filename
        f.save(str(tmp_path))
        # Procesar
        res = procesar_archivo(str(tmp_path), hoja=hoja, header_row=header_row, usecols=usecols)
        periodo = res["resumen"]["periodos_detectados"][0] if res["resumen"]["periodos_detectados"] else ""
        stg = {}
        snap = {}
        aud = {}
        stg_error = None
        snap_error = None
        audit_error = None
        try:
            stg = load_staging(res, str(tmp_path), hoja)
        except Exception as e:
            stg_error = str(e)
        try:
            snap = merge_snapshot(res)
        except Exception as e:
            snap_error = str(e)
        try:
            aud = audit(str(tmp_path), hoja, periodo, res, snap if snap else {"inserted":0,"updated":0}, stg if stg else {"inserted":0})
        except Exception as e:
            audit_error = str(e)
        # Resumen
        out = {
            "success": True,
            "resumen": res["resumen"],
            "staging": stg,
            "snapshot": snap,
            "audit": aud,
            "errors": {"staging": stg_error, "snapshot": snap_error, "audit": audit_error}
        }
        return jsonify(out), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 200

@app.post('/api/preview-excel')
def api_preview_excel():
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "message": "Archivo no adjuntado (campo 'file')"}), 400
        f = request.files['file']
        hoja = request.form.get('hoja', '')
        header_row = int(request.form.get('header_row', '-1'))
        usecols = request.form.get('usecols', '')
        filename = f.filename or ''
        if not filename.lower().endswith(('.xlsx', '.xlsm')):
            return jsonify({"success": False, "message": "Formato de archivo no soportado"}), 400
        base = Path(__file__).resolve().parent
        tmpdir = base / 'tmp'
        tmpdir.mkdir(exist_ok=True)
        tmp_path = tmpdir / filename
        f.save(str(tmp_path))
        res = procesar_archivo(str(tmp_path), hoja=hoja, header_row=header_row, usecols=usecols)
        df = res.get('normalizado') if res.get('normalizado') is not None else res.get('todo')
        rows = []
        cols = []
        if df is not None and not getattr(df, 'empty', True):
            cols = list(df.columns)
            for i, row in df.head(10).iterrows():
                outrow = {}
                for c in cols:
                    v = row.get(c) if c in df.columns else None
                    try:
                        if pd.isna(v):
                            outrow[c] = None
                            continue
                    except Exception:
                        pass
                    if hasattr(v, 'to_pydatetime'):
                        try:
                            outrow[c] = v.to_pydatetime().isoformat()
                        except Exception:
                            outrow[c] = str(v)
                    else:
                        outrow[c] = str(v)
                rows.append(outrow)
        resumen_raw = res.get("resumen", {})
        resumen = {}
        for k, v in resumen_raw.items():
            try:
                if pd.isna(v):
                    resumen[k] = None
                    continue
            except Exception:
                pass
            if hasattr(v, 'to_pydatetime'):
                try:
                    resumen[k] = v.to_pydatetime().isoformat()
                except Exception:
                    resumen[k] = str(v)
            else:
                resumen[k] = v
        out = {
            "success": True,
            "resumen": resumen,
            "columns": cols,
            "rows": rows
        }
        return jsonify(out), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT','5051')))