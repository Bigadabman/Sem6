# Лабораторная работа 11. CI/CD и автоматизированное тестирование

## Что сделано

Проект `fitness-app` настроен под простой CI/CD-сценарий на GitHub Actions по примеру `Manmadeeers/CI-CD`.

Добавлен workflow:

```text
.github/workflows/ci.yml
```

Workflow называется `CI + Deploy Pages` и состоит из двух job:

- `test` запускается при `push` в `main`, `dev`, `fix`, `fix/**` и при `pull_request` в `main` или `dev`;
- `deploy` запускается только после успешной job `test`, только при `push` в ветку `main`.

## Что проверяет CI

В job `test` выполняются:

```bash
cd backend
npm ci
npm test
```

Проверяются API-тесты backend, включая лабораторные тесты из `lab10-api.test.js`.

```bash
cd frontend
npm ci
npm test -- --watchAll=false
npm run build
```

Проверяются 4 UI-теста React-приложения и production-сборка frontend.

Локальная проверка перед сдачей:

- backend: 2 test suites passed, 49 tests passed;
- frontend tests: 1 test suite passed, 4 tests passed;
- frontend build: compiled successfully.

## Что делает CD

В job `deploy`:

1. Устанавливаются зависимости frontend.
2. Выполняется production-сборка React-приложения.
3. В `frontend/build` добавляется `404.html` как fallback для React Router.
4. Папка `frontend/build` публикуется через GitHub Pages.

Деплой защищён условием:

```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

И зависимостью:

```yaml
needs: test
```

То есть GitHub Pages обновляется только после успешных тестов в `main`.

## Порядок действий для защиты

1. Создать репозиторий на GitHub.
2. Привязать локальный проект к удалённому репозиторию:

```bash
git remote add origin https://github.com/<username>/<repo>.git
```

3. Переименовать текущую основную ветку в `main`, если сейчас она называется `master`:

```bash
git branch -M main
```

4. Закоммитить изменения:

```bash
git add .github/workflows/ci.yml reports/Lab_11/lab11-defense.md
git commit -m "Add GitHub Actions CI/CD workflow"
```

5. Отправить `main`:

```bash
git push -u origin main
```

6. Создать и отправить ветку разработки:

```bash
git checkout -b dev
git push -u origin dev
```

7. Создать ветку исправления от `dev`:

```bash
git checkout -b fix
```

8. Для демонстрации изменить текст на странице или в тесте, сделать коммит и отправить ветку:

```bash
git add frontend/src/App.test.js
git commit -m "Update UI text"
git push -u origin fix
```

9. На GitHub открыть Pull Request `fix -> dev`.
10. Показать, что GitHub Actions автоматически запускает тесты.
11. Если тесты зелёные, выполнить merge в `dev`.
12. Открыть второй Pull Request `dev -> main`.
13. После успешных тестов выполнить merge в `main`.
14. Перейти во вкладку `Actions` и показать успешный workflow.
15. Перейти в `Settings -> Pages` и показать опубликованный сайт GitHub Pages.

## Как показать падение тестов

Для пункта "убедитесь, что при внесении ошибок тесты завершаются неуспешно" можно сделать отдельный временный коммит в ветке `fix`, например:

- поменять ожидаемый текст в `frontend/src/App.test.js` на неправильный;
- либо изменить проверяемый URL/роль так, чтобы тест не нашёл нужный элемент.

После push GitHub Actions должен показать красный статус. Затем ошибку нужно исправить новым коммитом и дождаться зелёного статуса.

## Что говорить на защите

Коротко:

> Я настроил CI/CD через GitHub Actions. При push и pull request автоматически запускаются backend API-тесты, frontend UI-тесты и production build. Деплой на GitHub Pages выполняется отдельной job только для ветки main и только после успешного прохождения тестов. Для разработки используются ветки dev и fix, изменения попадают в main через pull request.

Главные файлы:

- `.github/workflows/ci.yml` - CI/CD pipeline;
- `frontend/src/App.test.js` - UI-тесты;
- `backend/tests/api-access.test.js` и `backend/tests/lab10-api.test.js` - API-тесты;
- `reports/Lab_11/lab11-defense.md` - порядок защиты.
