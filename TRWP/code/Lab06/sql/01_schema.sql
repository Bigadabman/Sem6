IF DB_ID(N'Celebrities') IS NULL
BEGIN
    CREATE DATABASE Celebrities;
END;
GO

USE Celebrities;
GO

IF OBJECT_ID(N'dbo.Celebrities', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Celebrities (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Celebrities PRIMARY KEY,
        FullName NVARCHAR(100) NOT NULL,
        Nationality NVARCHAR(100) NOT NULL,
        BirthYear INT NULL,
        PhotoUrl NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Celebrities_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END;
GO
