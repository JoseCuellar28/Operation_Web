import requests
import json
import time
import pymssql

BASE_URL = "http://localhost:5132/api"
ADMIN_DNI = "99887766"
ADMIN_PASS = "123456"

# DB Config
DB_SERVER = '100.112.55.58'
DB_USER = 'sa'
DB_PASS = 'Joarcu28'
DB_NAME = 'DB_Operation'

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
RESET = '\033[0m'

def log(msg, success=True):
    color = GREEN if success else RED
    mark = "✅" if success else "❌"
    print(f"{color}{mark} {msg}{RESET}")

def db_execute(query, params=None):
    try:
        conn = pymssql.connect(DB_SERVER, DB_USER, DB_PASS, DB_NAME)
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"DB Error: {e}")
        return False

def setup_test_personal(dni):
    # Insert dummy personal record
    query = """
    IF NOT EXISTS (SELECT 1 FROM Personal WHERE DNI = %s)
    BEGIN
        INSERT INTO Personal (DNI, Inspector, Email, Estado)
        VALUES (%s, 'Test User Automated', 'test@example.com', 'Activo')
    END
    """
    return db_execute(query, (dni, dni))

def cleanup_test_data(dni):
    # Delete user and personal
    query = """
    DELETE FROM Users WHERE DNI = %s;
    DELETE FROM Personal WHERE DNI = %s;
    """
    return db_execute(query, (dni, dni))

def get_admin_token():
    resp = requests.post(f"{BASE_URL}/auth/login", json={"Username": ADMIN_DNI, "Password": ADMIN_PASS})
    if resp.status_code == 200:
        return resp.json()['token']
    else:
        print(f"Failed to login as Admin: {resp.text}")
        return None

def test_user_management(token):
    print("\n--- Testing User Management ---")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    test_dni = f"TEST{int(time.time())}"[-8:] 
    
    # Setup Pre-requisite
    if not setup_test_personal(test_dni):
        log("Failed to setup test Personal record", False)
        return

    try:
        # 1. Create User Success
        resp = requests.post(f"{BASE_URL}/users", json={"DNI": test_dni, "Role": "User"}, headers=headers)
        if resp.status_code == 200:
            log(f"Create User Success (DNI: {test_dni})")
            user_data = resp.json()
            if 'tempPassword' in user_data:
                log("Auto-generated password received")
            else:
                log("Auto-generated password MISSING", False)
        else:
            log(f"Create User Failed: {resp.text}", False)
            return

        # 2. Duplicate DNI
        resp = requests.post(f"{BASE_URL}/users", json={"DNI": test_dni, "Role": "User"}, headers=headers)
        if resp.status_code == 409: # Conflict
            log("Duplicate DNI validation (409 Conflict)")
        else:
            log(f"Duplicate DNI validation Failed (Expected 409, got {resp.status_code})", False)

        # 3. Empty Fields
        resp = requests.post(f"{BASE_URL}/users", json={"DNI": "", "Role": "User"}, headers=headers)
        if resp.status_code == 400:
            log("Empty DNI validation (400 Bad Request)")
        else:
            log(f"Empty DNI validation Failed (Expected 400, got {resp.status_code})", False)

        # 5. Role Assignment (Admin)
        # Need another personal record for this
        manager_dni = f"ADM{int(time.time())}"[-8:]
        setup_test_personal(manager_dni)
        resp = requests.post(f"{BASE_URL}/users", json={"DNI": manager_dni, "Role": "Admin"}, headers=headers)
        if resp.status_code == 200 and resp.json()['role'] == 'Admin':
            log(f"Role Assignment Success (Admin)")
        else:
            log(f"Role Assignment Failed", False)
        
        cleanup_test_data(manager_dni)

    finally:
        cleanup_test_data(test_dni)

def test_authentication():
    print("\n--- Testing Authentication ---")
    
    # 6. Login Success
    resp = requests.post(f"{BASE_URL}/auth/login", json={"Username": ADMIN_DNI, "Password": ADMIN_PASS})
    if resp.status_code == 200:
        log("Login Success")
        token = resp.json().get('token')
        if token:
            log("JWT Token received")
        else:
            log("JWT Token missing", False)
    else:
        log(f"Login Failed: {resp.text}", False)

    # 7. Login Failed
    resp = requests.post(f"{BASE_URL}/auth/login", json={"Username": ADMIN_DNI, "Password": "wrongpassword"})
    if resp.status_code == 401:
        log("Login Failed validation (401 Unauthorized)")
    else:
        log(f"Login Failed validation Failed (Expected 401, got {resp.status_code})", False)

    # 8. Non-existent User
    resp = requests.post(f"{BASE_URL}/auth/login", json={"Username": "00000000", "Password": "123"})
    if resp.status_code == 401:
        log("Non-existent User validation (401 Unauthorized)")
    else:
        log(f"Non-existent User validation Failed (Expected 401, got {resp.status_code})", False)

def test_system_settings(admin_token):
    print("\n--- Testing System Settings ---")
    admin_headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}

    # 15. Access Allowed (Admin)
    resp = requests.get(f"{BASE_URL}/systemsettings", headers=admin_headers)
    if resp.status_code == 200:
        log("Admin Access to Settings (200 OK)")
    else:
        log(f"Admin Access to Settings Failed (Expected 200, got {resp.status_code})", False)

    # 16. Update Settings
    updates = [{"Key": "TestKey", "Value": "TestValue", "Description": "Automated Test"}]
    resp = requests.post(f"{BASE_URL}/systemsettings", json=updates, headers=admin_headers)
    if resp.status_code == 200:
        log("Update Settings Success")
    else:
        log(f"Update Settings Failed: {resp.text}", False)

    # Verify Update
    resp = requests.get(f"{BASE_URL}/systemsettings", headers=admin_headers)
    settings = resp.json()
    test_setting = next((s for s in settings if s['key'] == 'TestKey'), None)
    if test_setting and test_setting['value'] == 'TestValue':
        log("Settings Persistence Verified")
    else:
        log("Settings Persistence Failed", False)

    # 14. Access Restricted (Non-Admin)
    user_dni = f"USR{int(time.time())}"[-8:]
    setup_test_personal(user_dni)
    try:
        resp = requests.post(f"{BASE_URL}/users", json={"DNI": user_dni, "Role": "User"}, headers=admin_headers)
        if resp.status_code == 200:
            user_pass = resp.json()['tempPassword']
            # Login as user
            resp = requests.post(f"{BASE_URL}/auth/login", json={"Username": user_dni, "Password": user_pass})
            user_token = resp.json()['token']
            
            # Try to access settings
            user_headers = {"Authorization": f"Bearer {user_token}", "Content-Type": "application/json"}
            resp = requests.get(f"{BASE_URL}/systemsettings", headers=user_headers)
            if resp.status_code == 403:
                log("Non-Admin Access Restricted (403 Forbidden)")
            else:
                log(f"Non-Admin Access Check Failed (Expected 403, got {resp.status_code})", False)
        else:
            log(f"Skipping Non-Admin test (Could not create temp user: {resp.text})", False)
    finally:
        cleanup_test_data(user_dni)

if __name__ == "__main__":
    print("Starting Automated Tests...")
    admin_token = get_admin_token()
    if admin_token:
        test_authentication()
        test_user_management(admin_token)
        test_system_settings(admin_token)
    else:
        print("Aborting tests due to Admin login failure.")
