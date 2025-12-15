from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import base64

# Configuration from EncryptionService.cs
KEY = b"OperationWebSecretKey2025!!__AES"
IV = b"OperationWebIV!!"

def encrypt(plain_text):
    cipher = AES.new(KEY, AES.MODE_CBC, IV)
    padded = pad(plain_text.encode('utf-8'), AES.block_size)
    encrypted = cipher.encrypt(padded)
    return base64.b64encode(encrypted).decode('utf-8')

print(encrypt("123456"))
