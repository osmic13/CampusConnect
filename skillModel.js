const pool = require("../database/db");

const getAllSkills = async () => {
    const [rows] = await pool.query(
        `SELECT skill_id, skill_name
         FROM skills
         ORDER BY skill_name`
    );

    return rows;
};

module.exports = {
    getAllSkills
};