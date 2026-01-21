# API Contract - Operation Web

> **Status:** Active / Source of Truth
> **Last Updated:** 2026-01-13
> **Base URL:** `/api/v1` (except Auth which is `/api/auth`)

## 1. Authentication
**Base URL:** `/api/auth`

### 1.1 Login
*   **Endpoint:** `POST /login`
*   **Auth:** Public
*   **Request Body:**
    ```json
    {
      "username": "41007510",
      "password": "securePass!",
      "captchaId": "",        // Optional (Mobile bypass)
      "captchaAnswer": "",    // Optional (Mobile bypass)
      "platform": "android"   // Optional: "web" | "android"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "token": "eyJh... (JWT)",
      "expiration": "2026-01-13T18:00:00Z",
      "user": {
        "dni": "41007510",
        "email": null,
        "role": "tecnico"
      }
    }
    ```
*   **Errors:**
    *   `400 Bad Request`: "Credenciales inválidas" logic.
    *   `401 Unauthorized`: (Not strictly used for Login, but possible).

---

## 2. Attendance (Asistencia)
**Base URL:** `/api/v1/attendance`

### 2.1 Check-In (Marcar Asistencia)
*   **Endpoint:** `POST /checkin`
*   **Auth:** Bearer Token (User/Admin)
*   **Request Body:**
    ```json
    {
      "latitude": -12.12345,
      "longitude": -77.01234,
      "address": "Av. Javier Prado 123, Lima",
      "health_status": "saludable" // "saludable" | "con_sintomas"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "message": "Asistencia registrada correctamente",
      "status": "presente" // "presente" | "tardanza"
    }
    ```
*   **Errors:**
    *   `400 Bad Request`: "Ya marcaste asistencia el día de hoy."
    *   `500 Internal Server Error`: Database failure.

### 2.2 Get Daily Attendance (Dashboard)
*   **Endpoint:** `GET /` (Root of attendance controller via Query Param?) 
    *   *Correction from Code:* `GET /api/v1/attendance?date=YYYY-MM-DD`
*   **Auth:** Bearer Token (Admin/Supervisor)
*   **Query Params:**
    *   `date`: (Optional) `yyyy-MM-dd`. Defaults to Today.
*   **Response (200 OK):**
    ```json
    [
      {
        "id": "50aa8a20-bb91...",
        "employee_id": 2356,
        "date": "2026-01-13",
        "check_in_time": "2026-01-13T08:30:00",
        "location_lat": -12.123,
        "location_lng": -77.012,
        "location_address": "Av. Javier Prado...",
        "health_status": "saludable",
        "system_status": "tardanza",
        "employee": {
             "id": 2356,
             "name": "Jose Arbildo",
             "role": "tecnico",
             "photo_url": "..."
        }
      }
    ]
    ```

---

## 3. Employees (Colaboradores)
**Base URL:** `/api/v1`

### 3.1 List All Employees
*   **Endpoint:** `GET /employees`
*   **Auth:** Bearer Token
*   **Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "name": "Juan Perez",
        "role": "Tecnico",
        "photo_url": null,
        "phone": "555-1234",
        "estado_operativo": "Activo",
        "active": true
      }
    ]
    ```

---

## 4. Error Codes Standard
| Code | Meaning | Context |
| :--- | :--- | :--- |
| **200** | OK | Success request. |
| **400** | Bad Request | Validation failed (e.g., Missing fields, Duplicate Check-In). |
| **401** | Unauthorized | Missing or Invalid JWT Token. |
| **403** | Forbidden | Valid Token but Insufficient Role. |
| **404** | Not Found | Resource or Endpoint does not exist. |
| **500** | Internal Server Error | Unhandled Exception (Check Server Logs). |
