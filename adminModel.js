const pool = require("../database/db");

const getDashboardStats = async () => {
    const [[users]] = await pool.query(
        `SELECT COUNT(*) AS total_users
         FROM users`
    );

    const [[students]] = await pool.query(
        `SELECT COUNT(*) AS total_students
         FROM users u
         JOIN roles r
             ON u.role_id = r.role_id
         WHERE r.role_name = 'STUDENT'`
    );

    const [[faculty]] = await pool.query(
        `SELECT COUNT(*) AS total_faculty
         FROM users u
         JOIN roles r
             ON u.role_id = r.role_id
         WHERE r.role_name = 'FACULTY'`
    );

    const [[clubs]] = await pool.query(
        `SELECT COUNT(*) AS total_clubs
         FROM users u
         JOIN roles r
             ON u.role_id = r.role_id
         WHERE r.role_name = 'CLUB'`
    );

    const [[opportunities]] = await pool.query(
        `SELECT COUNT(*) AS total_opportunities
         FROM opportunities`
    );

    const [[verifiedOpportunities]] = await pool.query(
        `SELECT COUNT(*) AS verified_opportunities
         FROM opportunities
         WHERE is_verified = TRUE`
    );

    return {
        totalUsers: Number(users.total_users),
        totalStudents: Number(students.total_students),
        totalFaculty: Number(faculty.total_faculty),
        totalClubs: Number(clubs.total_clubs),
        totalOpportunities: Number(
            opportunities.total_opportunities
        ),
        verifiedOpportunities: Number(
            verifiedOpportunities.verified_opportunities
        )
    };
};

const getAllUsers = async (search = "", role = "") => {
    let query = `
        SELECT
            u.user_id,
            u.college_id,
            u.full_name,
            u.email,
            u.department,
            u.year,
            u.section,
            r.role_name,
            u.is_active,
            u.created_at
        FROM users u
        JOIN roles r
            ON u.role_id = r.role_id
        WHERE 1 = 1
    `;

    const params = [];

    if (search) {
        query += `
            AND (
                u.full_name LIKE ?
                OR u.email LIKE ?
                OR CAST(u.college_id AS CHAR) LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        params.push(
            searchValue,
            searchValue,
            searchValue
        );
    }

    if (role) {
        query += ` AND r.role_name = ?`;
        params.push(role);
    }

    query += ` ORDER BY u.created_at DESC`;

    const [users] = await pool.query(query, params);

    return users;
};

const getAllOpportunities = async () => {
    const [opportunities] = await pool.query(
        `SELECT
            o.opportunity_id,
            o.title,
            o.description,
            o.organization,
            o.opportunity_type,
            o.location,
            o.mode,
            o.deadline,
            o.application_link,
            o.is_verified,
            o.created_by,
            o.created_at
         FROM opportunities o
         ORDER BY o.created_at DESC`
    );

    return opportunities;
};

const getAllNotices = async () => {
    const [notices] = await pool.query(
        `SELECT
            p.post_id,
            p.author_id,
            u.full_name AS author_name,
            u.email AS author_email,
            r.role_name AS author_role,
            p.post_type,
            p.title,
            p.content,
            p.is_verified,
            p.created_at
         FROM posts p
         JOIN users u
             ON p.author_id = u.user_id
         JOIN roles r
             ON u.role_id = r.role_id
         WHERE p.post_type = 'NOTICE'
         ORDER BY p.created_at DESC`
    );

    return notices;
};


const updateNoticeVerification = async (postId, isVerified) => {
    const [result] = await pool.query(
        `UPDATE posts
         SET is_verified = ?
         WHERE post_id = ?
         AND post_type = 'NOTICE'`,
        [isVerified, postId]
    );

    return result;
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getAllOpportunities,
    getAllNotices,
    updateNoticeVerification
};