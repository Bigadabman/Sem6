-- ===========================
-- DROP TABLES (Oracle order)
-- ===========================

DROP TABLE AUDITORIUM CASCADE CONSTRAINTS;
DROP TABLE AUDITORIUM_TYPE CASCADE CONSTRAINTS;
DROP TABLE SUBJECT CASCADE CONSTRAINTS;
DROP TABLE TEACHER CASCADE CONSTRAINTS;
DROP TABLE PULPIT CASCADE CONSTRAINTS;
DROP TABLE FACULTY CASCADE CONSTRAINTS;


-- ===========================
-- AUDITORIUM_TYPE
-- ===========================

CREATE TABLE AUDITORIUM_TYPE
(
    AUDITORIUM_TYPE NVARCHAR2(10) CONSTRAINT AUDITORIUM_TYPE_PK PRIMARY KEY,
    AUDITORIUM_TYPENAME NVARCHAR2(30)
);

INSERT ALL
 INTO AUDITORIUM_TYPE VALUES ('ЛК','Лекционная')
 INTO AUDITORIUM_TYPE VALUES ('ЛБ-К','Компьютерный класс')
 INTO AUDITORIUM_TYPE VALUES ('ЛК-К','Лекционная с уст. проектором')
 INTO AUDITORIUM_TYPE VALUES ('ЛБ-X','Химическая лаборатория')
 INTO AUDITORIUM_TYPE VALUES ('ЛБ-СК','Спец. компьютерный класс')
SELECT * FROM dual;

select * from pulpit inner join subject on pulpit.pulpit = subject.pulpit inner join faculty on pulpit.faculty = faculty.faculty;

-- ===========================
-- AUDITORIUM
-- ===========================

CREATE TABLE AUDITORIUM
(
    AUDITORIUM VARCHAR2(20) CONSTRAINT AUDITORIUM_PK PRIMARY KEY,
    AUDITORIUM_TYPE NVARCHAR2(10),
    AUDITORIUM_CAPACITY NUMBER DEFAULT 1
        CONSTRAINT AUDITORIUM_CAPACITY_CHECK CHECK (AUDITORIUM_CAPACITY BETWEEN 1 AND 300),
    AUDITORIUM_NAME VARCHAR2(50),

    CONSTRAINT AUDITORIUM_AUDITORIUM_TYPE_FK
        FOREIGN KEY (AUDITORIUM_TYPE)
        REFERENCES AUDITORIUM_TYPE(AUDITORIUM_TYPE)
);

INSERT ALL
 INTO AUDITORIUM VALUES ('206-1','ЛБ-К',15,'206-1')
 INTO AUDITORIUM VALUES ('301-1','ЛБ-К',15,'301-1')
 INTO AUDITORIUM VALUES ('236-1','ЛК',60,'236-1')
 INTO AUDITORIUM VALUES ('313-1','ЛК-К',60,'313-1')
 INTO AUDITORIUM VALUES ('324-1','ЛК-К',50,'324-1')
 INTO AUDITORIUM VALUES ('413-1','ЛБ-К',15,'413-1')
 INTO AUDITORIUM VALUES ('423-1','ЛБ-К',90,'423-1')
 INTO AUDITORIUM VALUES ('408-2','ЛК',90,'408-2')
SELECT * FROM dual;



-- ===========================
-- FACULTY
-- ===========================

CREATE TABLE FACULTY
(
    FACULTY NVARCHAR2(10) PRIMARY KEY,
    FACULTY_NAME NVARCHAR2(50) DEFAULT 'Не указано'
);

INSERT ALL
 INTO FACULTY VALUES ('ХТиТ','Химическая технология и техника')
 INTO FACULTY VALUES ('ЛХФ','Лесохозяйственный факультет')
 INTO FACULTY VALUES ('ИЭФ','Инженерно-экономический факультет')
 INTO FACULTY VALUES ('ТТЛП','Технология и техника лесной промышленности')
 INTO FACULTY VALUES ('ТОВ','Технология органических веществ')
 INTO FACULTY VALUES ('ИТ','Факультет информационных технологий')
 INTO FACULTY VALUES ('ИДиП','Издательское дело и полиграфия')
SELECT * FROM dual;



-- ===========================
-- PULPIT
-- ===========================

