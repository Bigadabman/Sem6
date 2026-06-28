
CREATE TABLE person (
    person_id NUMBER PRIMARY KEY,
    person_name VARCHAR2(100) NOT NULL,
    birth_date DATE NOT NULL
);



BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE vacation_load PURGE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;



CREATE TABLE vacation (
    vacation_id NUMBER PRIMARY KEY,
    person_id NUMBER NOT NULL,
    start_date DATE NOT NULL,
    vacation_days NUMBER(5, 1) NOT NULL,
    payment NUMBER(10, 2) NOT NULL,
    CONSTRAINT fk_vacation_person
        FOREIGN KEY (person_id) REFERENCES person(person_id)
);


CREATE TABLE vacation_load (
    vacation_id NUMBER PRIMARY KEY,
    person_name VARCHAR2(100) NOT NULL,
    vacation_start DATE NOT NULL,
    vacation_days NUMBER(5, 1) NOT NULL,
    payment NUMBER(10, 1) NOT NULL
);

INSERT INTO person (person_id, person_name, birth_date)
VALUES (1, 'Ivan Petrov', DATE '1999-02-10');

INSERT INTO person (person_id, person_name, birth_date)
VALUES (2, 'Anna Volkova', DATE '2001-07-21');

INSERT INTO person (person_id, person_name, birth_date)
VALUES (3, 'Maksim Orlov', DATE '1997-11-04');

INSERT INTO vacation
    (vacation_id, person_id, start_date, end_date, vacation_days, payment)
VALUES
    (1, 1, DATE '2026-05-12', DATE '2026-05-19', 8.0, 880.40);

INSERT INTO vacation
    (vacation_id, person_id, start_date, end_date, vacation_days, payment)
VALUES
    (2, 2, DATE '2026-06-03', DATE '2026-06-16', 14.0, 1600.75);

INSERT INTO vacation
    (vacation_id, person_id, start_date, end_date, vacation_days, payment)
VALUES
    (3, 3, DATE '2026-07-01', DATE '2026-07-07', 7.0, 790.20);

INSERT INTO vacation
    (vacation_id, person_id, start_date, end_date, vacation_days, payment)
VALUES
    (4, 1, DATE '2026-08-10', DATE '2026-08-15', 6.0, 640.10);

COMMIT;


CREATE OR REPLACE TYPE vacation_row AS OBJECT (
    vacation_id NUMBER,
    person_name VARCHAR2(100),
    start_date DATE,
    vacation_days NUMBER(5, 1),
    payment NUMBER(10, 2)
);
/

CREATE OR REPLACE TYPE vacation_table
    AS TABLE OF vacation_row;
/






CREATE OR REPLACE FUNCTION vacations_by_period (
    p_date_from DATE,
    p_date_to DATE
)
RETURN vacation_table PIPELINED
IS
BEGIN
    FOR rec IN (
        SELECT
            v.vacation_id,
            p.person_name,
            v.start_date,
            v.vacation_days,
            v.payment
        FROM vacation v
        JOIN person p ON p.person_id = v.person_id
        WHERE v.start_date BETWEEN p_date_from AND p_date_to
        ORDER BY v.vacation_id
    )
    LOOP
        PIPE ROW(
            vacation_row(
                rec.vacation_id,
                rec.person_name,
                rec.start_date,
                rec.vacation_days,
                rec.payment
            )
        );
    END LOOP;

    RETURN;
END;
/




SELECT *
FROM TABLE(
    vacations_by_period(
        DATE '2026-06-01',
        DATE '2026-08-31'
    )
);


SELECT * FROM VACATION_LOAD;
