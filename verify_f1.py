
import requests
import json
import time

BASE_URL = "http://localhost:5135/api/v1/auth"
CAPTCHA_URL = "http://localhost:5135/api/v1/auth/captcha"

def get_captcha_answer():
    try:
        r = requests.get(CAPTCHA_URL)
        data = r.json()
        parts = data['question'].split('+')
        ans = int(parts[0].strip()) + int(parts[1].strip())
        return data['id'], str(ans)
    except:
        return "dummy", "0"

def run_test(case_name, payload, expected_status, expected_error_code=None):
    print(f"\n--- {case_name} ---")
    try:
        # Get fresh captcha
        cid, cans = get_captcha_answer()
        payload["captchaId"] = cid
        payload["captchaAnswer"] = cans
        
        print(f"Payload: {json.dumps(payload)}")
        r = requests.post(f"{BASE_URL}/login", json=payload)
        
        print(f"Status Obtained: {r.status_code}")
        print(f"Body: {r.text[:200]}")
        
        if r.status_code == expected_status:
            if expected_error_code:
                if expected_error_code in r.text:
                    print("✅ PASSED: Status and Error Code match.")
                else:
                    print(f"❌ FAILED: Status OK but Error Code '{expected_error_code}' missing.")
            else:
                print("✅ PASSED: Status matches.")
        else:
            # 500 is common if DB user missing etc, but we want to test DEVICE logic specifically
            # If we get 403 or 400 as expected, good. 
            print(f"❌ FAILED: Expected {expected_status}, got {r.status_code}")

    except Exception as e:
        print(f"Error: {e}")

# Case C: Missing DeviceId -> 400
run_test("Caso C: Mobile sin DeviceId", 
    {"username": "admin", "password": "password", "platform": "mobile"}, 
    400, "ERR_AUTH_DEVICE_REQUIRED")

# Case B: Unauth Device -> 403
run_test("Caso B: Mobile Device No Autorizado", 
    {"username": "admin", "password": "Prueba123", "platform": "mobile", "deviceId": "DEVICE_UNKNOWN_123"}, 
    403, "ERR_AUTH_DEVICE")

# Case A: Auth Device -> 200/500 (Accepted)
# Using the seeded device
# Note: Admin password in seed is 'Prueba123'
run_test("Caso A: Mobile Device Autorizado", 
    {"username": "admin", "password": "Prueba123", "platform": "mobile", "deviceId": "DEVICE_TEST_AUTHORIZED"}, 
    200, None)

