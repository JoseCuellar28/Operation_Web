#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")"/../.. && pwd)"
API="http://localhost:5132/api"
FRONT="http://localhost:8000"
if pgrep -f "dotnet run --project $ROOT/OperationWeb.API" >/dev/null; then pkill -f "dotnet run --project $ROOT/OperationWeb.API" || true; fi
if pgrep -f "python3 -m http.server 8000 --directory $ROOT" >/dev/null; then pkill -f "python3 -m http.server 8000 --directory $ROOT" || true; fi
(cd "$ROOT/OperationWeb.API" && ASPNETCORE_URLS=http://localhost:5132 nohup dotnet run --project "$ROOT/OperationWeb.API" >/tmp/ow_api.log 2>&1 & echo $! > /tmp/ow_api.pid)
for i in {1..60}; do if curl -sSf "$API/auth/ping" >/dev/null; then break; fi; sleep 1; done
(cd "$ROOT" && nohup python3 -m http.server 8000 --directory "$ROOT" >/tmp/ow_front.log 2>&1 & echo $! > /tmp/ow_front.pid)
for i in {1..60}; do if curl -sSf "$FRONT/frontend/Modelo_Funcional/index.html" >/dev/null; then break; fi; sleep 1; done
RND="$RANDOM"
code(){ curl -s -o /dev/null -w "%{http_code}" "$@"; }
hdr(){ curl -sI "$@"; }
json(){ curl -s "$@"; }
test(){ name="$1" exp="$2" shift 2; c=$(code "$@"); if [ "$c" = "$exp" ]; then echo "OK $name $c"; else echo "FAIL $name $c"; exit 1; fi }
echo "Pruebas de arranque"
test "Ping" 200 "$API/auth/ping"
test "Cuadrillas" 200 "$API/cuadrillas"
test "CuadrillaId1" 200 "$API/cuadrillas/1"
test "CuadrillasActivas" 200 "$API/cuadrillas/estado/Activa"
test "CapacidadCuadrilla1" 200 "$API/cuadrillas/1/capacidad-disponible"
test "CrearCuadrilla" 201 -X POST "$API/cuadrillas" -H "Content-Type: application/json" -d "{\"nombre\":\"Smoke_$RND\",\"descripcion\":\"t\",\"capacidadMaxima\":3,\"supervisor\":\"s\",\"ubicacion\":\"u\",\"estado\":\"Activa\"}"
test "Colaboradores" 200 "$API/colaboradores"
test "ColaboradorId1" 200 "$API/colaboradores/1"
test "ColaboradoresActivos" 200 "$API/colaboradores/estado/Activo"
test "ColaboradoresOperario" 200 "$API/colaboradores/cargo/Operario"
test "ColaboradoresDisponibles" 200 "$API/colaboradores/disponibles"
test "CrearColaborador" 201 -X POST "$API/colaboradores" -H "Content-Type: application/json" -d "{\"nombre\":\"Test$RND\",\"apellido\":\"Smoke\",\"documento\":\"DOC$RND\",\"email\":\"smoke$RND@example.local\",\"telefono\":\"555\",\"cargo\":\"Operario\",\"estado\":\"Activo\"}"
test "Captcha" 200 "$API/auth/captcha"
test "UsersUnauthorized" 401 "$API/auth/users"
test "RolesUnauthorized" 401 "$API/auth/roles"
test "UserRolesUnauthorized" 401 "$API/auth/user-roles"
test "SwaggerJson" 200 "http://localhost:5132/swagger/v1/swagger.json"
test "SwaggerUI" 200 "http://localhost:5132/swagger/index.html"
ct=$(hdr "$API/cuadrillas" | tr '[:upper:]' '[:lower:]' | grep -i "content-type:" | grep -c "application/json" || true); if [ "$ct" -gt 0 ]; then echo "OK ContentTypeJson"; else echo "FAIL ContentTypeJson"; exit 1; fi
cors=$(curl -sI -H "Origin: http://localhost:8000" "$API/cuadrillas" | tr '[:upper:]' '[:lower:]' | grep -c "access-control-allow-origin" || true); if [ "$cors" -gt 0 ]; then echo "OK CorsHeader"; else echo "FAIL CorsHeader"; exit 1; fi
test "FrontendIndex" 200 "$FRONT/frontend/Modelo_Funcional/index.html"
test "FrontendDbExplorer" 200 "$FRONT/frontend/database_explorer/index.html"
kill "$(cat /tmp/ow_api.pid)" || true
kill "$(cat /tmp/ow_front.pid)" || true
