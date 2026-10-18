const pool = require("../database/db");

const createResetToken = async (userId, token, expiresAt) => {
    await pool.query(
        `UPDATE password_reset_tokens
         SET is_used = TRUE
         WHERE user_id = ?
         AND is_used = FALSE`,
        [userId]
    );

    await pool.query(
        `INSERT INTO password_reset_tokens
        (user_id, token, expires_at)
        VALUES (?, ?, ?)`,
        [userId, token, expiresAt]
    );
};

const findValidResetToken = async (token) => {
    const [rows] = await pool.query(
        `SELECT *
         FROM password_reset_tokens
         WHERE token = ?
         AND is_used = FALSE
         AND expires_at > NOW()
         LIMIT 1`,
        [token]
    );

    return rows[0];
};

const markTokenUsed = async (tokenId) => {
    await pool.query(
        `UPDATE password_reset_tokens
         SET is_used = TRUE
         WHERE token_id = ?`,
        [tokenId]
    );
};

module.exports = {
    createResetToken,
    findValidResetToken,
    markTokenUsed
};