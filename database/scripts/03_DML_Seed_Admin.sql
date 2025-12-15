-- 3. DATOS INICIALES (DML)
-- Crear usuario Admin por defecto para pruebas

SET IDENTITY_INSERT [dbo].[Users] ON;

IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE DNI = '99999999')
BEGIN
    INSERT INTO [dbo].[Users] ([Id], [Username], [PasswordHash], [Role], [DNI], [Email], [IsActive], [CreatedAt], [MustChangePassword])
    VALUES (
        1, 
        '99999999', 
        'hbuXHjL3sudgQ1SWrVENfg==', -- Password: "123456" (AES Encrypted)
        'Admin', 
        '99999999',
        'admin@operationweb.com',
        1,
        GETDATE(),
        0
    );
END

SET IDENTITY_INSERT [dbo].[Users] OFF;
GO
