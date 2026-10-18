/*Made role_id and role_name
1-Student
2-Faculty
3-HOD
4-Admin
5-Club
*/
CREATE DATABASE IF NOT EXISTS campusconnect;

USE campusconnect;

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    college_id BIGINT NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    first_login BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
);

INSERT INTO roles (role_name)
VALUES
    ('STUDENT'),
    ('FACULTY'),
    ('HOD'),
    ('ADMIN'),
    ('CLUB');