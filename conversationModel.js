
const pool = require("../database/db");

const createConversation = async (userId, recipientId) => {
    const firstUserId = Math.min(userId, recipientId);
    const secondUserId = Math.max(userId, recipientId);

    const [users] = await pool.query(
        `SELECT user_id
         FROM users
         WHERE user_id IN (?, ?)
           AND is_active = TRUE`,
        [firstUserId, secondUserId]
    );

    if (users.length !== 2) {
        throw new Error("One or both users do not exist or are inactive");
    }

    await pool.query(
        `INSERT IGNORE INTO conversations
         (user_one_id, user_two_id)
         VALUES (?, ?)`,
        [firstUserId, secondUserId]
    );

    const [rows] = await pool.query(
        `SELECT conversation_id, user_one_id, user_two_id,
                created_at, last_message_at
         FROM conversations
         WHERE user_one_id = ? AND user_two_id = ?`,
        [firstUserId, secondUserId]
    );

    return rows[0];
};

const getUserConversations = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            c.conversation_id,
            c.created_at,
            c.last_message_at,
            u.user_id AS other_user_id,
            u.full_name AS other_user_name,
            u.college_id AS other_college_id,
            u.department AS other_department,
            lm.message_text AS last_message,
            lm.sender_id AS last_message_sender_id,
            lm.sent_at AS last_message_sent_at
         FROM conversations c
         JOIN users u
           ON u.user_id = CASE
               WHEN c.user_one_id = ? THEN c.user_two_id
               ELSE c.user_one_id
           END
         LEFT JOIN messages lm
           ON lm.message_id = (
               SELECT m.message_id
               FROM messages m
               WHERE m.conversation_id = c.conversation_id
               ORDER BY m.sent_at DESC, m.message_id DESC
               LIMIT 1
           )
         WHERE c.user_one_id = ? OR c.user_two_id = ?
         ORDER BY
           COALESCE(c.last_message_at, c.created_at) DESC,
           c.conversation_id DESC`,
        [userId, userId, userId]
    );

    return rows;
};

const getConversationForUser = async (conversationId, userId) => {
    const [rows] = await pool.query(
        `SELECT conversation_id, user_one_id, user_two_id
         FROM conversations
         WHERE conversation_id = ?
           AND (user_one_id = ? OR user_two_id = ?)`,
        [conversationId, userId, userId]
    );

    return rows[0];
};


const getAvailableUsers = async (currentUserId) => {
    const [rows] = await pool.query(
        `SELECT
            user_id,
            full_name,
            college_id,
            department,
            year,
            section
         FROM users
         WHERE is_active = TRUE
           AND user_id != ?
         ORDER BY full_name`,
        [currentUserId]
    );

    return rows;
};

module.exports = {
    createConversation,
    getUserConversations,
    getConversationForUser,
    getAvailableUsers
};
