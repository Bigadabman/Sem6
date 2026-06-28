@echo off

echo ==============================
echo Testing GO03_01 server
echo ==============================

echo.
echo --- GET /A ---
curl -X GET http://localhost:3000/A

echo.
echo --- GET /A/B ---
curl -X GET http://localhost:3000/A/B

echo.
echo --- POST /A ---
curl -X POST http://localhost:3000/A

echo.
echo --- POST /A/B ---
curl -X POST http://localhost:3000/A/B

echo.
echo --- PUT /A ---
curl -X PUT http://localhost:3000/A

echo.
echo --- PUT /A/B ---
curl -X PUT http://localhost:3000/A/B

echo.
echo --- GET unknown path ---
curl -X GET http://localhost:3000/XYZ

echo.
echo --- POST unknown path ---
curl -X POST http://localhost:3000/XYZ

echo.
echo --- PUT unknown path ---
curl -X PUT http://localhost:3000/XYZ

echo.
echo ==============================
echo Tests finished
pause