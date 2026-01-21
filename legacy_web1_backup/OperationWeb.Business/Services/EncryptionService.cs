using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace OperationWeb.Business.Services
{
    public interface IEncryptionService
    {
        string Encrypt(string plainText);
        string Decrypt(string cipherText);
    }

    public class EncryptionService : IEncryptionService
    {
        private readonly byte[] _key;
        private readonly byte[] _iv;

        public EncryptionService(IConfiguration configuration)
        {
            // In a real scenario, these should be loaded from configuration (appsettings.json or env vars)
            // For this implementation, we will generate/use a fixed key if not present, or derive it.
            // However, to ensure persistence across restarts without config changes, we'll use a hardcoded fallback for now
            // or better, try to read from config and fallback to a default for dev.
            
            var keyString = configuration["Encryption:Key"];
            var ivString = configuration["Encryption:IV"];

            if (!string.IsNullOrEmpty(keyString) && !string.IsNullOrEmpty(ivString))
            {
                _key = Convert.FromBase64String(keyString);
                _iv = Convert.FromBase64String(ivString);
            }
            else
            {
                // Fallback for development (NOT SECURE for production, but allows immediate functionality)
                // 32 bytes for AES-256
                _key = Encoding.UTF8.GetBytes("OperationWebSecretKey2025!!__AES"); 
                // 16 bytes for IV
                _iv = Encoding.UTF8.GetBytes("OperationWebIV!!"); 
            }
        }

        public string Encrypt(string plainText)
        {
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = _key;
                aesAlg.IV = _iv;

                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {
                            swEncrypt.Write(plainText);
                        }
                        return Convert.ToBase64String(msEncrypt.ToArray());
                    }
                }
            }
        }

        public string Decrypt(string cipherText)
        {
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = _key;
                aesAlg.IV = _iv;

                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msDecrypt = new MemoryStream(Convert.FromBase64String(cipherText)))
                {
                    using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                        {
                            return srDecrypt.ReadToEnd();
                        }
                    }
                }
            }
        }
    }
}
