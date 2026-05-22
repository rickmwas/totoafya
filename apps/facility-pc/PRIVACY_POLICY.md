# Privacy Policy for TotoAfya Facility PC Application

**Effective Date:** May 22, 2026  
**Last Updated:** May 22, 2026

This Privacy Policy explains how the **TotoAfya Facility PC Application** ("the Application"), a desktop administration dashboard designed for health facilities, collects, uses, stores, and protects personal and medical data. 

The Application is built as a Tauri-based desktop app and serves as an administrative control portal for the **TotoAfya Digital Health System**, connecting to a shared database to monitor facility-wide maternal and child health metrics, manage clinical roles, and track health alerts.

---

## 1. Important Information and Who We Are

### 1.1 Data Controller vs. Data Processor
Under applicable data protection laws, including the **Kenya Data Protection Act, 2019**:
* **The Health Facility (Your Employer/Clinic):** Acts as the **Data Controller**. The facility determines the purposes and means of processing personal and medical data of mothers, caregivers, and children.
* **TotoAfya System Provider:** Acts as the **Data Processor**. We provide and maintain the software, hosting infrastructure, and sync utilities, processing data solely on behalf of and according to the instructions of the Data Controller.

### 1.2 Scope of this Policy
This Privacy Policy applies specifically to the **TotoAfya Facility PC Application** used by administrators, clinic managers, and authorized clinical staff. It describes the handling of data that administrators access, input, or audit through the desktop interface.

---

## 2. The Data We Collect

Through the Facility PC app, administrators can access and manage several categories of personal data (collectively, "Personal Data") and sensitive personal data ("Sensitive Personal Data"/health records) stored in the shared database schema:

### 2.1 Administrative and Staff Data (Nurses/Clinicians)
To secure the application and log administrative audits, we collect and store:
* Full name
* Professional email address
* Role (e.g., administrator, nurse, clinician)
* Facility association and facility code

### 2.2 Mother and Caregiver Data
To facilitate patient management and care coordination:
* Full name, date of birth, and gender
* National Identification Number (ID) or passport number
* Antenatal Care (ANC) registration number
* Contact details (phone number, county, sub-county)
* Pregnancy status and history (Last Menstrual Period [LMP], Estimated Date of Delivery [EDD], Gravida, Parity)
* Language preferences (English, Swahili)
* Emergency contact details and assigned Community Health Volunteer (CHV) alerts

### 2.3 Child Data
To track pediatric health, vaccinations, and growth:
* Full name, date of birth, and gender
* Birth characteristics (birth weight in kg, birth height in cm, gestational age in weeks, birth facility, birth type)
* Growth and nutritional indicators (weight, height, MUAC - Mid-Upper Arm Circumference, head circumference)
* Health status classification (healthy, monitor, at risk, critical)

### 2.4 Sensitive Health and Medical Records
The Application accesses clinical records entered by healthcare providers:
* **ANC Visit Details:** Blood pressure (systolic/diastolic), maternal weight, fundal height, fetal heart rate, haemoglobin levels, urine protein, and HIV status.
* **Immunization Records:** Vaccines scheduled/administered, status (due, given, missed), doses, batches, and administering clinician names.
* **Developmental Milestones:** Motor, cognitive, language, social, and feeding milestones achieved.
* **AI Alerts and Risk Flags:** Automated risk alerts (e.g., growth anomalies, missed vaccines, danger signs) generated to prioritize critical cases.

---

## 3. How and Why We Use Your Data (Purpose of Processing)

We process this data for the following essential medical, administrative, and public health purposes:

1. **Patient Care Coordination:** Enabling administrators to track maternal health journeys, growth tracking, and vaccination schedules.
2. **Clinical Monitoring & AI Risk Alerts:** Providing automated notifications when patients miss vital vaccine appointments or display danger signs, enabling prompt clinical intervention.
3. **Facility Resource Planning:** Reviewing aggregate statistics, immunization coverage, and diagnostic trends at the facility level.
4. **Staff Management & Audit Trails:** Monitoring administrative activities, recording which nurse administered specific vaccines, and auditing user creations.
5. **Security and Access Control:** Verifying the identity of administrators to prevent unauthorized access to sensitive patient files.

