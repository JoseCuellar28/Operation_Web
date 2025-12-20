
import pytds
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import json

def reset_password_aes():
    try:
        # DB Config
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433
        
        target_dni = '41007510'
        new_password = 'Joarcu28'
        
        # From EncryptionService.cs Fallback
        # "OperationWebSecretKey2025!!__AES" (32 chars)
        key_bytes = b"OperationWebSecretKey2025!!__AES"
        
        # "OperationWebIV!!" (16 chars)
        iv_bytes = b"OperationWebIV!!"
        
        print(f"Encrypting '********' with fallback Key/IV...")
        
        # Encrypt using AES-256 CBC PKCS7
        cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)
        padded_data = pad(new_password.encode('utf-8'), AES.block_size) # PKCS7 is default for `pad`
        encrypted_bytes = cipher.encrypt(padded_data)
        
        # Convert to Base64 to match Convert.ToBase64String
        encrypted_string = base64.b64encode(encrypted_bytes).decode('utf-8')
        
        print(f"Encrypted String: {encrypted_string}")
        
        print(f"Conectando a {server}...")
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()
            
            # Update User
            cursor.execute("""
                UPDATE Users 
                SET PasswordHash = %s, Role = 'Admin', IsActive = 1
                WHERE DNI = %s
            """, (encrypted_string, target_dni))
            
            print(f"Password reset success for {target_dni}.")

    except Exception as e:
        print(f"Error: {e}")
        
if __name__ == "__main__":
    reset_password_aes()
