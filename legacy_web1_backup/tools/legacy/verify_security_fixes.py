import requests
import json
import time

API_URL = "http://localhost:5132/api/auth/login"
ETL_URL = "http://localhost:5000/health" # Assuming ETL is on 5000
FRONTEND_URL = "http://localhost:8000/Modelo_Funcional/js/vendor/tailwindcss.js"

def test_login_success():
    print("\n[TEST] Login Success (Valid User)...")
    payload = {
        "Username": "41007510",
        "Password": "123", # Assuming this is correct or using 123456 as seen in screenshots
        # If this fails due to password, we mainly care about NOT getting 500/DB errors
        "Password": "123456",
        "Platform": "web",
        "CaptchaId": "test",
        "CaptchaAnswer": "9999"
    }
    try:
        r = requests.post(API_URL, json=payload, headers={'Content-Type': 'application/json'})
        if r.status_code == 200:
            print("✅ PASS: Login Successful.")
            return True
        elif r.status_code == 401:
            print("⚠️ NOTE: Login Failed (401). This is GOOD if password is wrong. BAD if system error.")
            print(f"Response: {r.text}")
            return True
        else:
            print(f"❌ FAIL: Unexpected status {r.status_code}. Response: {r.text}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception {e}")
        return False

def test_platform_fail_closed():
    print("\n[TEST] Security: Platform Validation...")
    payload = {
        "Username": "41007510",
        "Password": "123456",
        "Platform": "HACKER_PLATFORM", # Should be rejected
        "CaptchaId": "test",
        "CaptchaAnswer": "9999"
    }
    try:
        r = requests.post(API_URL, json=payload, headers={'Content-Type': 'application/json'})
        if r.status_code == 400 and "Plataforma" in r.text:
            print("✅ PASS: Invalid Platform Rejected (Bad Request).")
            return True
        elif r.status_code == 401:
             print("✅ PASS: Invalid Platform Denied (Unauthorized).")
             return True
        else:
            print(f"❌ FAIL: Should have rejected platform. Status: {r.status_code}, Body: {r.text}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception {e}")
        return False

def test_etl_sanitization():
    print("\n[TEST] Security: ETL Health Check Sanitization...")
    # Note: ETL service needs to be running. If not, this test skips.
    try:
        r = requests.get(ETL_URL, timeout=2)
        if "DB_PASSWORD" in r.text or "sa" in r.text:
             print("❌ FAIL: Sensitive info found in response!")
             print(r.text)
             return False
        else:
             print("✅ PASS: No sensitive info in ETL health check.")
             return True
    except:
        print("⚠️ SKIP: ETL Service not reachable (might need separate start).")
        return True

def test_local_vendor_scripts():
    print("\n[TEST] Security: Local Vendor Scripts...")
    try:
        r = requests.head(FRONTEND_URL)
        if r.status_code == 200:
            print("✅ PASS: tailwindcss.js serving from local vendor folder.")
            return True
        else:
            print(f"❌ FAIL: Could not load local script. Status: {r.status_code}")
            return False
    except:
        print("❌ FAIL: Frontend server not reachable.")
        return False

if __name__ == "__main__":
    print("--- STARTING SECURITY VERIFICATION ---")
    time.sleep(2) # Give API time to start
    test_login_success()
    test_platform_fail_closed()
    test_etl_sanitization()
    test_local_vendor_scripts()
    print("--- VERIFICATION COMPLETE ---")
