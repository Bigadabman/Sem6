CREATE OR REPLACE TYPE VacationList AS TABLE OF VacationType;
/

CREATE OR REPLACE TYPE PersonWithVacations AS OBJECT (
    id NUMBER,
    name VARCHAR2(100),
    vacations VacationList,

    MAP MEMBER FUNCTION mapId RETURN NUMBER
);
/

CREATE OR REPLACE TYPE BODY PersonWithVacations AS
    MAP MEMBER FUNCTION mapId RETURN NUMBER IS
    BEGIN
        RETURN SELF.id;
    END;
END;
/


CREATE OR REPLACE TYPE PersonCollection AS TABLE OF PersonWithVacations;
/


DECLARE
    persons PersonCollection;
BEGIN
    SELECT PersonWithVacations(
        p.id,
        p.name,
        CAST(
            MULTISET(
                SELECT VALUE(v)
                FROM VacationObj v
                WHERE v.personId = p.id
            ) AS VacationList
        )
    )
    BULK COLLECT INTO persons
    FROM PersonObj p;

    DBMS_OUTPUT.PUT_LINE('K1 загружена, элементов: ' || persons.COUNT);
END;
/


DECLARE
    persons PersonCollection;
    testPerson PersonWithVacations;
BEGIN
    SELECT PersonWithVacations(
        p.id,
        p.name,
        CAST(
            MULTISET(
                SELECT VALUE(v)
                FROM VacationObj v
                WHERE v.personId = p.id
            ) AS VacationList
        )
    )
    BULK COLLECT INTO persons
    FROM PersonObj p;

    IF persons.COUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('K1 пуста, проверять нечего');
    ELSE
        testPerson := persons(1);

        IF testPerson MEMBER OF persons THEN
            DBMS_OUTPUT.PUT_LINE('Элемент является членом K1');
        ELSE
            DBMS_OUTPUT.PUT_LINE('Элемент не является членом K1');
        END IF;
    END IF;
END;
/


DECLARE
    persons PersonCollection;
BEGIN
    SELECT PersonWithVacations(
        p.id,
        p.name,
        CAST(
            MULTISET(
                SELECT VALUE(v)
                FROM VacationObj v
                WHERE v.personId = p.id
            ) AS VacationList
        )
    )
    BULK COLLECT INTO persons
    FROM PersonObj p;

    IF persons.COUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('K1 пуста');
    ELSE
        DBMS_OUTPUT.PUT_LINE('K1 не пуста');
    END IF;

    FOR i IN 1..persons.COUNT LOOP
        IF persons(i).vacations.COUNT = 0 THEN
            DBMS_OUTPUT.PUT_LINE('У человека ' || persons(i).name || ' нет отпусков');
        END IF;
    END LOOP;
END;
/



SELECT
    p.id,
    p.name,
    v.id AS vacation_id,
    v.days
FROM TABLE(
    CAST(
        MULTISET(
            SELECT PersonWithVacations(
                p.id,
                p.name,
                CAST(
                    MULTISET(
                        SELECT VALUE(v)
                        FROM VacationObj v
                        WHERE v.personId = p.id
                    ) AS VacationList
                )
            )
            FROM PersonObj p
        ) AS PersonCollection
    )
) p,
TABLE(p.vacations) v
ORDER BY p.id, v.id;



DECLARE
    TYPE PersonIdList IS TABLE OF PersonObj.id%TYPE;
    TYPE SalaryList IS TABLE OF PersonObj.salary%TYPE;

    ids PersonIdList;
    salaries SalaryList;
    updatedCount NUMBER := 0;
BEGIN
    SELECT id, salary
    BULK COLLECT INTO ids, salaries
    FROM PersonObj;

    DBMS_OUTPUT.PUT_LINE('Загружено людей: ' || ids.COUNT);

    IF ids.COUNT > 0 THEN
        FORALL i IN 1..ids.COUNT
            UPDATE PersonObj
            SET salary = ROUND(salaries(i) * 1.1, 2)
            WHERE id = ids(i);

        updatedCount := SQL%ROWCOUNT;
    END IF;

    DBMS_OUTPUT.PUT_LINE('Зарплаты обновлены: ' || updatedCount);
END;
/
