

USE HireMe;
GO

DROP PROCEDURE IF EXISTS dbo.GetVacationsFromReport;
DROP PROCEDURE IF EXISTS dbo.InsertVacationReport;
DROP PROCEDURE IF EXISTS dbo.GenerateVacationReportXml;
GO

DROP TABLE IF EXISTS dbo.Report;
DROP TABLE IF EXISTS dbo.VacationKind;
GO

CREATE TABLE dbo.VacationKind (
    KindId INT PRIMARY KEY,
    KindName NVARCHAR(50) NOT NULL
);

INSERT INTO dbo.VacationKind (KindId, KindName)
VALUES
    (1, N'Regular vacation'),
    (2, N'Long vacation'),
    (3, N'Short vacation');
GO


IF COL_LENGTH('dbo.Vacation', 'KindId') IS NULL
BEGIN
    ALTER TABLE dbo.Vacation ADD KindId INT NULL;
END;
GO

UPDATE dbo.Vacation
SET KindId =
    CASE
        WHEN VacationDays >= 14 THEN 2
        WHEN VacationDays < 8 THEN 3
        ELSE 1
    END;
GO


SELECT Id, XmlData from dbo.Report;


CREATE TABLE dbo.Report (
    Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY CLUSTERED,
    XmlData XML NOT NULL
);
GO

CREATE OR ALTER PROCEDURE dbo.GenerateVacationReportXml
    @XmlResult XML OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT @XmlResult =
    (
        SELECT
            CONVERT(VARCHAR(19), SYSDATETIME(), 120) AS [@created_at],

            (
                SELECT
                    COUNT(*) AS [total_vacations],
                    SUM(VacationDays) AS [total_days],
                    SUM(Payment) AS [total_payment]
                FROM dbo.Vacation
                FOR XML PATH('summary'), TYPE
            ),

            (
                SELECT
                    PersonId AS [@person_id],
                    PersonName AS [person_name],
                    VacationCount AS [vacation_count],
                    DaysSum AS [days_sum],
                    PaymentSum AS [payment_sum]
                FROM (
                    SELECT
                        p.PersonId,
                        p.PersonName,
                        COUNT(*) AS VacationCount,
                        SUM(v.VacationDays) AS DaysSum,
                        SUM(v.Payment) AS PaymentSum
                    FROM dbo.Vacation v
                    JOIN dbo.Person p ON p.PersonId = v.PersonId
                    GROUP BY p.PersonId, p.PersonName
                ) t
                ORDER BY PersonId
                FOR XML PATH('person_total'), ROOT('person_totals'), TYPE
            ),

            (
                SELECT
                    v.VacationId AS [@id],
                    p.PersonName AS [person_name],
                    k.KindName AS [kind_name],
                    CONVERT(VARCHAR(10), v.StartDate, 23) AS [start_date],
                    CONVERT(VARCHAR(10), v.EndDate, 23) AS [end_date],
                    v.VacationDays AS [vacation_days],
                    v.Payment AS [payment]
                FROM dbo.Vacation v
                JOIN dbo.Person p ON p.PersonId = v.PersonId
                JOIN dbo.VacationKind k ON k.KindId = v.KindId
                ORDER BY v.VacationId
                FOR XML PATH('vacation'), ROOT('vacations'), TYPE
            )
        FOR XML PATH('vacation_report'), TYPE
    );
END;
GO

CREATE OR ALTER PROCEDURE dbo.InsertVacationReport
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Xml XML;

    EXEC dbo.GenerateVacationReportXml @Xml OUTPUT;

    INSERT INTO dbo.Report (XmlData)
    VALUES (@Xml);
END;
GO

CREATE PRIMARY XML INDEX IX_Report_XmlData
ON dbo.Report(XmlData);
GO

CREATE OR ALTER PROCEDURE dbo.GetVacationsFromReport
    @PersonName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.Id AS ReportId,
        x.vacation.value('@id', 'INT') AS VacationId,
        x.vacation.value('(person_name/text())[1]', 'NVARCHAR(100)') AS PersonName,
        x.vacation.value('(kind_name/text())[1]', 'NVARCHAR(50)') AS KindName,
        x.vacation.value('(start_date/text())[1]', 'DATE') AS StartDate,
        x.vacation.value('(vacation_days/text())[1]', 'DECIMAL(5, 1)') AS VacationDays,
        x.vacation.value('(payment/text())[1]', 'DECIMAL(10, 2)') AS Payment
    FROM dbo.Report r
    CROSS APPLY r.XmlData.nodes('/vacation_report/vacations/vacation') x(vacation)
    WHERE x.vacation.value('(person_name/text())[1]', 'NVARCHAR(100)') = @PersonName
    ORDER BY VacationId;
END;
GO



EXEC dbo.InsertVacationReport;


SELECT Id, XmlData
FROM dbo.Report;

EXEC dbo.GetVacationsFromReport N'Ivan Petrov';
GO



SET STATISTICS XML ON;
GO

EXEC dbo.GetVacationsFromReport N'Ivan Petrov';
GO

SET STATISTICS XML OFF;
GO
