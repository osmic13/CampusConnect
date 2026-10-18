/*  
We have 4 DB operations :
1. findUserByCollegId()-Find user during first login.
2. findUserByEmail()-Find user for password reset.
3. createUser()-Create a new user.
4. updatePassword()-Update password and remove the first-login status.
*/

const pool = require("../database/db");

const findUserByCollegeId = async (collegeId) => {
    const [rows] = await pool.query(
        `SELECT 
            u.user_id,
            u.college_id,
            u.email,
            u.password_hash,
            u.role_id,
            u.first_login,
            u.is_active,
            r.role_name
         FROM users u
         JOIN roles r ON u.role_id = r.role_id
         WHERE u.college_id = ?`,
        [collegeId]
    );

    return rows[0];
};

const findUserByEmail = async (email) => {
    const [rows] = await pool.query(
        `SELECT 
            u.user_id,
            u.college_id,
            u.email,
            u.password_hash,
            u.role_id,
            u.first_login,
            u.is_active,
            r.role_name
         FROM users u
         JOIN roles r ON u.role_id = r.role_id
         WHERE u.email = ?`,
        [email]
    );

    return rows[0];
};

const createUser = async (
    collegeId,
    email,
    passwordHash,
    roleId
) => {
    const [result] = await pool.query(
        `INSERT INTO users
        (college_id, email, password_hash, role_id)
        VALUES (?, ?, ?, ?)`,
        [collegeId, email, passwordHash, roleId]
    );

    return result.insertId;
};

const updatePassword = async (userId, passwordHash) => {
    const [result] = await pool.query(
        `UPDATE users
         SET password_hash = ?, first_login = FALSE
         WHERE user_id = ?`,
        [passwordHash, userId]
    );

    return result.affectedRows;
};

module.exports = {
    findUserByCollegeId,
    findUserByEmail,
    createUser,
    updatePassword
};