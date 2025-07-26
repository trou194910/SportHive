CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    email         TEXT NOT NULL,
    permission    INTEGER NOT NULL,
    UNIQUE (name),
    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS activities (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT NOT NULL,
    condition        INTEGER NOT NULL,
    type             TEXT,
    description      TEXT,
    location         TEXT,
    start_time       TEXT NOT NULL,
    end_time         TEXT NOT NULL,
    capacity         INTEGER NOT NULL,
    organizer_id     INTEGER NOT NULL,
    organizer_name   TEXT NOT NULL,
    created_at       TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at       TEXT DEFAULT CURRENT_TIMESTAMP,
    participants     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_comments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id   INTEGER NOT NULL,
    activity_name TEXT NOT NULL,
    user_id       INTEGER NOT NULL,
    user_name     TEXT NOT NULL,
    content       TEXT NOT NULL,
    created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at    TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS registrations (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL,
    user_name         TEXT NOT NULL,
    activity_id       INTEGER NOT NULL,
    registration_time TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, activity_id),
    FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS follows (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    follow_id   INTEGER NOT NULL,
    follow_name TEXT NOT NULL,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, follow_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (follow_id) REFERENCES users (id) ON DELETE CASCADE
);