CREATE TABLE PULPIT
(
    PULPIT NVARCHAR2(20) PRIMARY KEY,
    PULPIT_NAME NVARCHAR2(100),
    FACULTY NVARCHAR2(10),

    CONSTRAINT PULPIT_FACULTY_FK
        FOREIGN KEY (FACULTY)
        REFERENCES FACULTY(FACULTY)
);

INSERT ALL
 INTO PULPIT VALUES ('ИСиТ','Информационных систем и технологий','ИТ')
 INTO PULPIT VALUES ('ЛВ','Лесоводства','ЛХФ')
 INTO PULPIT VALUES ('ЛУ','Лесоустройства','ЛХФ')
 INTO PULPIT VALUES ('ЛЗиДВ','Лесозащиты и древесиноведения','ЛХФ')
 INTO PULPIT VALUES ('ЛКиП','Лесных культур и почвоведения','ЛХФ')
 INTO PULPIT VALUES ('ТиП','Туризма и природопользования','ЛХФ')
 INTO PULPIT VALUES ('ЛПиСПС','Ландшафтного проектирования и садово-паркового строительства','ЛХФ')
 INTO PULPIT VALUES ('ТЛ','Транспорта леса','ТТЛП')
 INTO PULPIT VALUES ('ЛМиЛЗ','Лесных машин и технологии лесозаготовок','ТТЛП')
 INTO PULPIT VALUES ('ТДП','Технологий деревообрабатывающих производств','ТТЛП')
 INTO PULPIT VALUES ('ТиДИД','Технологии и дизайна изделий из древесины','ТТЛП')
 INTO PULPIT VALUES ('ОХ','Органической химии','ТОВ')
 INTO PULPIT VALUES ('ХПД','Химической переработки древесины','ТОВ')
 INTO PULPIT VALUES ('ТНВиОХТ','Технологии неорганических веществ и общей химической технологии','ХТиТ')
 INTO PULPIT VALUES ('ПиАХП','Процессов и аппаратов химических производств','ХТиТ')
 INTO PULPIT VALUES ('ЭТиМ','Экономической теории и маркетинга','ИЭФ')
 INTO PULPIT VALUES ('МиЭП','Менеджмента и экономики природопользования','ИЭФ')
 INTO PULPIT VALUES ('СБУАиА','Статистики, бухгалтерского учета, анализа и аудита','ИЭФ')
 INTO PULPIT VALUES ('ПОиСОИ','Полиграфического оборудования и систем обработки информации','ИДиП')
 INTO PULPIT VALUES ('БФ','Белорусской филологии','ИДиП')
 INTO PULPIT VALUES ('РИТ','Редакционно-издательских тенологий','ИДиП')
 INTO PULPIT VALUES ('ПП','Полиграфических производств','ИДиП')
SELECT * FROM dual;



-- ===========================
-- TEACHER
-- ===========================

CREATE TABLE TEACHER
(
    TEACHER NVARCHAR2(10) PRIMARY KEY,
    TEACHER_NAME NVARCHAR2(50),
    PULPIT NVARCHAR2(20),

    CONSTRAINT TEACHER_PULPIT_FK
        FOREIGN KEY (PULPIT)
        REFERENCES PULPIT(PULPIT)
);

