import pytds
from dotenv import load_dotenv
import os
import sys

# Add parent directory to path to import EncryptionService
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'OperationWeb.Business', 'Services'))

load_dotenv('etl-service/.env')

# Simple AES encryption (matching C# implementation)
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64

def encrypt_password(password):
    # These should match your C# EncryptionService configuration
    key = b'12345678901234567890123456789012'  # 32 bytes for AES-256
    iv = b'1234567890123456'  # 16 bytes
    
    cipher = AES.new(key, AES.MODE_CBC, iv)
    padded = pad(password.encode('utf-8'), AES.block_size)
    encrypted = cipher.encrypt(padded)
    return base64.b64encode(encrypted).decode('utf-8')

try:
    conn = pytds.connect(
        server=os.getenv('DB_SERVER'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=1433
    )
    cursor = conn.cursor()
    
    # Reset password to "temporal123"
    new_password = "temporal123"
    encrypted_password = encrypt_password(new_password)
    
    cursor.execute("""
        UPDATE Users 
        SET PasswordHash = %s, MustChangePassword = 1 
        WHERE DNI = '41007510'
    """, (encrypted_password,))
    
    conn.commit()
    print(f"Contraseña reseteada exitosamente para DNI 41007510")
    print(f"Nueva contraseña temporal: {new_password}")
    print(f"El usuario deberá cambiarla en el primer login")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
