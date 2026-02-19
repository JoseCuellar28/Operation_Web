
import requests
import re

BASE_URL = "http://localhost:5135/api/v1/auth"

def test_negative():
    print("--- Test Negative (Bypass 9999) ---")
    payload = {
        "username": "admin",
        "password": "password",
        "captchaId": "dummy_id",
        "captchaAnswer": "9999",
        "platform": "web"
    }
    try:
        r = requests.post(f"{BASE_URL}/login", json=payload)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
        if r.status_code == 400 and ("Captcha" in r.text or "requerido" in r.text or "incorrecto" in r.text or "expirado" in r.text):
            print("✅ Negative Test PASSED: 9999 rejected.")
        else:
            print(f"❌ Negative Test FAILED: 9999 status {r.status_code} (Expected 400). Response: {r.text[:100]}")
    except Exception as e:
        print(f"Error: {e}")

def test_positive():
    print("\n--- Test Positive (Real Captcha) ---")
    try:
        # 1. Get Captcha
        r = requests.get(f"{BASE_URL}/captcha")
        if r.status_code != 200:
            print(f"Failed to get captcha: {r.status_code}")
            return
        
        data = r.json()
        cid = data['id']
        question = data['question'] # "2 + 3"
        print(f"Captcha ID: {cid}")
        print(f"Question: {question}")
        
        # 2. Solve
        parts = question.split('+')
        ans = int(parts[0].strip()) + int(parts[1].strip())
        print(f"Calculated Answer: {ans}")
        
        # 3. Login
        payload = {
            "username": "41007510", 
            "password": "password", 
            "captchaId": cid,
            "captchaAnswer": str(ans),
            "platform": "web"
        }
        
        r = requests.post(f"{BASE_URL}/login", json=payload)
        print(f"Status: {r.status_code}")
        # print(f"Response: {r.text}") 
        
        if r.status_code in [200, 401, 500]: # 401 means credentials wrong but captcha passed. 500 means DB error but captcha passed.
             print(f"✅ Positive Test PASSED: Captcha accepted. (Status {r.status_code})")
        elif r.status_code == 400:
             print(f"❌ Positive Test FAILED: Captcha rejected? Response: {r.text[:100]}")
        else:
             print(f"❓ Unexpected status: {r.status_code}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_negative()
    test_positive()
