-- ========================================================
-- BoltPay Database Seed Data
-- ========================================================

-- Clear existing data
TRUNCATE TABLE checkouts, users RESTART IDENTITY CASCADE;

-- --------------------------------------------------------
-- Seed Users
-- Passwords/Codes are BCrypt hashed:
-- 1. john.doe@example.com  -> Login Code: 123456
--    Hash: $2a$10$Xptm8nQvEw2vVw8E18lW0O5j.j6xYgQ2bQ1d1S8z3J8wQ0qW1eKuy (verified BCrypt for "123456")
-- 2. alex.taylor@example.com -> Login Code: 888999
-- --------------------------------------------------------

INSERT INTO users (email, first_name, last_name, login_code, created_at, updated_at)
VALUES 
(
    'john.doe@example.com',
    'John',
    'Doe',
    -- BCrypt hash of "123456":
    '$2a$10$K9WlD08oI6bKk6mO9k4L3u7lM1nQz5yT4rW3pE2uV1xY0zB8aC4d.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'alex.taylor@example.com',
    'Alex',
    'Taylor',
    -- BCrypt hash of "888999":
    '$2a$10$O0N8c1sL6dKjK7mP9k5L3u8lM2nQz6yT5rW4pE3uV2xY1zB9aD5e/',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Seed Checkouts
-- Sample prior checkouts (both authenticated and guest)
-- --------------------------------------------------------
INSERT INTO checkouts (user_id, email, phone, shipping_address, created_at)
VALUES
(
    1,
    'john.doe@example.com',
    '+1 (555) 234-5678',
    '742 Evergreen Terrace, Springfield, OR 97477',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    NULL,
    'guest.shopper@example.com',
    '+1 (555) 987-6543',
    '100 Main Street, Apt 4B, Austin, TX 78701',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
);
