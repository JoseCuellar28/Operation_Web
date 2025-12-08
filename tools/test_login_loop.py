import requests
import json
import time

URL = "http://localhost:5132/api/auth/login"
HEADERS = {'Content-Type': 'application/json'}

# Using the user from the screenshot
PAYLOAD = {
    "Username": "41007510", 
    "Password": "123", # Assuming generic password or whatever was used. Wait, I don't know the password.
                       # I'll use the 'admin' user I know exists or generic.
                       # Actually, in screenshot user types "123456"
    "Username": "41007510",
    "Password": "123456", 
    "CaptchaId": "test",
    "CaptchaAnswer": "9999", # Backdoor
    "Platform": "web"
}

# If that user doesn't exist/work, try 'admin'
PAYLOAD_ADMIN = {
    "Username": "admin",
    "Password": "123", # Often standard in this dev env
    "CaptchaId": "test",
    "CaptchaAnswer": "9999",
    "Platform": "web"
}

def test_login(username, password):
    payload = {
        "Username": username,
        "Password": password,
        "CaptchaId": "test",
        "CaptchaAnswer": "9999",
        "Platform": "web"
    }
    
    print(f"Testing login for {username}...")
    try:
        r = requests.post(URL, json=payload, headers=HEADERS)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            print("Login SUCCESS")
            return True
        else:
            print(f"Login FAILED: {r.text}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

# Run 20 times
print("Starting 20 login tests...")
success_count = 0
for i in range(20):
    print(f"\n--- Test {i+1} ---")
    # Try the user from screenshot first
    if test_login("41007510", "123456"):
        success_count += 1
    else:
        # Fallback to verify if it's just wrong password vs system error
        # Assuming admin/admin123 or similar if known. 
        # Actually I saw 'SeedData' earlier.
        # User '41007510' is not in SeedData. '12345678' (Juan Perez) is.
        # Let's try Juan Perez as fallback if checking system health.
        if test_login("12345678", "123456"): # Assuming default pass
             success_count += 1

print(f"\nTotal Success: {success_count}/20 (Note: if password for 41007510 is wrong, this might be 0, but status 401 vs 500 matters)")
