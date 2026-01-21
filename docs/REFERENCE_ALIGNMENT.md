# Reference Alignment Guide

> **Source:** `.reference/Modelo_Web2` (React/Node)
> **Target:** `frontend/Modelo_Funcional` (Vanilla JS/HTML)

## 1. Objective
Replicate the **Visual Identity** and **UX Flow** of the Reference project into the Target project, while completely **discarding the Architecture**.

## 2. Component Mapping (UI)

| Reference Component (React) | Target Implementation (HTML/CSS) | Action |
| :--- | :--- | :--- |
| `Sidebar.tsx` | `menu_moderno.html` (sidebar div) | **Replicate:** Copy HTML structure and classes. |
| `KPICard.tsx` | `div.card` | **Replicate:** Use same Tailwind utility classes or custom CSS. |
| `DataTable.tsx` | `<table>` | **Replicate:** styling for `thead`, `tbody`, `tr:nth-child(even)`. |
| `Modal.tsx` | `<dialog>` or `div.modal` | **Replicate:** Overlay and animation styles. |

## 3. Blacklist (DO NOT TRASFER)

> 🛑 **CRITICAL:** The following files in `.reference` are incompatible with the .NET Backend.

*   ❌ **`src/connections/sql.ts`**: This file does a direct DB connection using `mssql`. **NEVER** use this in the frontend. Use `fetch('/api/...')` instead.
*   ❌ **`server.ts`**: We already have `OperationWeb.API`. Do not run a Node server.
*   ❌ **`package.json`**: Do not try to `npm install` libraries from the reference unless extracting CSS/Assets.
*   ❌ **React Hooks (`useState`, `useEffect`)**: Logic must be rewritten in Vanilla JS (Event Listeners).

## 4. Style Strategy
The reference uses **Tailwind CSS**.
*   **Approach:** Since Target is Vanilla, you can:
    1.  Use a Tailwind CDN (Quickest for prototyping).
    2.  Or copy the *computed styles* from the reference's browser inspector into `css/styles.css`.

## 5. Feature Parity Checklist
- [x] Login Screen (Visual Match)
- [ ] Dashboard Main View (KPIs + Charts)
- [ ] Employee List Table (Columns: Photo, Name, Role, Status)
- [ ] Attendance View (Maps integration)
