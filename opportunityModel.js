const pool = require("../database/db");

const createOpportunity = async (opportunity) => {
    const {
        title,
        description,
        organization,
        opportunityType,
        location,
        mode,
        deadline,
        applicationLink,
        isVerified,
        createdBy
    } = opportunity;

    const [result] = await pool.query(
        `INSERT INTO opportunities
        (
            title,
            description,
            organization,
            opportunity_type,
            location,
            mode,
            deadline,
            application_link,
            is_verified,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            title,
            description,
            organization,
            opportunityType,
            location || null,
            mode || null,
            deadline || null,
            applicationLink || null,
            isVerified || false,
            createdBy
        ]
    );

    return result.insertId;
};

const getAllOpportunities = async () => {
    const [rows] = await pool.query(
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
            o.created_at,
            u.college_id AS created_by
        FROM opportunities o
        JOIN users u
            ON o.created_by = u.user_id
        ORDER BY o.created_at DESC`
    );

    return rows;
};

const getOpportunityById = async (opportunityId) => {
    const [rows] = await pool.query(
        `SELECT
            opportunity_id,
            title,
            description,
            organization,
            opportunity_type,
            location,
            mode,
            deadline,
            application_link,
            is_verified,
            created_by,
            created_at
        FROM opportunities
        WHERE opportunity_id = ?`,
        [opportunityId]
    );

    return rows[0];
};

const addOpportunitySkill = async (opportunityId, skillId) => {
    const [result] = await pool.query(
        `INSERT INTO opportunity_skills
        (opportunity_id, skill_id)
        VALUES (?, ?)`,
        [opportunityId, skillId]
    );

    return result;
};

const getOpportunitySkills = async (opportunityId) => {
    const [rows] = await pool.query(
        `SELECT
            s.skill_id,
            s.skill_name
        FROM opportunity_skills os
        JOIN skills s
            ON os.skill_id = s.skill_id
        WHERE os.opportunity_id = ?
        ORDER BY s.skill_name`,
        [opportunityId]
    );

    return rows;
};

const getRecommendedOpportunities = async (userId) => {
    const [rows] = await pool.query(
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
            COUNT(DISTINCT os.skill_id) AS total_skills,
            COUNT(
                DISTINCT CASE
                    WHEN us.skill_id IS NOT NULL
                    THEN os.skill_id
                END
            ) AS matched_skills
        FROM opportunities o
        JOIN opportunity_skills os
            ON o.opportunity_id = os.opportunity_id
        LEFT JOIN user_skills us
            ON os.skill_id = us.skill_id
            AND us.user_id = ?
        GROUP BY
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
            o.created_at
        ORDER BY
            (
                COUNT(
                    DISTINCT CASE
                        WHEN us.skill_id IS NOT NULL
                        THEN os.skill_id
                    END
                ) / COUNT(DISTINCT os.skill_id)
            ) DESC,
            o.created_at DESC`,
        [userId]
    );

    return rows;
};

const getOpportunitySkillsForMatching = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            o.opportunity_id,
            s.skill_id,
            s.skill_name,
            CASE
                WHEN us.skill_id IS NOT NULL THEN 1
                ELSE 0
            END AS is_matched
        FROM opportunities o
        JOIN opportunity_skills os
            ON o.opportunity_id = os.opportunity_id
        JOIN skills s
            ON os.skill_id = s.skill_id
        LEFT JOIN (
            SELECT DISTINCT skill_id
            FROM user_skills
            WHERE user_id = ?
        ) us
            ON os.skill_id = us.skill_id
        ORDER BY o.opportunity_id, s.skill_name`,
        [userId]
    );

    return rows;
};

module.exports = {
    createOpportunity,
    getAllOpportunities,
    getOpportunityById,
    addOpportunitySkill,
    getOpportunitySkills,
    getRecommendedOpportunities,
    getOpportunitySkillsForMatching
};