-- Add alias behavior and notes
ALTER TABLE aliases ADD COLUMN destination_type TEXT NOT NULL DEFAULT 'forward';

ALTER TABLE aliases ADD COLUMN note TEXT;

-- Allow destination to be empty for fail/blackhole aliases
-- SQLite/D1 does not support dropping NOT NULL directly,
-- so we'll rebuild the aliases table below.

CREATE TABLE aliases_new (
    id TEXT PRIMARY KEY,
    domain_id TEXT NOT NULL,
    local_part TEXT NOT NULL,
    destination TEXT,
    destination_type TEXT NOT NULL DEFAULT 'forward',
    note TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at INTEGER NOT NULL,
    disabled_at INTEGER,
    FOREIGN KEY (domain_id) REFERENCES domains(id),
    UNIQUE(domain_id, local_part)
);

INSERT INTO aliases_new (
    id,
    domain_id,
    local_part,
    destination,
    destination_type,
    note,
    status,
    created_at,
    disabled_at
)
SELECT
    id,
    domain_id,
    local_part,
    destination,
    destination_type,
    note,
    status,
    created_at,
    disabled_at
FROM aliases;

DROP TABLE aliases;

ALTER TABLE aliases_new RENAME TO aliases;

-- Saved destinations
CREATE TABLE destinations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, email)
);
