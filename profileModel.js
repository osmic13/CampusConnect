const pool = require("../database/db");

const getProfileByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            u.user_id,
            u.college_id,
            u.full_name,
            u.email,
            u.department,
            u.year,
            u.section,
            u.is_active,
            u.created_at,
            r.role_name
         FROM users u
         JOIN roles r
            ON u.role_id = r.role_id
         WHERE u.user_id = ?`,
        [userId]
    );

    return rows[0];
};

module.exports = {
    getProfileByUserId
};