INSERT ALL
 INTO TEACHER VALUES ('СМЛВ','Смелов Владимир Владиславович','ИСиТ')
 INTO TEACHER VALUES ('АКНВЧ','Акунович Станислав Иванович','ИСиТ')
 INTO TEACHER VALUES ('КЛСНВ','Колесников Виталий Леонидович','ИСиТ')
 INTO TEACHER VALUES ('БРКВЧ','Бракович Андрей Игоревич','ИСиТ')
 INTO TEACHER VALUES ('ДТК','Дятко Александр Аркадьевич','ИСиТ')
 INTO TEACHER VALUES ('УРБ','Урбанович Павел Павлович','ИСиТ')
 INTO TEACHER VALUES ('ГРН','Гурин Николай Иванович','ИСиТ')
 INTO TEACHER VALUES ('ЖЛК','Жиляк Надежда Александровна','ИСиТ')
 INTO TEACHER VALUES ('МРЗ','Мороз Елена Станиславовна','ИСиТ')
 INTO TEACHER VALUES ('БРНВСК','Барановский Станислав Иванович','ЭТиМ')
 INTO TEACHER VALUES ('НВРВ','Неверов Александр Васильевич','МиЭП')
 INTO TEACHER VALUES ('ДМДК','Демидко Марина Николаевна','ЛПиСПС')
 INTO TEACHER VALUES ('БРГ','Бурганская Татьяна Минаевна','ЛПиСПС')
 INTO TEACHER VALUES ('РЖК','Рожков Леонид Николаевич','ЛВ')
 INTO TEACHER VALUES ('ЗВГЦВ','Звягинцев Вячеслав Борисович','ЛЗиДВ')
 INTO TEACHER VALUES ('БЗБРДВ','Безбородов Владимир Степанович','ОХ')
 INTO TEACHER VALUES ('НСКВЦ','Насковец Михаил Трофимович','ТЛ')
 INTO TEACHER VALUES ('БРТШВЧ','Барташевич Святослав Александрович','ПОиСОИ')
 INTO TEACHER VALUES ('АРС','Арсентьев Виталий Арсентьевич','ПОиСОИ')
SELECT * FROM dual;



-- ===========================
-- SUBJECT
-- ===========================

CREATE TABLE SUBJECT
(
    SUBJECT NVARCHAR2(10) PRIMARY KEY,
    SUBJECT_NAME NVARCHAR2(100) UNIQUE,
    PULPIT NVARCHAR2(20),

    CONSTRAINT SUBJECT_PULPIT_FK
        FOREIGN KEY (PULPIT)
        REFERENCES PULPIT(PULPIT)
);

INSERT ALL
 INTO SUBJECT VALUES ('СУБД','Системы управления базами данных','ИСиТ')
 INTO SUBJECT VALUES ('БД','Базы данных','ИСиТ')
 INTO SUBJECT VALUES ('ИНФ','Информационные технологии','ИСиТ')
 INTO SUBJECT VALUES ('ОАиП','Основы алгоритмизации и программирования','ИСиТ')
 INTO SUBJECT VALUES ('ПЗ','Представление знаний в компьютерных системах','ИСиТ')
 INTO SUBJECT VALUES ('ПСП','Программирование сетевых приложений','ИСиТ')
 INTO SUBJECT VALUES ('МСОИ','Моделирование систем обработки информации','ИСиТ')
 INTO SUBJECT VALUES ('ПИС','Проектирование информационных систем','ИСиТ')
 INTO SUBJECT VALUES ('КГ','Компьютерная геометрия','ИСиТ')
 INTO SUBJECT VALUES ('КМС','Компьютерные мультимедийные системы','ИСиТ')
 INTO SUBJECT VALUES ('ДМ','Дискретная математика','ИСиТ')
 INTO SUBJECT VALUES ('МП','Математическое программирование','ИСиТ')
 INTO SUBJECT VALUES ('ЛЭВМ','Логические основы ЭВМ','ИСиТ')
 INTO SUBJECT VALUES ('ООП','Объектно-ориентированное программирование','ИСиТ')
 INTO SUBJECT VALUES ('ЭП','Экономика природопользования','МиЭП')
 INTO SUBJECT VALUES ('ЭТ','Экономическая теория','ЭТиМ')
 INTO SUBJECT VALUES ('ОСПиЛПХ','Основы садово-паркового и лесопаркового хозяйства','ЛПиСПС')
 INTO SUBJECT VALUES ('ИГ','Инженерная геодезия','ЛУ')
 INTO SUBJECT VALUES ('ЛВ','Лесоводство','ЛЗиДВ')
 INTO SUBJECT VALUES ('ОХ','Органическая химия','ОХ')
 INTO SUBJECT VALUES ('ВТЛ','Водный транспорт леса','ТЛ')
 INTO SUBJECT VALUES ('ТиОЛ','Технология и оборудование лесозаготовок','ЛМиЛЗ')
 INTO SUBJECT VALUES ('ТОПИ','Технология обогащения полезных ископаемых','ТНВиОХТ')
 INTO SUBJECT VALUES ('ПМАПЛ','Полиграф. машины, автоматы и поточные линии','ПОиСОИ')
 INTO SUBJECT VALUES ('ОПП','Организация полиграф. производства','ПОиСОИ')
SELECT * FROM dual;