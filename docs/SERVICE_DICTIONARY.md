# Service Dictionary (Multi-Platform Scalability)

This document certifies the **Headless** nature of the Backend Services, enabling support for Web (React), Mobile (Android/iOS), and 3rd Party Integrations.

## 🌍 Core Services (Headless API)

| Service Name | Interface | Capabilities | Mobile Ready? |
| :--- | :--- | :--- | :--- |
| **AuthService** | `IUserService` | JWT Issue, BCrypt Verify, Role Mgmt. | ✅ Yes (JSON) |
| **PersonalService** | `IPersonalService` | Profile Data, Hierarchy (Area/Division). | ✅ Yes (JSON) |
| **CuadrillaService** | `ICuadrillaService` | Crew Mgmt, Attendance (`Asistencia`), Geo-Tagging. | ✅ Yes (Lat/Lon) |
| **ProyectoService** | `IProyectoService` | Budgeting, Status Tracking (Kardex). | ✅ Yes (Read-Only) |

## 📱 Mobile Alignment (Android Native)

The Android App (`Modelo_Android`) consumes these services via Retrofit/OkHttp.

- **Authentication**: Uses `POST /api/auth/login`. Returns standard JWT.
- **Offline Sync**: Services support `LastUpdated` timestamp filtering for differential sync (Planned Phase 4).
- **Push Notifications**: Infrastructure supports Firebase token storage in `UserAccessConfig`.

## 🔌 API Contract Strategy
- **Format**: JSON (CamelCase).
- **Auth**: Bearer Token (Header: `Authorization: Bearer <token>`).
- **Versioning**: `/api/v1/...` (Implicit).

## ✅ Scalability Verdict
The service layer is **Platform Agnostic**. The API acts purely as a Gateway, with no server-side rendering (Razor/MVC views) causing coupling.
