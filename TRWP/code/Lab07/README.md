# TDWA07-01

Лабораторная работа 7 на основе `TDWA06-01`: Docker image приложения, Microsoft SQL Server и nginx reverse proxy.

Реализация оставлена на Node.js/Express в файле `app.js`.

## Состав

- `mssql` - контейнер Microsoft SQL Server 2019 (`mcr.microsoft.com/mssql/server:2019-latest` по умолчанию).
- `api` - REST API `TDWA07-01`.
- `nginx` - reverse proxy, внешний порт `8087`.
- `mssql_data` - Docker volume для сохранения файлов БД.

API автоматически создает БД `Celebrities`, таблицу `dbo.Celebrities` и тестовые записи, если таблица пустая.

## Запуск

Для своего Docker Hub имени замени `your-nick`:

```powershell
$env:DOCKERHUB_IMAGE = "your-nick/tdwa07-01"
docker compose up -d --build
```

Если образ SQL Server 2019 временно не скачивается с `mcr.microsoft.com`, для локальной проверки можно использовать уже скачанный совместимый образ:

```powershell
$env:MSSQL_IMAGE = "mcr.microsoft.com/mssql/server:2022-latest"
$env:DOCKERHUB_IMAGE = "your-nick/tdwa07-01"
docker compose up -d --build
```

Проверка контейнеров:

```powershell
docker compose ps
```

## CRUD через nginx

```powershell
Invoke-RestMethod http://localhost:8087/api/health
Invoke-RestMethod http://localhost:8087/api/celebrities
```

Готовый сценарий:

```powershell
.\requests.ps1
```

## Публикация image в Docker Hub

```powershell
$env:DOCKERHUB_IMAGE = "your-nick/tdwa07-01"
docker compose build api
docker login
docker push $env:DOCKERHUB_IMAGE
```

В отчете можно указать, что приложение `TDWA07-01` собрано в image `your-nick/tdwa07-01` и работает совместно с контейнерами MSSQL и nginx.
