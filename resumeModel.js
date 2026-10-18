const pool = require("../database/db");

const createResume = async (
    userId,
    fileName,
    filePath,
    extractedText
) => {
    const [result] = await pool.query(
        `INSERT INTO resumes
        (
            user_id,
            file_name,
            file_path,
            extracted_text
        )
        VALUES (?, ?, ?, ?)`,
        [
            userId,
            fileName,
            filePath,
            extractedText
        ]
    );

    return result.insertId;
};

const getResumeByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            resume_id,
            file_name,
            file_path,
            uploaded_at
        FROM resumes
        WHERE user_id = ?
        ORDER BY uploaded_at DESC
        LIMIT 1`,
        [userId]
    );

    return rows[0];
};

const deleteResumeSkills = async (userId) => {
    await pool.query(
        `DELETE FROM user_skills
         WHERE user_id = ?
         AND source = 'RESUME'`,
        [userId]
    );
};

const addResumeSkill = async (userId, skillId) => {
    await pool.query(
        `INSERT INTO user_skills
        (user_id, skill_id, source)
        VALUES (?, ?, 'RESUME')`,
        [userId, skillId]
    );
};

module.exports = {
    createResume,
    getResumeByUserId,
    deleteResumeSkills,
    addResumeSkill
};