using System; using System.Text; using System.Security.Cryptography; using System.IO;

class Program {
    static void Main() {
        string keyStr = "OperationWebSecretKey2025!!__AES"; // 32 chars
        string ivStr = "OperationWebIV!!"; // 16 chars
        string plain = "Prueba123";
        
        byte[] key = Encoding.UTF8.GetBytes(keyStr);
        byte[] iv = Encoding.UTF8.GetBytes(ivStr);
        
        using (Aes aesAlg = Aes.Create()) {
            aesAlg.Key = key;
            aesAlg.IV = iv;
            ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);
            using (MemoryStream msEncrypt = new MemoryStream()) {
                using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write)) {
                    using (StreamWriter swEncrypt = new StreamWriter(csEncrypt)) {
                        swEncrypt.Write(plain);
                    }
                    string result = Convert.ToBase64String(msEncrypt.ToArray());
                    Console.WriteLine(result);
                }
            }
        }
    }
}
