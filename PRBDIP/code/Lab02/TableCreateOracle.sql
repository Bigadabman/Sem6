alter pluggable database KEO_PDB open

CREATE TABLE Role (
    Id NUMBER PRIMARY KEY,
    RoleName VARCHAR2(50) NOT NULL UNIQUE
);

CREATE SEQUENCE Role_seq START WITH 1 INCREMENT BY 1;


CREATE OR REPLACE TRIGGER Role_trg
BEFORE INSERT ON Role
FOR EACH ROW
BEGIN
    :NEW.Id := Role_seq.NEXTVAL;
END;
/


CREATE TABLE Users (
    Id NUMBER PRIMARY KEY,
    Email VARCHAR2(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR2(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsBlocked NUMBER(1) DEFAULT 0 CHECK (IsBlocked IN (0,1)),
    Name VARCHAR2(50) NOT NULL,
    Surname VARCHAR2(50) NOT NULL,
    Phone VARCHAR2(20),
    City VARCHAR2(100),
    RoleId NUMBER NOT NULL,
    CONSTRAINT FK_User_Role FOREIGN KEY (RoleId)
        REFERENCES Role(Id)
);


CREATE SEQUENCE Users_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER Users_trg
BEFORE INSERT ON Users
FOR EACH ROW
BEGIN
    :NEW.Id := Users_seq.NEXTVAL;
END;
/


CREATE TABLE Company (
    Id NUMBER PRIMARY KEY,
    OwnerUserId NUMBER NOT NULL,
    CompanyName VARCHAR2(150) NOT NULL,
    Description CLOB,
    Website VARCHAR2(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Company_User FOREIGN KEY (OwnerUserId)
        REFERENCES Users(Id)
);




CREATE TABLE Resume (
    Id NUMBER PRIMARY KEY,
    CandidateId NUMBER NOT NULL,
    Title VARCHAR2(150) NOT NULL,
    ExperienceYears NUMBER CHECK (ExperienceYears >= 0),
    Education VARCHAR2(255),
    DesiredSalary NUMBER(12,2),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP,
    CONSTRAINT FK_Resume_User FOREIGN KEY (CandidateId)
        REFERENCES Users(Id)
);




CREATE TABLE Vacancy (
    Id NUMBER PRIMARY KEY,
    CompanyId NUMBER NOT NULL,
    Title VARCHAR2(150) NOT NULL,
    Description CLOB,
    SalaryFrom NUMBER(12,2),
    SalaryTo NUMBER(12,2),
    City VARCHAR2(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Vacancy_Company FOREIGN KEY (CompanyId)
        REFERENCES Company(Id),
    CONSTRAINT CHK_Salary CHECK (SalaryFrom <= SalaryTo)
);


CREATE TABLE ApplicationStatus (
    Id NUMBER PRIMARY KEY,
    StatusName VARCHAR2(50) NOT NULL UNIQUE
);


CREATE TABLE Application (
    Id NUMBER PRIMARY KEY,
    StatusId NUMBER NOT NULL,
    ResumeId NUMBER NOT NULL,
    VacancyId NUMBER NOT NULL,
    AppliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_App_Status FOREIGN KEY (StatusId)
        REFERENCES ApplicationStatus(Id),
    CONSTRAINT FK_App_Resume FOREIGN KEY (ResumeId)
        REFERENCES Resume(Id),
    CONSTRAINT FK_App_Vacancy FOREIGN KEY (VacancyId)
        REFERENCES Vacancy(Id)
);


CREATE TABLE Skill (
    Id NUMBER PRIMARY KEY,
    SkillName VARCHAR2(100) NOT NULL UNIQUE
);


CREATE TABLE ResumeSkill (
    ResumeId NUMBER NOT NULL,
    SkillId NUMBER NOT NULL,
    CONSTRAINT PK_ResumeSkill PRIMARY KEY (ResumeId, SkillId),
    CONSTRAINT FK_RS_Resume FOREIGN KEY (ResumeId)
        REFERENCES Resume(Id),
    CONSTRAINT FK_RS_Skill FOREIGN KEY (SkillId)
        REFERENCES Skill(Id)
);


CREATE TABLE VacancySkill (
    VacancyId NUMBER NOT NULL,
    SkillId NUMBER NOT NULL,
    CONSTRAINT PK_VacancySkill PRIMARY KEY (VacancyId, SkillId),
    CONSTRAINT FK_VS_Vacancy FOREIGN KEY (VacancyId)
        REFERENCES Vacancy(Id),
    CONSTRAINT FK_VS_Skill FOREIGN KEY (SkillId)
        REFERENCES Skill(Id)
);


CREATE INDEX IX_User_RoleId ON Users(RoleId);
CREATE INDEX IX_Company_OwnerUserId ON Company(OwnerUserId);
CREATE INDEX IX_Resume_CandidateId ON Resume(CandidateId);
CREATE INDEX IX_Vacancy_CompanyId ON Vacancy(CompanyId);
CREATE INDEX IX_App_StatusId ON Application(StatusId);
CREATE INDEX IX_App_ResumeId ON Application(ResumeId);
CREATE INDEX IX_App_VacancyId ON Application(VacancyId);


CREATE OR REPLACE VIEW View_VacancyDetails AS
SELECT v.Id,
       v.Title,
       v.City,
       v.SalaryFrom,
       v.SalaryTo,
       c.CompanyName
FROM Vacancy v
JOIN Company c ON v.CompanyId = c.Id;


CREATE OR REPLACE VIEW View_ApplicationDetails AS
SELECT a.Id,
       u.Name,
       u.Surname,
       v.Title AS VacancyTitle,
       s.StatusName,
       a.AppliedAt
FROM Application a
JOIN Resume r ON a.ResumeId = r.Id
JOIN Users u ON r.CandidateId = u.Id
JOIN Vacancy v ON a.VacancyId = v.Id
JOIN ApplicationStatus s ON a.StatusId = s.Id;

