const pool = require("../database/db");

const createOTP = async (userId, otp, expiresAt) => {
    await pool.query(
        `UPDATE password_reset_otps
         SET is_used = TRUE
         WHERE user_id = ?
         AND is_used = FALSE`,
        [userId]
    );

    await pool.query(
        `INSERT INTO password_reset_otps
        (user_id, otp, expires_at)
        VALUES (?, ?, ?)`,
        [userId, otp, expiresAt]
    );
};

const findValidOTP = async (userId, otp) => {
    const [rows] = await pool.query(
        `SELECT *
         FROM password_reset_otps
         WHERE user_id = ?
         AND otp = ?
         AND is_used = FALSE
         AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, otp]
    );

    return rows[0];
};

const markOTPUsed = async (otpId) => {
    await pool.query(
        `UPDATE password_reset_otps
         SET is_used = TRUE
         WHERE otp_id = ?`,
        [otpId]
    );
};

module.exports = {
    createOTP,
    findValidOTP,
    markOTPUsed
};