import { useEffect, useState } from "react";

function Opportunities() {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOpportunities = async () => {
            try {
                const token = localStorage.getItem("cc_token");

                const response = await fetch(
                    "http://localhost:5000/api/opportunities/recommended",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to fetch opportunities"
                    );
                }

                setOpportunities(data.opportunities);
            } catch (error) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunities();
    }, []);

    if (loading) {
        return (
            <div className="page">
                <div className="content-panel">
                    <h2>Opportunities</h2>
                    <p>Loading opportunities...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="content-panel">
                    <h2>Opportunities</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="content-panel">
                <div className="page-header">
                    <div>
                        <h1>Opportunities</h1>
                        <p>
                            Opportunities matched to your skills and resume.
                        </p>
                    </div>
                </div>

                {opportunities.length === 0 ? (
                    <div className="empty-state">
                        <h3>No opportunities found</h3>
                        <p>
                            Check back later for new internships, jobs and
                            competitions.
                        </p>
                    </div>
                ) : (
                    <div className="opportunity-list">
                        {opportunities.map((opportunity) => (
                            <div
                                className="opportunity-card"
                                key={opportunity.opportunity_id}
                            >
                                <div className="opportunity-top">
                                    <div>
                                        <h2>{opportunity.title}</h2>
                                        <p className="organization">
                                            {opportunity.organization}
                                        </p>
                                    </div>

                                    <div className="match-score">
                                        {opportunity.matchScore}% Match
                                    </div>
                                </div>

                                <p className="description">
                                    {opportunity.description}
                                </p>

                                <div className="opportunity-meta">
                                    <span>
                                        {opportunity.opportunity_type}
                                    </span>

                                    <span>
                                        {opportunity.mode}
                                    </span>

                                    <span>
                                        {opportunity.location}
                                    </span>
                                </div>

                                <div className="skill-section">
                                    <h4>Matched Skills</h4>

                                    <div className="skill-list">
                                        {opportunity.matchedSkillNames.map(
                                            (skill) => (
                                                <span
                                                    className="skill matched"
                                                    key={skill}
                                                >
                                                    ✓ {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                {opportunity.missingSkillNames.length > 0 && (
                                    <div className="skill-section">
                                        <h4>Missing Skills</h4>

                                        <div className="skill-list">
                                            {opportunity.missingSkillNames.map(
                                                (skill) => (
                                                    <span
                                                        className="skill missing"
                                                        key={skill}
                                                    >
                                                        ✗ {skill}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="opportunity-bottom">
                                    <span>
                                        Deadline:{" "}
                                        {new Date(
                                            opportunity.deadline
                                        ).toLocaleDateString()}
                                    </span>

                                    {opportunity.application_link && (
                                        <a
                                            href={
                                                opportunity.application_link
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Apply →
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Opportunities;