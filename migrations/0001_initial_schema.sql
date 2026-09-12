CREATE TABLE domains (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, domain)
);

CREATE TABLE aliases (
    id TEXT PRIMARY KEY,
    domain_id TEXT NOT NULL,
    local_part TEXT NOT NULL,
    destination TEXT,
    disabled_behavior TEXT NOT NULL DEFAULT 'blackhole',
    note TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at INTEGER NOT NULL,
    disabled_at INTEGER,
    FOREIGN KEY (domain_id) REFERENCES domains(id),
    UNIQUE(domain_id, local_part)
);

CREATE TABLE destinations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, email)
);
