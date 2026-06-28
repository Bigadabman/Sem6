# TDWA06-01

Лабораторная работа: Docker, Microsoft SQL Server, REST API и nginx reverse proxy.

## Состав

- `mssql` - контейнер Microsoft SQL Server 2019 (`mcr.microsoft.com/mssql/server:2019-latest` по умолчанию).
- `api` - REST API `TDWA06-01` на Node.js/Express.
- `nginx` - reverse proxy, внешний порт `8080`.
- `mssql_data` - Docker volume для сохранения файлов БД после перезапуска контейнера.

API при запуске автоматически создает БД `Celebrities`, таблицу `dbo.Celebrities` и несколько тестовых записей, если таблица пустая.

## Запуск

```powershell
docker compose up -d --build
```

Если образ SQL Server 2019 временно не скачивается с `mcr.microsoft.com`, для локальной проверки можно подставить совместимый уже скачанный образ:

```powershell
$env:MSSQL_IMAGE = "mcr.microsoft.com/mssql/server:2022-latest"
docker compose up -d --build
```

Проверка контейнеров:

```powershell
docker compose ps
```

Проверка API через nginx:

```powershell
Invoke-RestMethod http://localhost:8080/api/health
Invoke-RestMethod http://localhost:8080/api/celebrities
```

## CRUD-запросы

Готовый демонстрационный сценарий:

```powershell
.\requests.ps1
```

Ручные примеры:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:8080/api/celebrities
```

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/celebrities -ContentType "application/json" -Body '{
  "fullName": "Ada Lovelace",
  "nationality": "United Kingdom",
  "birthYear": 1815,
  "photoUrl": "https://example.com/lovelace.jpg"
}'
```

```powershell
Invoke-RestMethod -Method Put -Uri http://localhost:8080/api/celebrities/1 -ContentType "application/json" -Body '{
  "fullName": "Keanu Reeves",
  "nationality": "Canada",
  "birthYear": 1964,
  "photoUrl": "https://example.com/keanu-updated.jpg"
}'
```

```powershell
Invoke-RestMethod -Method Delete -Uri http://localhost:8080/api/celebrities/1
```

## Проверка сохранности БД

```powershell
docker compose restart mssql
Start-Sleep -Seconds 20
Invoke-RestMethod http://localhost:8080/api/celebrities
```

Данные сохраняются в Docker volume `lab06_mssql_data` (или с префиксом имени папки Docker Compose).

## SQL-скрипты

- `sql/01_schema.sql` - создание БД и таблицы.
- `sql/02_dml.sql` - DML-запросы `INSERT`, `SELECT`, `UPDATE`, `DELETE`.

Их можно выполнить в SQL Server Management Studio или Azure Data Studio, подключившись к `localhost,1433`:

- Login: `sa`
- Password: `StrongPass123!`
