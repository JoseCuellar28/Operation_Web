import os
from pathlib import Path
try:
    import pytds
except Exception:
    pytds = None

def _conn():
    server = os.getenv('DB_SERVER', '')
    user = os.getenv('DB_USER', '')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', '')
    port = int(os.getenv('DB_PORT', '1433'))
    if pytds is None:
        raise RuntimeError('python-tds missing')
    return pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True)

def test():
    out = {
        'server': os.getenv('DB_SERVER', ''),
        'database': os.getenv('DB_NAME', ''),
        'port': int(os.getenv('DB_PORT', '1433')),
        'has_user': bool(os.getenv('DB_USER', '')),
        'has_password': bool(os.getenv('DB_PASSWORD', ''))
    }
    try:
        with _conn() as conn:
            cur = conn.cursor()
            cur.execute('SELECT 1')
            out['connected'] = True
            return out
    except Exception as e:
        out['connected'] = False
        out['error'] = str(e)
        return out

def tables():
    try:
        with _conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_SCHEMA, TABLE_NAME")
            rows = cur.fetchall()
            return {'success': True, 'tables': [{'schema': r[0], 'name': r[1]} for r in rows]}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def _exec_sql(cur, sql):
    parts = [p for p in sql.split('\n')]
    cur.execute('\n'.join(parts))

def deploy_sql(sql_dir):
    p = Path(sql_dir)
    executed = []
    errors = []
    try:
        with _conn() as conn:
            cur = conn.cursor()
            for f in sorted(p.glob('*.sql')):
                try:
                    s = f.read_text(encoding='utf-8')
                    for chunk in s.split('\nGO\n'):
                        ch = chunk.strip()
                        if ch:
                            _exec_sql(cur, ch)
                    executed.append(str(f.name))
                except Exception as e:
                    errors.append({'file': f.name, 'error': str(e)})
        return {'success': True, 'executed': executed, 'errors': errors}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def load_staging(res, archivo, hoja):
    return {'inserted': 0}

def merge_snapshot(res):
    return {'inserted': 0, 'updated': 0}

def audit(archivo, hoja, periodo, res, snap, stg):
    return {'archivo': archivo, 'hoja': hoja, 'periodo': periodo, 'snapshot': snap, 'staging': stg, 'resumen': res.get('resumen', {})}