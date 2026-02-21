# F5 Dashboard SGO + Auditoria visual (Manual)

## Objetivo
Validar visualmente matriz de estados SGO, panel de resolucion y trazabilidad de auditoria.

## Pre-requisitos
1. API local arriba: `http://127.0.0.1:5135`
2. Frontend local arriba: `http://127.0.0.1:5173`
3. F1/F2/F3/F4 en estado `GO`.

## Validacion UI (paso a paso)

1. Abrir:
   - `http://127.0.0.1:5173/seguimiento/asistencia`
2. Verificar columna nueva `Semáforo SGO` en tabla:
   - Verde -> `Verde - Validado`
   - Ámbar -> `Ámbar - En Proceso`
   - Rojo -> `Rojo - Crítico`
   - Negro -> `Negro - Ausente`
3. Hacer click en un registro y abrir `ResolutionDrawer`.
4. Confirmar bloques visibles:
   - `Detalles del Registro` (incluye justificación/notas).
   - `Audit Trail` (`alert_status`, `resolved_at`, `resolved_by`, `resolution_notes`).
   - `Selfie de Control` (evidencia visual en cabecera).
5. Si la justificación es corta (<20), validar mensaje de advertencia.

## Evidencia de cierre
Guardar archivo:
`deployment_evidence/F5_DASHBOARD_AUDIT_GO_YYYY-MM-DD.md`

Debe incluir:
1. Captura de tabla con columna `Semáforo SGO`.
2. Captura de `ResolutionDrawer` con bloque `Audit Trail`.
3. Dictamen final: `GO` o `NO-GO`.
