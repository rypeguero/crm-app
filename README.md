# Service Studio — CRM App

A learning project for an appointment booking system, built with HTML, CSS, JavaScript, FastAPI, and PostgreSQL. CRM stands for Customer Relationship Management.

Visitors choose a service, enter their contact details, and request a future appointment. FastAPI validates the date and time, then saves the request in PostgreSQL with a `pending` status. Requests require confirmation; submitting the form does not confirm a booking.

## Current features

- Responsive booking page with three sample services.
- Service buttons select a service and scroll to the form.
- Required form fields and browser email validation.
- Frontend and backend checks for past appointment times.
- PostgreSQL storage with automatically generated appointment IDs.
- Feedback for successful requests and errors.
- Interactive API documentation at `/docs`.

## Project structure

```text
crm-app/
├── backend/
│   └── main.py       # FastAPI endpoints and database insert logic
├── frontend/
│   ├── index.html    # Booking page and form
│   ├── styles.css    # Page and form styling
│   └── script.js     # Service selection, validation, and API requests
├── .gitignore
└── README.md
```

## Local setup

These instructions use Windows PowerShell. Install Python and PostgreSQL first, and make sure the PostgreSQL server is running and `psql` is available in your terminal.

### 1. Install backend packages

From the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install "fastapi[standard]" "psycopg[binary]"
```

If you already created the environment and installed the packages, just activate the environment.

### 2. Create the database and table

In a separate terminal, connect to PostgreSQL:

```powershell
psql -h localhost -U postgres -d postgres
```

Enter your PostgreSQL password when prompted. At the PostgreSQL prompt, run:

```sql
CREATE DATABASE crm_app;
```

Switch to the new database:

```text
\c crm_app
```

Once the prompt says `crm_app=#`, create the table:

```sql
CREATE TABLE appointments (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending'
);
```

Skip database or table creation if they already exist. To inspect the table, run `\d appointments`. Use `\q` to exit PostgreSQL.

### 3. Configure the backend connection

In the PowerShell terminal with the Python environment active, set:

```powershell
$env:PGHOST = "localhost"
$env:PGPORT = "5432"
$env:PGDATABASE = "crm_app"
$env:PGUSER = "postgres"
$env:PGPASSWORD = 'YOUR_PASSWORD'
```

Replace `YOUR_PASSWORD` with your local PostgreSQL password. These variables apply to this terminal session. The app reads them through Psycopg; it does not currently load a `.env` file.

### 4. Start FastAPI

From `backend`, in the same terminal where you set the connection variables:

```powershell
fastapi dev main.py
```

- Backend health message: http://127.0.0.1:8000/
- API testing page: http://127.0.0.1:8000/docs

Leave this terminal running.

### 5. Start the frontend

Open another terminal in the project root:

```powershell
python -m http.server 5500 --directory frontend
```

Open **http://127.0.0.1:5500** and submit a future appointment. Use this exact address: the backend currently permits requests from this frontend origin.

## API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Return a backend health message |
| POST | `/appointments` | Validate and save an appointment request |

Example request body; replace the date with a future date when testing:

```json
{
  "service": "Service 1",
  "name": "Alex",
  "email": "alex@example.com",
  "phone": "555-123-4567",
  "date": "2099-01-15",
  "time": "14:30",
  "notes": "First visit"
}
```

Times use a 24-hour clock: `14:30` means 2:30 PM. The backend uses its server's local time and rejects timezone suffixes such as `Z`.

A successful request returns HTTP `200`:

```json
{
  "message": "Appointment request saved. Awaiting confirmation.",
  "id": 1
}
```

The ID depends on the rows already inserted. Past appointments and timezone-bearing times return `400`; malformed or missing required request fields return `422`.

## Check saved requests

Connect to the CRM database:

```powershell
psql -h localhost -U postgres -d crm_app
```

Then run:

```sql
SELECT id, customer_name, service, appointment_date, appointment_time, status
FROM appointments
ORDER BY id DESC;
```

PostgreSQL keeps these rows when FastAPI restarts. Database records are separate from the Git repository.

## Current limitations and next steps

This is a local learning application. Viewing, approving, and declining appointments are not implemented yet.

- Strengthen backend validation for customer details and allowed services.
- Prevent repeated submissions while a request is being sent.
- Improve feedback when the database is unavailable.
- Define a consistent business timezone for deployment.
- Add authentication before exposing customer records through an admin view.
- Add a dependency file and database migrations for repeatable setup.

The current local connection uses the `postgres` administrator account. A deployed app should use a dedicated database account with limited permissions.

## Git exclusions

The `.gitignore` excludes Python environments, generated caches, `.env` files, and local database files. Do not add database passwords to source code or commits.
