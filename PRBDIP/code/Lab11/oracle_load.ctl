OPTIONS (SKIP=1)
LOAD DATA
CHARACTERSET AL32UTF8
INFILE 'oracle_load.csv'
APPEND
INTO TABLE sys.vacation_load
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
TRAILING NULLCOLS
(
    vacation_id INTEGER EXTERNAL,
    person_name CHAR "UPPER(:person_name)",
    vacation_start CHAR "TO_DATE(SUBSTR(:vacation_start, 1, 10), 'YYYY-MM-DD')",
    vacation_days DECIMAL EXTERNAL "ROUND(:vacation_days, 1)",
    payment CHAR "ROUND(TO_NUMBER(REPLACE(:payment, CHR(13), '')), 1)"
)