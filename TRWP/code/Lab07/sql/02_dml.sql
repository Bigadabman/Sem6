USE Celebrities;
GO

INSERT INTO dbo.Celebrities (FullName, Nationality, BirthYear, PhotoUrl)
VALUES
    (N'Keanu Reeves', N'Canada', 1964, N'https://example.com/keanu.jpg'),
    (N'Marie Curie', N'Poland', 1867, N'https://example.com/curie.jpg'),
    (N'Freddie Mercury', N'United Kingdom', 1946, N'https://example.com/mercury.jpg');
GO

SELECT Id, FullName, Nationality, BirthYear, PhotoUrl, CreatedAt
FROM dbo.Celebrities;
GO

UPDATE dbo.Celebrities
SET Nationality = N'France and Poland'
WHERE FullName = N'Marie Curie';
GO

DELETE FROM dbo.Celebrities
WHERE FullName = N'Freddie Mercury';
GO

SELECT Id, FullName, Nationality, BirthYear, PhotoUrl, CreatedAt
FROM dbo.Celebrities;
GO
