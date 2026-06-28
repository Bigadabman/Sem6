

CREATE TABLE lob_files (
    id NUMBER PRIMARY KEY,
    title VARCHAR2(100) NOT NULL
) TABLESPACE lob_ts;


ALTER TABLE lob_files ADD (
    foto BLOB,
    doc_file BFILE
);


DECLARE
    v_photo_file BFILE := BFILENAME('LOB_DOC_DIR', 'photo.png');
    v_foto BLOB;
BEGIN
    INSERT INTO lob_files (id, title, foto, doc_file)
    VALUES (
        1,
        'Photo and PDF',
        EMPTY_BLOB(),
        BFILENAME('LOB_DOC_DIR', 'doc.pdf')
    )
    RETURNING foto INTO v_foto;

    DBMS_LOB.FILEOPEN(v_photo_file, DBMS_LOB.FILE_READONLY);
    DBMS_LOB.LOADFROMFILE(
        v_foto,
        v_photo_file,
        DBMS_LOB.GETLENGTH(v_photo_file)
    );
    DBMS_LOB.FILECLOSE(v_photo_file);

    COMMIT;
END;
/


SELECT * FROM lob_files;
