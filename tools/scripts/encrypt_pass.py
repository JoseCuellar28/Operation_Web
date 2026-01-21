
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import base64

# Key and IV from EncryptionService.cs
KEY = b"OperationWebSecretKey2025!!__AES" # 32 bytes
IV = b"OperationWebIV!!"                   # 16 bytes

def encrypt(plaintext):
    backend = default_backend()
    cipher = Cipher(algorithms.AES(KEY), modes.CBC(IV), backend=backend)
    encryptor = cipher.encryptor()
    
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(plaintext.encode('utf-8')) + padder.finalize()
    
    ct = encryptor.update(padded_data) + encryptor.finalize()
    return base64.b64encode(ct).decode('utf-8')

print(encrypt("123456"))
