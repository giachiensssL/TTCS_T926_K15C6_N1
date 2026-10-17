CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL CHECK (length(full_name) <= 120),
    email TEXT NOT NULL CHECK (length(email) <= 254),
    phone TEXT CHECK (phone IS NULL OR length(phone) <= 30),
    course_interest TEXT CHECK (course_interest IS NULL OR length(course_interest) <= 160),
    source TEXT CHECK (source IS NULL OR length(source) <= 80),
    notes TEXT CHECK (notes IS NULL OR length(notes) <= 2000),
    status TEXT NOT NULL DEFAULT 'NEW'
        CHECK (status IN ('NEW', 'CONTACTING', 'QUALIFIED', 'CLOSED_WON', 'CLOSED_LOST', 'ENROLLED')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_status_created_at ON leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON leads (LOWER(email));

CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_code TEXT NOT NULL UNIQUE,
    account_id INTEGER NOT NULL UNIQUE REFERENCES accounts(id),
    lead_id INTEGER NOT NULL UNIQUE REFERENCES leads(id),
    enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
