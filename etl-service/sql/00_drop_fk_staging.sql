IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Personal_Staging_Personal_DNI]') AND parent_object_id = OBJECT_ID(N'[dbo].[Personal_Staging]'))
ALTER TABLE [dbo].[Personal_Staging] DROP CONSTRAINT [FK_Personal_Staging_Personal_DNI]
GO
