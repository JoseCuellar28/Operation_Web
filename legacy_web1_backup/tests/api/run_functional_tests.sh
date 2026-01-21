#!/bin/bash

BASE_URL="http://localhost:5132/api"
echo "Starting 10 Functional Tests..."
echo "================================="

# 1. Ping
echo "1. Testing Ping Endpoint..."
curl -s "$BASE_URL/auth/ping" | grep "true" && echo "✅ Ping Success" || echo "❌ Ping Failed"

# 2. Login Success
echo "2. Testing Login (Success)..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"Username": "jose.arbildo", "Password": "Prueba123"}' | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ Login Success (Token received)"
else
  echo "❌ Login Failed"
  exit 1
fi

# 3. Login Failure
echo "3. Testing Login (Failure)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"Username": "jose.arbildo", "Password": "WrongPassword"}')

if [ "$STATUS" == "401" ]; then
  echo "✅ Login Failure Correctly Handled (401)"
else
  echo "❌ Login Failure Failed (Status: $STATUS)"
fi

# 4. Get Me (Authorized)
echo "4. Testing Get Me (Authorized)..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/auth/me" | grep "jose.arbildo" && echo "✅ Get Me Success" || echo "❌ Get Me Failed"

# 5. Get Cuadrillas (Unauthorized)
echo "5. Testing Get Cuadrillas (Unauthorized)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/cuadrillas")
if [ "$STATUS" == "401" ]; then
  echo "✅ Unauthorized Access Blocked (401)"
else
  echo "❌ Unauthorized Access Failed (Status: $STATUS)"
fi

# 6. Get Cuadrillas (Authorized)
echo "6. Testing Get Cuadrillas (Authorized)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/cuadrillas")
if [ "$STATUS" == "200" ]; then
  echo "✅ Get Cuadrillas Success (200)"
else
  echo "❌ Get Cuadrillas Failed (Status: $STATUS)"
fi

# 7. Get Empleados/Personal
echo "7. Testing Get Personal..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/empleados")
if [ "$STATUS" == "200" ]; then
  echo "✅ Get Personal Success (200)"
else
  echo "❌ Get Personal Failed (Status: $STATUS)"
fi

# 8. Captcha Endpoint
echo "8. Testing Captcha Endpoint..."
curl -s "$BASE_URL/auth/captcha" | grep "id" && echo "✅ Captcha Endpoint Success" || echo "❌ Captcha Endpoint Failed"

# 9. Get Users (Admin)
echo "9. Testing Get Users (Admin)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/auth/users")
if [ "$STATUS" == "200" ]; then
  echo "✅ Get Users Success (200)"
else
  echo "❌ Get Users Failed (Status: $STATUS)"
fi

# 10. Get Roles
echo "10. Testing Get Roles..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/auth/roles")
if [ "$STATUS" == "200" ]; then
  echo "✅ Get Roles Success (200)"
else
  echo "❌ Get Roles Failed (Status: $STATUS)"
fi

echo "================================="
echo "All tests completed."
