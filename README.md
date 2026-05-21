# TotoAfya Digital 🏥🤱

TotoAfya Digital is a multi-portal digital health system designed to support maternal and child health management. The system is split into three dedicated frontends sharing a common database and client layer in an **npm workspaces monorepo**.

---

## 1. System Architecture

```text
                  +-----------------------------------+
                  |        Supabase PostgreSQL        |
                  |         (Central Cloud DB)        |
                  +-----------------------------------+
                                    ^
                                    |
                    +---------------+---------------+
                    |                               |
                    v                               v
         +--------------------+           +--------------------+
         |   Shared Package   |           |   Shared Package   |
         |    @base44/shared-ui|           |  @base44/api-client|
         +--------------------+           +--------------------+
                    ^                               ^
                    |                               |
        +-----------+-----------+-------------------+-----------+
        |                       |                               |
        v                       v                               v
+---------------+       +---------------+               +---------------+
|  apps/mother  |       |  apps/nurse   |               | apps/facility |
|  - Mobile PWA |       |  - Tablet/Web |               | - PC Desktop  |
|  - Mother UI  |       |  - Nurse UI   |               | - Admin UI    |
+---------------+       +---------------+               +---------------+
```

---

## 2. Directory Structure

The project uses **npm workspaces** to separate concerns while sharing reusable styling and API logic:

* **`/apps`**:
  * **`mother-portal`**: A mobile-first, installable Progressive Web App (PWA) tailored for mothers. Includes growth tracking, vaccination schedules, AI-assisted health chat, and ANC log viewing.
  * **`nurse-portal`**: A tablet/web application designed for clinical nurses to register patient details, log growth metrics, record vaccinations, and record ANC visit logs.
  * **`facility-pc`**: A desktop dashboard for administrators to monitor facility-wide metrics and system alerts, packaged as a **Tauri** desktop app.
* **`/packages`**:
  * **`api-client`**: Central client managing requests. Supports dual-mode: local `localStorage` mock database (for offline development) and cloud **Supabase** (for production).
  * **`shared-ui`**: Central styling system housing design tokens and custom CSS.

---

## 3. Getting Started

### Prerequisites
1. **Node.js**: Ensure you have Node.js (version 18+) installed.
2. **Rust & VS Build Tools** *(Optional)*: Required only if you want to compile the desktop Tauri app locally. Read more at [Tauri Prerequisites](https://tauri.app/start/prerequisites/).

### Installation
Clone the repository, navigate into the project directory, and install dependencies:
```bash
npm install
```

### Database & Environment Setup
Create a `.env.local` file at the root of the project to configure the database provider:

```bash
# Toggle between 'local' (localStorage mock) and 'supabase'
VITE_DATABASE_PROVIDER=supabase

# Supabase Credentials (obtain from your Supabase Dashboard)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

*Note: The three sub-apps are configured to automatically load this root environment file.*

---

## 4. Database Migrations (Supabase)

If you are setting up a fresh Supabase database:
1. Copy the contents of the root `schema.sql` file.
2. In your Supabase Dashboard, go to **SQL Editor > New Query**.
3. Paste the contents and click **Run**. This will create the tables, indexes, and triggers required by the applications.

---

## 5. Development Scripts

You can start, build, or analyze the portals from the root directory:

| Action | Mother Portal | Nurse Portal | Facility Portal (Web) |
| :--- | :--- | :--- | :--- |
| **Run Dev Server** | `npm run dev:mother` | `npm run dev:nurse` | `npm run dev:facility` |
| **Build Project** | `npm run build:mother` | `npm run build:nurse` | `npm run build:facility` |

### Running the Apps Concurrently
The dev servers run on independent local ports to avoid conflicts:
* **Mother Portal**: [http://localhost:5000](http://localhost:5000)
* **Nurse Portal**: [http://localhost:5001](http://localhost:5001)
* **Facility Portal**: [http://localhost:5002](http://localhost:5002)

### Running Facility App in Tauri Desktop Mode
To run the admin app inside a native PC window wrapper:
```bash
npm run tauri:facility -- dev
```
*(Requires Rust installed on your machine).*

---

## 6. Deployment & Packaging

### Deploying the Web Portals (Mother & Nurse)
You can deploy the web applications to **Vercel**, **Netlify**, or other static hosting providers by setting up separate projects pointed to the monorepo subdirectories:

1. **Mother Portal**:
   * Root Directory: `apps/mother-portal`
   * Build Command: `npm run build`
2. **Nurse Portal**:
   * Root Directory: `apps/nurse-portal`
   * Build Command: `npm run build`

### Packaging the Facility PC App (Tauri)
To package the administrator app into a standalone Windows installer (`.exe`):
1. Run the build command:
   ```bash
   npm run tauri:facility -- build
   ```
2. Locate the generated executable in:
   `apps/facility-pc/src-tauri/target/release/bundle/nsis/`
