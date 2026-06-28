

BEGIN
    EXECUTE IMMEDIATE 'DROP VIEW VacationView';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP VIEW PersonView';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE VacationObj';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE PersonObj';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TYPE VacationType FORCE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -4043 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TYPE PersonType FORCE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -4043 THEN
            RAISE;
        END IF;
END;
/

CREATE OR REPLACE TYPE PersonType AS OBJECT (
    id NUMBER,
    name VARCHAR2(100),
    salary NUMBER,

    CONSTRUCTOR FUNCTION PersonType(
        id NUMBER,
        name VARCHAR2
    ) RETURN SELF AS RESULT,

    MAP MEMBER FUNCTION mapSalary RETURN NUMBER,

    MEMBER FUNCTION getAnnualSalary RETURN NUMBER DETERMINISTIC,

    MEMBER PROCEDURE raiseSalary(percent NUMBER)
);
/

CREATE OR REPLACE TYPE BODY PersonType AS

    CONSTRUCTOR FUNCTION PersonType(
        id NUMBER,
        name VARCHAR2
    ) RETURN SELF AS RESULT IS
    BEGIN
        SELF.id := id;
        SELF.name := name;
        SELF.salary := 1000;
        RETURN;
    END;

    MAP MEMBER FUNCTION mapSalary RETURN NUMBER IS
    BEGIN
        RETURN SELF.salary;
    END;

    MEMBER FUNCTION getAnnualSalary RETURN NUMBER DETERMINISTIC IS
    BEGIN
        RETURN SELF.salary * 12;
    END;

    MEMBER PROCEDURE raiseSalary(percent NUMBER) IS
    BEGIN
        SELF.salary := ROUND(SELF.salary * (1 + percent / 100), 2);
        DBMS_OUTPUT.PUT_LINE(SELF.name || '; salary: ' || SELF.salary);
    END;

END;
/

CREATE OR REPLACE TYPE VacationType AS OBJECT (
    id NUMBER,
    personId NUMBER,
    days NUMBER,

    CONSTRUCTOR FUNCTION VacationType(
        id NUMBER,
        personId NUMBER
    ) RETURN SELF AS RESULT,

    MAP MEMBER FUNCTION mapDays RETURN NUMBER,

    MEMBER FUNCTION getInfo RETURN VARCHAR2,

    MEMBER PROCEDURE addDays(daysToAdd NUMBER)
);
/

CREATE OR REPLACE TYPE BODY VacationType AS

    CONSTRUCTOR FUNCTION VacationType(
        id NUMBER,
        personId NUMBER
    ) RETURN SELF AS RESULT IS
    BEGIN
        SELF.id := id;
        SELF.personId := personId;
        SELF.days := 14;
        RETURN;
    END;

    MAP MEMBER FUNCTION mapDays RETURN NUMBER IS
    BEGIN
        RETURN SELF.days;
    END;

    MEMBER FUNCTION getInfo RETURN VARCHAR2 IS
    BEGIN
        RETURN 'Person id: ' || personId || '; vacation days: ' || days;
    END;

    MEMBER PROCEDURE addDays(daysToAdd NUMBER) IS
    BEGIN
        SELF.days := SELF.days + daysToAdd;
        DBMS_OUTPUT.PUT_LINE('Vacation ' || SELF.id || '; days: ' || SELF.days);
    END;

END;
/

SELECT object_name, status
FROM user_objects
WHERE object_type = 'TYPE'
  AND object_name IN ('PERSONTYPE', 'VACATIONTYPE');


CREATE TABLE PersonObj OF PersonType (
    CONSTRAINT pk_person_obj PRIMARY KEY (id)
);

CREATE TABLE VacationObj OF VacationType (
    CONSTRAINT pk_vacation_obj PRIMARY KEY (id)
);


INSERT INTO PersonObj
SELECT PersonType(Id, Name || ' ' || Surname, 1000)
FROM "User";


INSERT INTO VacationObj
SELECT VacationType(Id, Id)
FROM "User";

COMMIT;


CREATE OR REPLACE VIEW PersonView OF PersonType
WITH OBJECT IDENTIFIER (id)
AS
SELECT
    Id,
    Name || ' ' || Surname AS name,
    1000 AS salary
FROM "User";

CREATE OR REPLACE VIEW VacationView OF VacationType
WITH OBJECT IDENTIFIER (id)
AS
SELECT
    Id,
    Id AS personId,
    14 AS days
FROM "User";


CREATE INDEX idx_person_salary ON PersonObj(salary);
CREATE INDEX idx_person_annual ON PersonObj p (p.getAnnualSalary());


SELECT * FROM PersonView;


SELECT p.name, p.salary
FROM PersonObj p
WHERE p.salary = 1000;



SELECT
p.name, p.getAnnualSalary() AS annual_salary
FROM PersonObj p
WHERE p.getAnnualSalary() = 12000;



/*CREATE OR REPLACE FUNCTION annualSalaryFunc(
    salary NUMBER
)
RETURN NUMBER DETERMINISTIC
IS
BEGIN
    RETURN salary * 12;
END;
/

CREATE INDEX idx_person_annual_salary
ON PersonObj(annualSalaryFunc(salary));



SELECT 
    p.name,
    p.salary,
    annualSalaryFunc(p.salary) AS annual_salary
FROM PersonObj p
WHERE annualSalaryFunc(p.salary) = 12000;


SELECT /*+ INDEX(p IDX_PERSON_ANNUAL_SALARY) 
    p.name,
    p.salary,
    annualSalaryFunc(p.salary) AS annual_salary
FROM PersonObj p
WHERE annualSalaryFunc(p.salary) = 24000;



BEGIN
    DBMS_STATS.GATHER_TABLE_STATS(
        ownname => USER,
        tabname => 'PERSONOBJ'
    );
END;
/

*/

