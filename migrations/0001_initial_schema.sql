CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
);

CREATE TABLE domains (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    created_at INTEGER NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id),

    UNIQUE(user_id, domain)
);

CREATE TABLE aliases (
    id TEXT PRIMARY KEY,
    domain_id TEXT NOT NULL,
    local_part TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at INTEGER NOT NULL,
    disabled_at INTEGER,

    FOREIGN KEY (domain_id) REFERENCES domains(id),

    UNIQUE(domain_id, local_part)
);
