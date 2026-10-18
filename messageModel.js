
const pool = require("../database/db");

const getMessages = async (conversationId) => {
    const [rows] = await pool.query(
        `SELECT
            m.message_id,
            m.conversation_id,
            m.sender_id,
            u.full_name AS sender_name,
            m.message_text,
            m.sent_at,
            m.read_at
         FROM messages m
         JOIN users u
           ON u.user_id = m.sender_id
         WHERE m.conversation_id = ?
         ORDER BY m.sent_at ASC, m.message_id ASC`,
        [conversationId]
    );

    return rows;
};

const createMessage = async (conversationId, senderId, messageText) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO messages
             (conversation_id, sender_id, message_text)
             VALUES (?, ?, ?)`,
            [conversationId, senderId, messageText]
        );

        await connection.query(
            `UPDATE conversations
             SET last_message_at = CURRENT_TIMESTAMP
             WHERE conversation_id = ?`,
            [conversationId]
        );

        const [rows] = await connection.query(
            `SELECT
                m.message_id,
                m.conversation_id,
                m.sender_id,
                u.full_name AS sender_name,
                m.message_text,
                m.sent_at,
                m.read_at
             FROM messages m
             JOIN users u ON u.user_id = m.sender_id
             WHERE m.message_id = ?`,
            [result.insertId]
        );

        await connection.commit();
        return rows[0];
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getMessages,
    createMessage
};
