# Authentication Protocol

> **Type:** Bearer Token (JWT)
> **Algorithm:** HMACSHA256
> **Expiration:** 8 Hours (Standard)

## 1. Login Flow (Mobile & Web)

1.  **Client** sends `POST /api/auth/login` with `username` (DNI) and `password`.
2.  **Server** verifies hash against `Users` table.
3.  **Server** generates JWT and returns it.
4.  **Client** MUST store this token safely:
    - **Web:** `localStorage` or `HttpOnly Cookie` (Current implementation uses LocalStorage).
    - **Android:** `EncryptedSharedPreferences`.

## 2. JWT Structure

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload (Claims)
The Backend guarantees the following claims:

| Claim Key | Value Example | Description |
| :--- | :--- | :--- |
| `sub` | `41007510` | Subject (The DNI of the user). |
| `jti` | `GUID...` | Unique Token ID. |
| `role` | `["Admin", "Tecnico"]` | Array of Roles. used for Frontend Guard. |
| `dni` | `41007510` | ⚠️ **Critcal:** Used by Check-In to identify employee. |
| `exp` | `173566000` | Expiration Timestamp (Unix). |

## 3. Request Authentication
Every protected request MUST include the header:
```http
Authorization: Bearer <TOKEN_STRING>
```

### 3.1 Handling 401 Unauthorized
If an API call returns `401`:
1.  **Client Action:** The token is invalid or expired.
2.  **Immediate Step:** Clear stored token.
3.  **UI Step:** Redirect user to Login Screen immediately.
    - *Note:* There is currently **NO Refresh Token** mechanism. User must re-login.

## 4. Mobile Specifics
- **Offline Mode:** The App should allow entering the main menu if a valid token exists in storage, but API calls will fail if network is down.
- **Biometric Login:** If implemented, typically unlocks the stored JWT from Keystore.
