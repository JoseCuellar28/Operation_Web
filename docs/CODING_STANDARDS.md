# OperationWeb Coding Standards (.NET 8 & React)

## 1. Security First 🔒
- **Passwords**: MUST use `BCrypt.Net.BCrypt.HashPassword()`. NEVER store plain text or simple encryptions.
- **Secrets**: NEVER commit `.env` or `appsettings.Production.json` to git.
- **Authorization**: All Controllers/Endpoints MUST have `[Authorize]` attributes unless explicitly public.

## 2. Architecture & Coupling 🏗️
- **Dependency Injection**: ALWAYS inject Interfaces (`IUserService`), NEVER concrete classes.
- **No DbContext in Controllers**: Controllers MUST talk to Services. Services talk to Repositories.
    - ❌ **Bad**: `_context.Users.ToList()` in Controller.
    - ✅ **Good**: `_userService.GetAllAsync()` in Controller.

## 3. Data Access (EF Core) 💾
- **Tracking**: Use `AsNoTracking()` for read-only queries (Dashboard stats).
- **Async**: ALL database operations must be `async/await`.
- **Migrations**: New entities require explicit Migrations (`dotnet ef migrations add`). Don't edit SQL manually.

## 4. Frontend (React/Vite) ⚛️
- **Language**: TypeScript (`.tsx`) Strict Mode.
- **State**: Use React Query for server state. Context for global UI state.
- **Styles**: Tailwind CSS utility classes. Avoid inline `style={{...}}`.
- **Components**: Functional Components only. No Class Components.

## 5. Mobile (Android) 🤖
- **Language**: Kotlin.
- **Architecture**: MVVM + Repository Pattern.
- **Network**: Retrofit + Coroutines.
