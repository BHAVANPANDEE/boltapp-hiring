-- ========================================================
-- BoltPay Database Schema
-- Target: PostgreSQL 14+
-- ========================================================

-- Drop tables if they already exist (safe for re-running)
DROP TABLE IF EXISTS checkouts;
DROP TABLE IF EXISTS users;

-- --------------------------------------------------------
-- 1. Users Table
-- --------------------------------------------------------
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    login_code VARCHAR(255) NOT NULL, -- BCrypt hashed 6-digit OTP
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- Case-insensitive index on email for high-speed recognition lookups
CREATE INDEX idx_users_email_lower ON users (LOWER(email));

-- --------------------------------------------------------
-- 2. Checkouts Table
-- --------------------------------------------------------
CREATE TABLE checkouts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_checkouts_user FOREIGN KEY (user_id) 
        REFERENCES users (id) 
        ON DELETE SET NULL
);

-- Indexes on checkouts for foreign key lookups and email queries
CREATE INDEX idx_checkouts_user_id ON checkouts (user_id);
CREATE INDEX idx_checkouts_email ON checkouts (email);
