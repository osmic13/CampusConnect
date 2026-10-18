const pool = require("../database/db");

const getAllPosts = async () => {
    const [rows] = await pool.query(`
        SELECT
            p.post_id,
            p.post_type,
            p.title,
            p.content,
            p.is_verified,
            p.created_at,
            u.college_id,
            r.role_name
        FROM posts p
        JOIN users u
            ON p.author_id = u.user_id
        JOIN roles r
            ON u.role_id = r.role_id
        ORDER BY p.created_at DESC
    `);

    return rows;
};

module.exports = {
    getAllPosts
};