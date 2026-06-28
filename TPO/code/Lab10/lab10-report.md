# Lab 10 API Testing Report

Generated at: 2026-05-28T07:14:34.730Z
Total tests: 22
Passed: 20
Failed: 0
Known defects: 2

## 1) Available API Methods

- POST /api/users/register (backend/src/routes/user.routes.js)
- POST /api/users/login (backend/src/routes/user.routes.js)
- GET /api/plans (backend/src/routes/plan.routes.js)
- GET /api/plans/templates (backend/src/routes/plan.routes.js)
- POST /api/plans (backend/src/routes/plan.routes.js)
- POST /api/plans/generate (backend/src/routes/plan.routes.js)
- PATCH /api/plans/:id (backend/src/routes/plan.routes.js)
- DELETE /api/plans/:id (backend/src/routes/plan.routes.js)
- GET /api/plans/:id/calendar.ics (backend/src/routes/plan.routes.js)
- POST /api/plans/:id/google-calendar (backend/src/routes/plan.routes.js)
- POST /api/workouts (backend/src/routes/workout.routes.js)
- PATCH /api/workouts/:id (backend/src/routes/workout.routes.js)
- DELETE /api/workouts/:id (backend/src/routes/workout.routes.js)
- POST /api/workouts/exercise (backend/src/routes/workout.routes.js)
- PATCH /api/workouts/exercise/:id (backend/src/routes/workout.routes.js)
- DELETE /api/workouts/exercise/:id (backend/src/routes/workout.routes.js)
- GET /api/workouts/:id (backend/src/routes/workout.routes.js)
- POST /api/auth/google (backend/src/routes/auth.routes.js)
- GET /api/profile (backend/src/routes/profile.routes.js)
- POST /api/profile (backend/src/routes/profile.routes.js)
- GET /api/exercises (backend/src/routes/exercise.routes.js)
- POST /api/exercises (backend/src/routes/exercise.routes.js)
- PATCH /api/exercises/:id (backend/src/routes/exercise.routes.js)
- DELETE /api/exercises/:id (backend/src/routes/exercise.routes.js)
- GET /api/history (backend/src/routes/history.routes.js)
- POST /api/history (backend/src/routes/history.routes.js)
- GET /api/history/progress (backend/src/routes/history.routes.js)
- DELETE /api/history/:id (backend/src/routes/history.routes.js)
- GET /api/compare (backend/src/routes/compare.routes.js)
- GET /api/compare/dictionaries (backend/src/routes/compare.routes.js)
- GET /api/predictions (backend/src/routes/prediction.routes.js)
- POST /api/predictions (backend/src/routes/prediction.routes.js)
- DELETE /api/predictions/:id (backend/src/routes/prediction.routes.js)
- GET /api/recommendations (backend/src/routes/recommendation.routes.js)
- GET /api/admin/stats (backend/src/routes/admin.routes.js)
- GET /api/admin/users (backend/src/routes/admin.routes.js)
- PATCH /api/admin/users/:id/role (backend/src/routes/admin.routes.js)
- DELETE /api/admin/users/:id (backend/src/routes/admin.routes.js)
- GET /api/admin/standards (backend/src/routes/admin.routes.js)
- POST /api/admin/standards (backend/src/routes/admin.routes.js)
- PATCH /api/admin/standards/:id (backend/src/routes/admin.routes.js)
- DELETE /api/admin/standards/:id (backend/src/routes/admin.routes.js)
- GET /api/admin/world-records (backend/src/routes/admin.routes.js)
- POST /api/admin/world-records (backend/src/routes/admin.routes.js)
- PATCH /api/admin/world-records/:id (backend/src/routes/admin.routes.js)
- DELETE /api/admin/world-records/:id (backend/src/routes/admin.routes.js)
- GET /api/admin/athletes (backend/src/routes/admin.routes.js)
- POST /api/admin/athletes (backend/src/routes/admin.routes.js)
- PATCH /api/admin/athletes/:id (backend/src/routes/admin.routes.js)
- DELETE /api/admin/athletes/:id (backend/src/routes/admin.routes.js)
- POST /api/admin/athlete-results (backend/src/routes/admin.routes.js)
- PATCH /api/admin/athlete-results/:id (backend/src/routes/admin.routes.js)
- DELETE /api/admin/athlete-results/:id (backend/src/routes/admin.routes.js)
- GET /api/admin/templates (backend/src/routes/admin.routes.js)
- POST /api/admin/templates (backend/src/routes/admin.routes.js)
- PATCH /api/admin/templates/:id (backend/src/routes/admin.routes.js)
- DELETE /api/admin/templates/:id (backend/src/routes/admin.routes.js)
- POST /api/admin/templates/:id/workouts (backend/src/routes/admin.routes.js)
- PATCH /api/admin/template-workouts/:id (backend/src/routes/admin.routes.js)
- DELETE /api/admin/template-workouts/:id (backend/src/routes/admin.routes.js)
- POST /api/admin/template-workouts/:id/exercises (backend/src/routes/admin.routes.js)
- PATCH /api/admin/template-exercises/:id (backend/src/routes/admin.routes.js)
- DELETE /api/admin/template-exercises/:id (backend/src/routes/admin.routes.js)

