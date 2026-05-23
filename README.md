# TotoAfya Digital 🏥🤱

TotoAfya Digital is a multi-portal digital health system designed to support maternal, newborn, and child health management. The system is built as an **npm workspaces monorepo** containing five dedicated frontends sharing a common database/client layer and multiple domain-specific utility packages.

---

## 1. System Architecture

```text
                           +-----------------------------------+
                           |        Supabase PostgreSQL        |
                           |    (Central Cloud DB) / Mock DB   |
                           +-----------------------------------+
                                             ^
                                             |
                            +----------------+----------------+
                            |                                 |
                            v                                 v
                 +--------------------+            +--------------------+
                 |   Shared Package   |            |   Shared Package   |
                 | @totoafya/shared-ui|            |@totoafya/api-client|
                 +--------------------+            +--------------------+
                            ^                                 ^
                            |                                 |
         +------------------+-----------------+---------------+------------------+
         |                  |                 |               |                  |
         v                  v                 v               v                  v
+---------------+  +---------------+  +---------------+  +---------------+  +---------------+
|  apps/mother  |  | apps/mother-  |  |  apps/nurse   |  | apps/facility |  |  apps/super-  |
|    -portal    |  |    native     |  |    -portal    |  |     -pc       |  |  admin-portal |
|  - Mobile PWA |  |  - Expo/React |  |  - Tablet/Web |  | - Tauri PC    |  | - Web Admin   |
|  - Mother UI  |  |    Native App |  |  - Nurse UI   |  | - Admin UI    |  | - System UI   |
+---------------+  +---------------+  +---------------+  +---------------+  +---------------+
```

---

## 2. Directory Structure

### Applications (`/apps`)
* **`mother-portal`**: A mobile-first, installable Progressive Web App (PWA) tailored for mothers. Includes growth tracking, vaccination schedules, AI-assisted health chat, and antenatal care (ANC) logs.
* **`mother-native`**: A cross-platform mobile application for mothers built with **Expo & React Native** (using NativeWind for styling), providing a native mobile experience.
* **`nurse-portal`**: A tablet/web application designed for clinical nurses to register patient details, log growth metrics, record vaccinations, and record ANC visit logs.
* **`facility-pc`**: A desktop dashboard for administrators to monitor facility-wide metrics and system alerts, packaged as a **Tauri** desktop app.
* **`super-admin-portal`**: A system administration dashboard for managing facilities, nurses, learning resources, and system-wide configurations.

### Shared Packages (`/packages`)
* **`api-client`**: Central client managing requests. Supports dual-mode: local `localStorage` mock database (for offline development) and cloud **Supabase** (for production).
* **`auth`**: Reusable authorization and authentication helper functions and types (e.g. user profiles, role mapping).
* **`business-logic`**: Domain rules and calculations, including gestational age, estimated date of delivery (EDD) via Naegele's rule, Mid-Upper Arm Circumference (MUAC) & WHO weight-for-age z-score nutrition classification, and Kenyan immunization schedule generation.
* **`design-system`**: Unified design tokens (colors, spacing, typography) and localization translations in English and Swahili (Kiswahili).
* **`shared-ui`**: Shared layouts and styles (web placeholder).
* **`types`**: Central TypeScript types and interfaces defining the system data models (Facility, Mother, Child, ANCVisit, GrowthRecord, Immunization, Milestone, AIAlert, etc.).

---

## 3. Getting Started

### Prerequisites
1. **Node.js**: Ensure you have Node.js (version 18+) installed.
2. **Rust & VS Build Tools** *(Optional)*: Required only if you want to compile the desktop Tauri app (`apps/facility-pc`) locally. Read more at [Tauri Prerequisites](https://tauri.app/start/prerequisites/).
3. **Expo Go** *(Optional)*: Install on your iOS or Android physical device to run and test the React Native app.

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

# Gemini API Credentials (Optional: falls back to local high-fidelity mock if not set)
VITE_GEMINI_API_KEY=your-google-gemini-api-key
```

*Note: The sub-apps are configured to automatically load this root environment file.*

---

## 4. Database Migrations (Supabase)

If you are setting up a fresh Supabase database:
1. Copy the contents of the root `schema.sql` file.
2. In your Supabase Dashboard, go to **SQL Editor > New Query**.
3. Paste the contents and click **Run**. This will create the required tables, indexes, and triggers:
   * `facilities`, `nurses`, `mothers`, `children`
   * `anc_visits` (antenatal care history and danger signs tracking)
   * `growth_records` (weights, heights, MUAC, and nutritional status)
   * `immunizations` (child vaccine schedules and logs)
   * `milestones` (developmental milestones tracking)
   * `learning_contents` (articles, videos, and guides for caregivers)
   * `ai_alerts` (health anomaly warnings generated by AI)

---

## 5. Development Scripts

You can start or build the portals from the root directory using the following monorepo commands:

### Web & Desktop Portals

| Action | Mother Web PWA | Nurse Portal | Facility Portal (Web) | Super Admin Portal |
| :--- | :--- | :--- | :--- | :--- |
| **Run Dev Server** | `npm run dev:mother` | `npm run dev:nurse` | `npm run dev:facility` | `npm run dev:superadmin` |
| **Build Project** | `npm run build:mother` | `npm run build:nurse` | `npm run build:facility` | `npm run build:superadmin` |

To start all web dev servers concurrently, run:
```bash
npm run dev
```

* **Mother Web Portal**: [http://localhost:5000](http://localhost:5000)
* **Nurse Web Portal**: [http://localhost:5001](http://localhost:5001)
* **Facility Web Portal**: [http://localhost:5002](http://localhost:5002)
* **Super Admin Portal**: [http://localhost:5003](http://localhost:5003)

### Running Facility App in Tauri Desktop Mode
To run the admin app inside a native PC window wrapper:
```bash
npm run tauri:facility -- dev
```
*(Requires Rust installed on your machine).*

---

## 6. Running the React Native Mobile App (`apps/mother-native`)

To run the mobile client for mothers:
1. Start the Expo builder:
   ```bash
   npm run start --workspace=apps/mother-native
   ```
2. Scan the QR code in the terminal using the **Expo Go** app on your physical device, or choose from one of the options below:
   * **Android Emulator**: Press `a`
   * **iOS Simulator**: Press `i`
   * **Web Preview**: Press `w`

---

## 7. Deployment & Packaging

### Deploying Web Portals
Web applications can be deployed to static hosting providers (such as Vercel, Netlify, or AWS Amplify) by configuring the root of the deployment to point to the respective subdirectory and executing the workspace-specific build commands:

* **Mother Portal**:
  * Root Directory: `apps/mother-portal`
  * Build Command: `npm run build`
* **Nurse Portal**:
  * Root Directory: `apps/nurse-portal`
  * Build Command: `npm run build`
* **Super Admin Portal**:
  * Root Directory: `apps/super-admin-portal`
  * Build Command: `npm run build`

### Packaging the Facility PC App (Tauri)
To compile the administrator app into a standalone Windows executable installer (`.exe`):
1. Run the build command:
   ```bash
   npm run tauri:facility -- build
   ```
2. Find the generated installer under:
   `apps/facility-pc/src-tauri/target/release/bundle/nsis/`
