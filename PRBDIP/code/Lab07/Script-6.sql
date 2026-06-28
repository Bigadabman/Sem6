
WITH department_staff AS (
    SELECT
        v.Title AS department_name,
        EXTRACT(YEAR FROM a.AppliedAt) AS plan_year,
        EXTRACT(MONTH FROM a.AppliedAt) AS plan_month,
        COUNT(*) AS staff_count,
        CEIL(COUNT(*) * 6) AS room_area
    FROM Application a
        JOIN ApplicationStatus s ON a.StatusId = s.Id
        JOIN Vacancy v ON a.VacancyId = v.Id
    WHERE s.StatusName = 'Accepted'
    GROUP BY
        v.Title,
        EXTRACT(YEAR FROM a.AppliedAt),
        EXTRACT(MONTH FROM a.AppliedAt)
)
SELECT
    department_name,
    plan_year,
    plan_month,
    staff_count,
    room_area
FROM department_staff
MODEL
    PARTITION BY (department_name)
    DIMENSION BY (plan_year, plan_month)
    MEASURES (
        staff_count,
        room_area
    )
    RULES (
        staff_count[2026, 1] =
            CEIL(NVL(staff_count[2025, 12],
                NVL(staff_count[2025, 11],
                NVL(staff_count[2025, 10],
                    staff_count[2025, 9]))) * 1.05),
        room_area[2026, 1] = CEIL(staff_count[2026, 1] * 6),

        staff_count[2026, 2] = CEIL(staff_count[2026, 1] * 1.05),
        room_area[2026, 2] = CEIL(staff_count[2026, 2] * 6),

        staff_count[2026, 3] = CEIL(staff_count[2026, 2] * 1.05),
        room_area[2026, 3] = CEIL(staff_count[2026, 3] * 6),

        staff_count[2026, 4] = CEIL(staff_count[2026, 3] * 1.05),
        room_area[2026, 4] = CEIL(staff_count[2026, 4] * 6),

        staff_count[2026, 5] = CEIL(staff_count[2026, 4] * 1.05),
        room_area[2026, 5] = CEIL(staff_count[2026, 5] * 6),

        staff_count[2026, 6] = CEIL(staff_count[2026, 5] * 1.05),
        room_area[2026, 6] = CEIL(staff_count[2026, 6] * 6),

        staff_count[2026, 7] = CEIL(staff_count[2026, 6] * 1.05),
        room_area[2026, 7] = CEIL(staff_count[2026, 7] * 6),

        staff_count[2026, 8] = CEIL(staff_count[2026, 7] * 1.05),
        room_area[2026, 8] = CEIL(staff_count[2026, 8] * 6),

        staff_count[2026, 9] = CEIL(staff_count[2026, 8] * 1.05),
        room_area[2026, 9] = CEIL(staff_count[2026, 9] * 6),

        staff_count[2026, 10] = CEIL(staff_count[2026, 9] * 1.05),
        room_area[2026, 10] = CEIL(staff_count[2026, 10] * 6),

        staff_count[2026, 11] = CEIL(staff_count[2026, 10] * 1.05),
        room_area[2026, 11] = CEIL(staff_count[2026, 11] * 6),

        staff_count[2026, 12] = CEIL(staff_count[2026, 11] * 1.05),
        room_area[2026, 12] = CEIL(staff_count[2026, 12] * 6)
    )
ORDER BY department_name, plan_year, plan_month;






SELECT 
    Title,
    less_date,
    less_val,
    more_date,
    more_val,
    less2_date,
    less2_val
FROM (
    SELECT 
        v.Title,
        TRUNC(a.AppliedAt, 'MM') AS month_date,
        COUNT(*) AS staff_count
    FROM Application a
    JOIN ApplicationStatus s ON a.StatusId = s.Id
    JOIN Vacancy v ON a.VacancyId = v.Id
    WHERE s.StatusName = 'Accepted'
    GROUP BY 
        v.Title,
        TRUNC(a.AppliedAt, 'MM')
)

MATCH_RECOGNIZE (
    PARTITION BY Title
    ORDER BY month_date

    MEASURES
        D1.month_date AS less_date,
        D1.staff_count AS less_val,

        U.month_date  AS more_date,
        U.staff_count AS more_val,

        D2.month_date AS less2_date,
        D2.staff_count AS less2_val

    PATTERN (D1 U D2)

    DEFINE
        D1 AS staff_count < PREV(staff_count),
        U  AS staff_count > PREV(staff_count),
        D2 AS staff_count < PREV(staff_count)
);