## 2) Test Cases for GET /api/admin/users

### Positive
- POS-1: Valid admin token is provided in Authorization header. -> expected 200
- POS-2: Valid admin token is provided with additional optional headers. -> expected 200

### Negative
- NEG-1: Authorization header is missing. -> expected 401
- NEG-2: Authorization token is invalid. -> expected 401
- NEG-3: Authenticated non-admin user requests admin endpoint. -> expected 403

## 3-8) Automated Test Execution

- [PASSED] M01 (module:get-methods): List available API methods from backend source
- [PASSED] M02 (module:users-positive-negative): GET /api/admin/users with valid admin token returns list
- [PASSED] M03 (module:users-positive-negative): GET /api/admin/users with valid admin token and optional headers returns list
- [PASSED] M04 (module:users-positive-negative): GET /api/admin/users without token is rejected
- [PASSED] M05 (module:users-positive-negative): GET /api/admin/users with invalid token is rejected
- [PASSED] M06 (module:users-positive-negative): GET /api/admin/users with client token is forbidden
- [PASSED] I01 (integration:plans-crud): Create plan via POST /api/plans
- [PASSED] I02 (integration:plans-crud): Read created plan via GET /api/plans
- [PASSED] I03 (integration:plans-crud): Update created plan via PATCH /api/plans/:id
- [PASSED] I04 (integration:plans-crud): Delete created plan via DELETE /api/plans/:id
- [PASSED] E01 (errors): POST /api/plans with empty body returns 400
- [PASSED] E02 (errors): Request to non-existing endpoint returns 404
- [PASSED] E03 (errors): POST /api/profile with invalid body returns 400
- [PASSED] A01 (access): Protected endpoint without token is rejected
- [PASSED] A02 (access): Client token cannot access admin functions
- [PASSED] A03 (access): User cannot update another user's plan
- [PASSED] V01 (validation): POST /api/plans with missing required field returns 400
- [PASSED] V02 (validation): POST /api/profile with number out of range returns 400
- [PASSED] V03 (validation): POST /api/profile with invalid field type returns 400
- [PASSED] V04 (validation): POST /api/plans with very long name is accepted by current API
- [KNOWN-DEFECT] P01 (pagination): GET /api/plans with page=1&limit=2 ignores pagination parameters
- [KNOWN-DEFECT] P02 (pagination): GET /api/plans with out-of-range page ignores pagination parameters

## Notes

- The lab uses Jest and Supertest to exercise the Express API without starting an HTTP server.
- Database models are mocked with deterministic in-memory data because the local .env points DB_HOST to the Docker service name db, which is not resolvable from the current host shell.
- Pagination is not implemented by the current API. The pagination scenarios are included as known defects instead of changing the production API.
