IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SystemSettings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SystemSettings](
        [Key] [nvarchar](100) NOT NULL,
        [Value] [nvarchar](max) NOT NULL,
        [Description] [nvarchar](max) NULL,
        [UpdatedAt] [datetime2](7) NOT NULL,
     CONSTRAINT [PK_SystemSettings] PRIMARY KEY CLUSTERED 
    (
        [Key] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END
GO
