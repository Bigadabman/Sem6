@echo off
echo Testing Celebrity Server...
echo.

echo 1. Get all celebrities:
curl -X GET http://localhost:3000/Celebrities/All
echo.
echo.

echo 2. Get celebrity by ID:
curl -X GET http://localhost:3000/Celebrities/1
echo.
echo.

echo 3. Add new celebrity:
curl -X POST http://localhost:3000/Celebrities ^
  -H "Content-Type: application/json" ^
  -d "{\"id\": 1, \"fullName\": \"Test Celebrity\", \"nationality\": \"Test\", \"reqPhotoPath\": \"test.jpg\"}"
echo.
echo.

echo 4. Update celebrity (ID 3):
curl -X PUT http://localhost:3000/Celebrities/3 ^
  -H "Content-Type: application/json" ^
  -d "{\"id\": 3, \"fullName\": \"Updated Celebrity\", \"nationality\": \"Updated\", \"reqPhotoPath\": \"updated.jpg\"}"
echo.
echo.

echo 5. Delete celebrity (ID 3):
curl -X DELETE http://localhost:3000/Celebrities/3
echo.
echo.

echo 6. Get all celebrities after changes:
curl -X GET http://localhost:3000/Celebrities/All
echo.
echo.

echo Test completed!
pause