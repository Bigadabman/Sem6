const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.json());

const port = Number(process.env.PORT || 3000);
const dbName = process.env.DB_NAME || 'Celebrities';

if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
  throw new Error('DB_NAME may contain only letters, digits and underscore');
}

const baseSqlConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'StrongPass123!',
  server: process.env.DB_HOST || 'mssql',
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

const masterConfig = {
  ...baseSqlConfig,
  database: 'master'
};

const appConfig = {
  ...baseSqlConfig,
  database: dbName
};

let poolPromise;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function mapCelebrity(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.Id,
    fullName: row.FullName,
    nationality: row.Nationality,
    birthYear: row.BirthYear,
    photoUrl: row.PhotoUrl
  };
}

function readCelebrityBody(body) {
  const fullName = body.fullName || body.FullName;
  const nationality = body.nationality || body.Nationality;
  const birthYear = body.birthYear ?? body.BirthYear ?? null;
  const photoUrl = body.photoUrl ?? body.PhotoUrl ?? null;

  if (!fullName || !nationality) {
    const error = new Error('fullName and nationality are required');
    error.status = 400;
    throw error;
  }

  return { fullName, nationality, birthYear, photoUrl };
}

async function createDatabaseIfMissing() {
  const masterPool = await new sql.ConnectionPool(masterConfig).connect();

  try {
    await masterPool.request().query(`
      IF DB_ID(N'${dbName}') IS NULL
      BEGIN
        CREATE DATABASE [${dbName}];
      END
    `);
  } finally {
    await masterPool.close();
  }
}

async function createSchemaIfMissing(pool) {
  await pool.request().query(`
    IF OBJECT_ID(N'dbo.Celebrities', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Celebrities (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Celebrities PRIMARY KEY,
        FullName NVARCHAR(100) NOT NULL,
        Nationality NVARCHAR(100) NOT NULL,
        BirthYear INT NULL,
        PhotoUrl NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Celebrities_CreatedAt DEFAULT SYSUTCDATETIME()
      );
    END
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM dbo.Celebrities)
    BEGIN
      INSERT INTO dbo.Celebrities (FullName, Nationality, BirthYear, PhotoUrl)
      VALUES
        (N'Keanu Reeves', N'Canada', 1964, N'https://example.com/keanu.jpg'),
        (N'Marie Curie', N'Poland', 1867, N'https://example.com/curie.jpg'),
        (N'Freddie Mercury', N'United Kingdom', 1946, N'https://example.com/mercury.jpg');
    END
  `);
}

async function connectWithRetry() {
  for (let attempt = 1; attempt <= 40; attempt += 1) {
    try {
      await createDatabaseIfMissing();
      const pool = await new sql.ConnectionPool(appConfig).connect();
      await createSchemaIfMissing(pool);
      console.log(`Connected to MSSQL database ${dbName}`);
      return pool;
    } catch (err) {
      console.log(`MSSQL is not ready yet (${attempt}/40): ${err.message}`);
      await wait(3000);
    }
  }

  throw new Error('MSSQL connection failed after retries');
}

function getPool() {
  if (!poolPromise) {
    poolPromise = connectWithRetry();
  }

  return poolPromise;
}

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (err) {
      next(err);
    }
  };
}

app.get('/health', asyncHandler(async (req, res) => {
  const pool = await getPool();
  await pool.request().query('SELECT 1 AS ok');
  res.json({ status: 'ok', database: dbName });
}));

app.get('/celebrities', asyncHandler(async (req, res) => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT Id, FullName, Nationality, BirthYear, PhotoUrl
    FROM dbo.Celebrities
    ORDER BY Id
  `);

  res.json(result.recordset.map(mapCelebrity));
}));

app.get('/celebrities/:id', asyncHandler(async (req, res) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('Id', sql.Int, Number(req.params.id))
    .query(`
      SELECT Id, FullName, Nationality, BirthYear, PhotoUrl
      FROM dbo.Celebrities
      WHERE Id = @Id
    `);

  const celebrity = mapCelebrity(result.recordset[0]);
  if (!celebrity) {
    return res.status(404).json({ message: 'Celebrity not found' });
  }

  return res.json(celebrity);
}));

app.post('/celebrities', asyncHandler(async (req, res) => {
  const body = readCelebrityBody(req.body);
  const pool = await getPool();

  const result = await pool.request()
    .input('FullName', sql.NVarChar(100), body.fullName)
    .input('Nationality', sql.NVarChar(100), body.nationality)
    .input('BirthYear', sql.Int, body.birthYear)
    .input('PhotoUrl', sql.NVarChar(500), body.photoUrl)
    .query(`
      INSERT INTO dbo.Celebrities (FullName, Nationality, BirthYear, PhotoUrl)
      OUTPUT INSERTED.Id, INSERTED.FullName, INSERTED.Nationality, INSERTED.BirthYear, INSERTED.PhotoUrl
      VALUES (@FullName, @Nationality, @BirthYear, @PhotoUrl)
    `);

  res.status(201).json(mapCelebrity(result.recordset[0]));
}));

app.put('/celebrities/:id', asyncHandler(async (req, res) => {
  const body = readCelebrityBody(req.body);
  const pool = await getPool();

  const result = await pool.request()
    .input('Id', sql.Int, Number(req.params.id))
    .input('FullName', sql.NVarChar(100), body.fullName)
    .input('Nationality', sql.NVarChar(100), body.nationality)
    .input('BirthYear', sql.Int, body.birthYear)
    .input('PhotoUrl', sql.NVarChar(500), body.photoUrl)
    .query(`
      UPDATE dbo.Celebrities
      SET
        FullName = @FullName,
        Nationality = @Nationality,
        BirthYear = @BirthYear,
        PhotoUrl = @PhotoUrl
      OUTPUT INSERTED.Id, INSERTED.FullName, INSERTED.Nationality, INSERTED.BirthYear, INSERTED.PhotoUrl
      WHERE Id = @Id
    `);

  const celebrity = mapCelebrity(result.recordset[0]);
  if (!celebrity) {
    return res.status(404).json({ message: 'Celebrity not found' });
  }

  return res.json(celebrity);
}));

app.delete('/celebrities/:id', asyncHandler(async (req, res) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('Id', sql.Int, Number(req.params.id))
    .query('DELETE FROM dbo.Celebrities WHERE Id = @Id');

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: 'Celebrity not found' });
  }

  return res.json({ deleted: true, id: Number(req.params.id) });
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`TDWA06-01 API started on port ${port}`);
});
