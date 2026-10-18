const pool = require("../database/db");

const addUserSkill = async (userId, skillId, source) => {
    const [result] = await pool.query(
        `INSERT INTO user_skills
        (user_id, skill_id, source)
        VALUES (?, ?, ?)`,
        [userId, skillId, source]
    );

    return result;
};

const getUserSkills = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            s.skill_id,
            s.skill_name,
            us.source
        FROM user_skills us
        JOIN skills s
            ON us.skill_id = s.skill_id
        WHERE us.user_id = ?
        ORDER BY s.skill_name`,
        [userId]
    );

    return rows;
};

module.exports = {
    addUserSkill,
    getUserSkills
};