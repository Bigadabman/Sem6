use HireMe;
go

CREATE TABLE Role (
    Id INT IDENTITY PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE [User] (
    Id INT IDENTITY PRIMARY KEY,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    IsBlocked BIT DEFAULT 0,
    Name NVARCHAR(50) NOT NULL,
    Surname NVARCHAR(50) NOT NULL,
    Phone NVARCHAR(20),
    City NVARCHAR(100),
    RoleId INT NOT NULL,
    FOREIGN KEY (RoleId) REFERENCES Role(Id)
);

CREATE TABLE Company (
    Id INT IDENTITY PRIMARY KEY,
    OwnerUserId INT NOT NULL,
    CompanyName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX),
    Website NVARCHAR(255),
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Company_User FOREIGN KEY (OwnerUserId)
        REFERENCES [User](Id)
);


CREATE TABLE Resume (
    Id INT IDENTITY PRIMARY KEY,
    CandidateId INT NOT NULL,
    Title NVARCHAR(150) NOT NULL,
    ExperienceYears INT CHECK (ExperienceYears >= 0),
    Education NVARCHAR(255),
    DesiredSalary DECIMAL(12,2),
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2,
    CONSTRAINT FK_Resume_User FOREIGN KEY (CandidateId)
        REFERENCES [User](Id)
);


CREATE TABLE Vacancy (
    Id INT IDENTITY PRIMARY KEY,
    CompanyId INT NOT NULL,
    Title NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX),
    SalaryFrom DECIMAL(12,2),
    SalaryTo DECIMAL(12,2),
    City NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Vacancy_Company FOREIGN KEY (CompanyId)
        REFERENCES Company(Id),
    CONSTRAINT CHK_Salary CHECK (SalaryFrom <= SalaryTo)
);


CREATE TABLE ApplicationStatus (
    Id INT IDENTITY PRIMARY KEY,
    StatusName NVARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE Application (
    Id INT IDENTITY PRIMARY KEY,
    StatusId INT NOT NULL,
    ResumeId INT NOT NULL,
    VacancyId INT NOT NULL,
    AppliedAt DATETIME2 DEFAULT SYSDATETIME(),
    Comment NVARCHAR(500),
    CONSTRAINT FK_App_Status FOREIGN KEY (StatusId)
        REFERENCES ApplicationStatus(Id),
    CONSTRAINT FK_App_Resume FOREIGN KEY (ResumeId)
        REFERENCES Resume(Id),
    CONSTRAINT FK_App_Vacancy FOREIGN KEY (VacancyId)
        REFERENCES Vacancy(Id)
);


CREATE TABLE Skill (
    Id INT IDENTITY PRIMARY KEY,
    SkillName NVARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE ResumeSkill (
    ResumeId INT NOT NULL,
    SkillId INT NOT NULL,
    CONSTRAINT PK_ResumeSkill PRIMARY KEY (ResumeId, SkillId),
    CONSTRAINT FK_RS_Resume FOREIGN KEY (ResumeId)
        REFERENCES Resume(Id),
    CONSTRAINT FK_RS_Skill FOREIGN KEY (SkillId)
        REFERENCES Skill(Id)
);


CREATE TABLE VacancySkill (
    VacancyId INT NOT NULL,
    SkillId INT NOT NULL,
    CONSTRAINT PK_VacancySkill PRIMARY KEY (VacancyId, SkillId),
    CONSTRAINT FK_VS_Vacancy FOREIGN KEY (VacancyId)
        REFERENCES Vacancy(Id),
    CONSTRAINT FK_VS_Skill FOREIGN KEY (SkillId)
        REFERENCES Skill(Id)
);
go


CREATE INDEX IX_User_RoleId ON [User](RoleId);
CREATE INDEX IX_Company_OwnerUserId ON Company(OwnerUserId);
CREATE INDEX IX_Resume_CandidateId ON Resume(CandidateId);
CREATE INDEX IX_Vacancy_CompanyId ON Vacancy(CompanyId);
CREATE INDEX IX_App_StatusId ON Application(StatusId);
CREATE INDEX IX_App_ResumeId ON Application(ResumeId);
CREATE INDEX IX_App_VacancyId ON Application(VacancyId);


go


CREATE VIEW View_VacancyDetails AS
SELECT v.Id, v.Title, v.City, v.SalaryFrom, v.SalaryTo,
       c.CompanyName
FROM Vacancy v
JOIN Company c ON v.CompanyId = c.Id;

go


CREATE VIEW View_ApplicationDetails AS
SELECT a.Id,
       u.Name,
       u.Surname,
       v.Title AS VacancyTitle,
       s.StatusName,
       a.AppliedAt
FROM Application a
JOIN Resume r ON a.ResumeId = r.Id
JOIN [User] u ON r.CandidateId = u.Id
JOIN Vacancy v ON a.VacancyId = v.Id
JOIN ApplicationStatus s ON a.StatusId = s.Id;


go

