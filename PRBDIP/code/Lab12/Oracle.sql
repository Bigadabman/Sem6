


SET SERVEROUTPUT ON;

BEGIN
    EXECUTE IMMEDIATE 'DROP INDEX report_xml_idx';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1418 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE report PURGE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE vacation_kind PURGE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

CREATE TABLE vacation_kind (
    kind_id NUMBER PRIMARY KEY,
    kind_name VARCHAR2(50) NOT NULL
);



INSERT INTO vacation_kind (kind_id, kind_name)
VALUES (1, 'Regular vacation');

INSERT INTO vacation_kind (kind_id, kind_name)
VALUES (2, 'Long vacation');

INSERT INTO vacation_kind (kind_id, kind_name)
VALUES (3, 'Short vacation');



BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE vacation ADD kind_id NUMBER';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1430 THEN
            RAISE;
        END IF;
END;
/

UPDATE vacation
SET kind_id =
    CASE
        WHEN vacation_days >= 14 THEN 2
        WHEN vacation_days < 8 THEN 3
        ELSE 1
    END;

COMMIT;

CREATE TABLE report (
    id NUMBER PRIMARY KEY,
    xml_data XMLTYPE
);


CREATE OR REPLACE PROCEDURE generate_vacation_xml (
    p_xml OUT XMLTYPE
)
IS
BEGIN
    SELECT XMLELEMENT(
        "vacation_report",
        XMLATTRIBUTES(
            TO_CHAR(SYSTIMESTAMP, 'YYYY-MM-DD HH24:MI:SS') AS "created_at"
        ),

        (
            SELECT XMLELEMENT(
                "summary",
                XMLELEMENT("total_vacations", COUNT(*)),
                XMLELEMENT("total_days", SUM(vacation_days)),
                XMLELEMENT("total_payment", SUM(payment))
            )
            FROM vacation
        ),

        (
            SELECT XMLELEMENT(
                "person_totals",
                XMLAGG(
                    XMLELEMENT(
                        "person_total",
                        XMLATTRIBUTES(person_id AS "person_id"),
                        XMLELEMENT("person_name", person_name),
                        XMLELEMENT("vacation_count", vacation_count),
                        XMLELEMENT("days_sum", days_sum),
                        XMLELEMENT("payment_sum", payment_sum)
                    )
                    ORDER BY person_id
                )
            )
            FROM (
                SELECT
                    p.person_id,
                    p.person_name,
                    COUNT(*) AS vacation_count,
                    SUM(v.vacation_days) AS days_sum,
                    SUM(v.payment) AS payment_sum
                FROM vacation v
                JOIN person p ON p.person_id = v.person_id
                GROUP BY p.person_id, p.person_name
            )
        ),

        (
            SELECT XMLELEMENT(
                "vacations",
                XMLAGG(
                    XMLELEMENT(
                        "vacation",
                        XMLATTRIBUTES(v.vacation_id AS "id"),
                        XMLELEMENT("person_name", p.person_name),
                        XMLELEMENT("kind_name", k.kind_name),
                        XMLELEMENT("start_date", TO_CHAR(v.start_date, 'YYYY-MM-DD')),
                        XMLELEMENT("end_date", TO_CHAR(v.end_date, 'YYYY-MM-DD')),
                        XMLELEMENT("vacation_days", v.vacation_days),
                        XMLELEMENT("payment", v.payment)
                    )
                    ORDER BY v.vacation_id
                )
            )
            FROM vacation v
            JOIN person p ON p.person_id = v.person_id
            JOIN vacation_kind k ON k.kind_id = v.kind_id
        )
    )
    INTO p_xml
    FROM dual;
END;
/

CREATE OR REPLACE PROCEDURE insert_vacation_report
IS
    v_xml XMLTYPE;
    v_id NUMBER;
BEGIN
    generate_vacation_xml(v_xml);

    SELECT NVL(MAX(id), 0) + 1
    INTO v_id
    FROM report;

    INSERT INTO report (id, xml_data)
    VALUES (v_id, v_xml);

    COMMIT;
END;
/


CREATE INDEX report_xml_idx
ON report (EXTRACTVALUE(xml_data, '/vacation_report/@created_at'));




CREATE OR REPLACE PROCEDURE find_vacations_in_xml (
    p_person_name VARCHAR2
)
IS
BEGIN
    FOR rec IN (
        SELECT
            r.id AS report_id,
            x.vacation_id,
            x.person_name,
            x.kind_name,
            x.start_date,
            x.vacation_days,
            x.payment
        FROM report r,
        XMLTABLE(
            '/vacation_report/vacations/vacation'
            PASSING r.xml_data
            COLUMNS
                vacation_id NUMBER PATH '@id',
                person_name VARCHAR2(100) PATH 'person_name',
                kind_name VARCHAR2(50) PATH 'kind_name',
                start_date VARCHAR2(10) PATH 'start_date',
                vacation_days NUMBER PATH 'vacation_days',
                payment NUMBER PATH 'payment'
        ) x
        WHERE UPPER(x.person_name) = UPPER(p_person_name)
        ORDER BY x.vacation_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE(
            'report=' || rec.report_id ||
            ', vacation=' || rec.vacation_id ||
            ', person=' || rec.person_name ||
            ', kind=' || rec.kind_name ||
            ', start=' || rec.start_date ||
            ', days=' || rec.vacation_days ||
            ', payment=' || rec.payment
        );
    END LOOP;
END;
/


BEGIN
    insert_vacation_report;
END;
/

SELECT
    id,
    XMLSERIALIZE(CONTENT xml_data AS CLOB INDENT SIZE = 2) AS xml_text
FROM report;



BEGIN
    find_vacations_in_xml('Ivan Petrov');
END;
/


SELECT 
	id,
	xml_data
	FROM report;


SELECT
    id,
    EXTRACTVALUE(xml_data, '/vacation_report/@created_at') AS created_at
FROM report;


SELECT id
FROM report
WHERE EXTRACTVALUE(xml_data, '/vacation_report/@created_at') > '2026-05-28 18:55:51';

0