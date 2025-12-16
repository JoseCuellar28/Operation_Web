using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace Tool
{
    public class Program
    {
        public static void Main()
        {
            var keyStr = "OperationWebSecretKey2025!!__AES";
            var ivStr = "OperationWebIV!!";
            
            var key = Encoding.UTF8.GetBytes(keyStr);
            var iv = Encoding.UTF8.GetBytes(ivStr);
            
            var plainText = "Prueba123";
            var encrypted = Encrypt(plainText, key, iv);
            
            Console.WriteLine("DEBUG_START");
            Console.WriteLine(encrypted);
            Console.WriteLine("DEBUG_END");
        }

        public static string Encrypt(string plainText, byte[] key, byte[] iv)
        {
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = key;
                aesAlg.IV = iv;

                // Match EncryptionService.cs exactly
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
    }
}