---

## 4. Legal Basis for Processing

In compliance with the **Kenya Data Protection Act, 2019** (Section 30) and general international regulations:
* **Consent:** Patients (mothers and caregivers) consent to the collection of their and their children’s medical data upon registration at the facility or via the Mother Portal PWA.
* **Vital Interests:** Processing is necessary to protect the life or vital health interests of the data subject (e.g., identifying high-risk pregnancies or administering critical vaccinations).
* **Public Health and Medical Purposes:** Processing is required for medical diagnosis, health treatment, and the management of healthcare systems by authorized health practitioners subject to professional confidentiality.

---

## 5. Data Storage, Hosting, and Security

Because the Facility PC app processes highly sensitive medical and clinical records, we implement robust, industry-standard administrative, physical, and technical safeguards:

### 5.1 Storage & Synchronization Architecture
* **Cloud Database:** Data is stored in a centralized, secure database.
* **Local Caching and Sync:** The app supports local database/state synchronization. Any locally cached administrative files, reports, or sync logs on the PC are stored within the application's isolated sandbox and are encrypted where supported.
* **Network Communication:** All network traffic between the Tauri desktop app and the cloud servers uses end-to-end encryption via HTTPS (TLS 1.3) and secure WebSockets.

### 5.2 Access Controls
* **Role-Based Access Control (RBAC):** Only authenticated users with explicit administrator or authorized clinician roles can access the Facility PC portal.
* **Multi-Tenant Separation:** Data is strictly isolated by `facility_id` so that staff at one facility cannot view patient records associated with another unless explicitly permitted by referral agreements.
* **Session Integrity:** Active sessions are monitored and automatically terminated after periods of inactivity to protect workstations in open clinical environments.

---

## 6. Data Retention and Deletion

We adhere to the principle of **Storage Limitation**:
* **Active Patient Records:** Retained in accordance with national health guidelines and facility-specific medical record retention policies.
* **Staff/Administrative Credentials:** Retained for the duration of the staff member's employment or contract with the facility, plus any legally required audit periods.
* **Secure Disposal:** When records are flagged for deletion by the Data Controller, they are purged from active database servers and subsequent backup rotations.

---

## 7. Data Sharing and Third-Party Disclosures

We do not sell, rent, or trade patient or administrative data. Data is shared only under the following strict conditions:
* **Referrals and Care Teams:** Authorized sharing between clinic staff (nurses, community health volunteers, and referring doctors) to ensure continuous care.
* **Authorized Sub-processors:** Infrastructure hosting providers that operate under rigorous data processing agreements prohibiting independent data use.
* **Legal and Regulatory Compliance:** Disclosures required by law, such as reporting communicable diseases to the Ministry of Health or complying with court orders.

---

## 8. Data Subject Rights

Mothers, caregivers, and staff members have specific rights regarding their personal data under the **Kenya Data Protection Act, 2019** and **GDPR**:

1. **Right to Access:** You may request a copy of the personal and clinical data stored in the system.
2. **Right to Rectification:** You have the right to correct inaccurate, incomplete, or outdated personal or clinical records.
3. **Right to Erasure ("Right to be Forgotten"):** You may request deletion of records, subject to medical retention laws that require health facilities to preserve clinical history.
4. **Right to Object or Restrict Processing:** You may object to certain forms of data processing or request a restriction on how data is handled.
5. **Right to Portability:** You can request that your health logs be exported in a structured, machine-readable format for transfer to another facility.

To exercise these rights, patient data subjects should contact the **Data Protection Officer (DPO)** of the health facility where they registered. Administrators can raise inquiries regarding their account credentials directly with the facility’s IT team or TotoAfya system developers.

---

## 9. Contact Information and Regulatory Recourse

If you have any questions about this Privacy Policy or how data is processed within the TotoAfya Facility PC Application, please contact us:

* **Email:** rickmwasswiz@gmail.com
* **Address:** Kisii, Kenya

For concerns regarding how your health data is handled, you also have the right to lodge a complaint with the regulatory authority:
* **In Kenya:** The Office of the Data Protection Commissioner (ODPC) via [odpc.go.ke](https://www.odpc.go.ke).
