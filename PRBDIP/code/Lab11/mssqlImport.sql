

CREATE TABLE dbo.VacationImport (
    VacationId INT PRIMARY KEY,
    PersonName NVARCHAR(100) NOT NULL,
    VacationStart DATE NOT NULL,
    VacationDays DECIMAL(5, 1) NOT NULL,
    Payment DECIMAL(10, 2) NOT NULL
);

drop table dbo.VacationImported ;


CREATE OR ALTER FUNCTION dbo.fn_VacationsByPeriod (
    @DateFrom DATE,
    @DateTo DATE
)
RETURNS TABLE
AS
RETURN
(
    SELECT
        v.VacationId,
        p.PersonId,
        p.PersonName,
        v.StartDate,
        v.EndDate,
        v.VacationDays,
        v.Payment
    FROM dbo.Vacation v
    JOIN dbo.Person p ON p.PersonId = v.PersonId
    WHERE v.StartDate BETWEEN @DateFrom AND @DateTo
);
GO

truncate table vacationImport;

select * from vacationImport;

SELECT *
FROM dbo.fn_VacationsByPeriod('2026-06-01', '2026-08-31')
ORDER BY VacationId;

