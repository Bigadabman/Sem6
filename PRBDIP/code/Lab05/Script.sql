use HireMe;


--Вычисление итогов работы HR помесячно, за квартал, за полгода, за год.

SELECT 
    YEAR(AppliedAt) AS year, 
    DATEPART(QUARTER, AppliedAt) AS Quarter, 
    CASE 
        WHEN MONTH(AppliedAt) <= 6 THEN 1 
        ELSE 2 
    END AS HalfYear,
    MONTH(AppliedAt) AS month,

    COUNT(*) AS Total

FROM Application a 
INNER JOIN ApplicationStatus s 
    ON a.StatusId = s.Id 

WHERE s.StatusName IN ('Accepted', 'Rejected')

GROUP BY ROLLUP (
    YEAR(AppliedAt),
    CASE WHEN MONTH(AppliedAt) <= 6 THEN 1 ELSE 2 END,
    DATEPART(QUARTER, AppliedAt),
    MONTH(AppliedAt)
)

ORDER BY year, HalfYear, Quarter, month;


-- Вычисление итогов работы HR за определенный период:
-- • количество нанятых сотрудников;
-- • сравнение с общим количеством нанятых сотрудников (в %);
-- • сравнение с количество отвергнутых сотрудников (в %).

WITH base AS (
    SELECT 
        YEAR(AppliedAt) AS year,
        MONTH(AppliedAt) AS month,

        SUM(CASE WHEN s.StatusName = 'Accepted' THEN 1 ELSE 0 END) AS acceptedTotal,
        SUM(CASE WHEN s.StatusName = 'Rejected' THEN 1 ELSE 0 END) AS rejectedTotal

    FROM Application a
    INNER JOIN ApplicationStatus s
        ON a.StatusId = s.Id

    GROUP BY YEAR(AppliedAt), MONTH(AppliedAt)
),
numbered AS (
	SELECT *,
		ROW_NUMBER() OVER(ORDER BY year, month) as row_number,
		
		100.0 * acceptedTotal / SUM(acceptedTotal) OVER () AS AcceptedPercent,
        100.0 * acceptedTotal / NULLIF(rejectedTotal, 0) AS AcceptedOverRejectedPercent
	FROM base 
	
)

SELECT * 
FROM numbered
WHERE row_number BETWEEN 1 AND 20
ORDER BY row_number;


--Вернуть для каждого юридического лица 
--количество принятых сотрудников за последние 6 месяцев помесячно.

SELECT 
    c.CompanyName,
    YEAR(a.AppliedAt) AS Year,
    MONTH(a.AppliedAt) AS Month,

    COUNT(*) AS AcceptedCount

FROM Application a
JOIN ApplicationStatus s 
    ON a.StatusId = s.Id
JOIN Vacancy v 
    ON a.VacancyId = v.Id
JOIN Company c 
    ON v.CompanyId = c.Id

WHERE s.StatusName = 'Accepted'
  AND a.AppliedAt >= DATEADD(MONTH, -6, GETDATE())

GROUP BY 
    c.CompanyName,
    YEAR(a.AppliedAt),
    MONTH(a.AppliedAt)

ORDER BY 
    c.CompanyName,
    Year,
    Month;


-- Какой максимальное количество резюме было предоставлено
-- для получения должности в определенном отделе?
-- Вернуть для всех отделов.


WITH accepted AS (
    SELECT 
        VacancyId,
        MIN(AppliedAt) AS AcceptedDate
    FROM Application a
    JOIN ApplicationStatus s 
        ON a.StatusId = s.Id
    WHERE s.StatusName = 'Accepted'
    GROUP BY VacancyId
),

counts AS (
    SELECT 
        v.Title,
        c.CompanyName,
        a.VacancyId,
        COUNT(*) AS ResumeBeforeHire

    FROM Application a
    JOIN Vacancy v 
        ON a.VacancyId = v.Id
    JOIN Company c 
        ON v.CompanyId = c.Id
    JOIN accepted acc 
        ON a.VacancyId = acc.VacancyId

    WHERE a.AppliedAt <= acc.AcceptedDate

    GROUP BY 
        v.Title,
        c.CompanyName,
        a.VacancyId
),

ranked AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY Title
            ORDER BY ResumeBeforeHire DESC
        ) AS rn
    FROM counts
)

SELECT 
    Title,
    CompanyName,
    ResumeBeforeHire
FROM ranked
WHERE rn = 1;