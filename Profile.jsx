
import { useEffect, useState } from "react";
import {
  Mail,
  Hash,
  ShieldCheck,
  CalendarDays,
  Plus
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const getYearLabel = (year) => {
  const labels = {
    1: "1st Year",
    2: "2nd Year",
    3: "3rd Year",
    4: "4th Year"
  };

  return labels[year] || `${year}th Year`;
};

const getInitials = (name, role) => {
  if (!name || !name.trim()) {
    return role ? role.slice(0, 2) : "CC";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
};

export default function Profile() {
  const [profile, setProfile] = useState(null);

  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");

  const [resume, setResume] = useState(null);
  const [detectedSkills, setDetectedSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [resumeLoading, setResumeLoading] = useState(true);

  const [addingSkill, setAddingSkill] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [error, setError] = useState("");
  const [skillError, setSkillError] = useState("");
  const [skillMessage, setSkillMessage] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [resumeMessage, setResumeMessage] = useState("");

  const token = localStorage.getItem("cc_token");

  // Fetch account profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile");
        }

        setProfile(data.profile);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setError("Please log in to view your profile.");
      setLoading(false);
    }
  }, [token]);

  // Fetch uploaded resume
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setResumeLoading(true);
        setResumeError("");

        const response = await fetch(`${API_URL}/resume`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 404) {
          setResume(null);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load resume");
        }

        setResume(data.resume);
      } catch (err) {
        console.error(err);
        setResumeError(err.message);
      } finally {
        setResumeLoading(false);
      }
    };

    if (token) {
      fetchResume();
    } else {
      setResumeLoading(false);
    }
  }, [token]);

  // Fetch user's skills and the available skill list
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setSkillsLoading(true);
        setSkillError("");

        const [userResponse, allResponse] = await Promise.all([
          fetch(`${API_URL}/user-skills`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch(`${API_URL}/skills`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        const userData = await userResponse.json();
        const allData = await allResponse.json();

        if (!userResponse.ok) {
          throw new Error(userData.message || "Unable to load your skills");
        }

        if (!allResponse.ok) {
          throw new Error(allData.message || "Unable to load available skills");
        }

        setSkills(userData.skills || []);
        setAllSkills(allData.skills || []);
      } catch (err) {
        console.error(err);
        setSkillError(err.message);
      } finally {
        setSkillsLoading(false);
      }
    };

    if (token) {
      fetchSkills();
    } else {
      setSkillsLoading(false);
    }
  }, [token]);

  // Add a manual skill
  const addSkill = async () => {
    if (!selectedSkill || addingSkill) {
      return;
    }

    try {
      setAddingSkill(true);
      setSkillError("");
      setSkillMessage("");

      const response = await fetch(`${API_URL}/user-skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          skillId: Number(selectedSkill)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add skill");
      }

      // Fetch the authoritative list so duplicate/manual/resume
      // sources are displayed exactly as stored in the database.
      const skillsResponse = await fetch(`${API_URL}/user-skills`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const skillsData = await skillsResponse.json();

      if (!skillsResponse.ok) {
        throw new Error(skillsData.message || "Skill added, but refresh failed");
      }

      setSkills(skillsData.skills || []);
      setSelectedSkill("");
      setSkillMessage("Skill added successfully.");
    } catch (err) {
      console.error(err);
      setSkillError(err.message);
    } finally {
      setAddingSkill(false);
    }
  };

  // Upload and process a PDF resume
  const uploadResume = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setResumeError("Only PDF resumes are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError("Resume must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingResume(true);
      setResumeError("");
      setResumeMessage("");
      setDetectedSkills([]);

      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(`${API_URL}/resume/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to upload resume");
      }

      setResumeMessage("Resume uploaded and processed successfully.");
      setDetectedSkills(data.detectedSkills || []);

      setResume({
        resume_id: data.resumeId,
        file_name: file.name,
        uploaded_at: new Date().toISOString()
      });

      // Refresh skills because resume processing replaces
      // the user's RESUME-derived skills.
      const skillsResponse = await fetch(`${API_URL}/user-skills`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const skillsData = await skillsResponse.json();

      if (!skillsResponse.ok) {
        throw new Error(
          skillsData.message || "Resume uploaded, but skills could not be refreshed"
        );
      }

      setSkills(skillsData.skills || []);
    } catch (err) {
      console.error(err);
      setResumeError(err.message);
    } finally {
      setUploadingResume(false);
      event.target.value = "";
    }
  };

  // Available manual skills
  const existingSkillIds = new Set(
    skills.map((skill) => skill.skill_id)
  );

  const availableSkills = allSkills.filter(
    (skill) => !existingSkillIds.has(skill.skill_id)
  );

  const manualSkillCount = skills.filter(
    (skill) => skill.source === "MANUAL"
  ).length;

  const resumeSkillCount = skills.filter(
    (skill) => skill.source === "RESUME"
  ).length;

  // Loading state
  if (loading) {
    return (
      <section className="page profile-page">
        <p className="eyebrow">CAMPUSCONNECT</p>
        <h1>My Profile</h1>
        <p className="profile-status">Loading profile...</p>
      </section>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <section className="page profile-page">
        <p className="eyebrow">CAMPUSCONNECT</p>
        <h1>My Profile</h1>
        <p className="profile-status error">
          {error || "Profile not found."}
        </p>
      </section>
    );
  }

  const initials = getInitials(
    profile.full_name,
    profile.role_name
  );

  return (
    <section className="page profile-page">
      <p className="eyebrow">CAMPUSCONNECT</p>

      <h1>My Profile</h1>

      <p className="desc">
        Manage and view your CampusConnect account information.
      </p>

      <div className="profile-layout">
        <div className="profile-main">

          {/* Profile header */}
          <div className="profile-hero">
            <div className="profile-avatar">
              {initials}
            </div>

            <div>
              <h2>{profile.full_name || "CampusConnect User"}</h2>

              <p>
                {profile.role_name}
                {profile.department && ` · ${profile.department}`}
                {profile.year > 0 && ` · ${getYearLabel(profile.year)}`}
                {profile.section && ` · Section ${profile.section}`}
              </p>
            </div>
          </div>

          {/* Account information */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Account Information</h3>
            </div>

            <div className="profile-info-grid">

              <div className="profile-info">
                <div className="profile-icon">
                  <Hash size={17} />
                </div>
                <div>
                  <small>COLLEGE ID</small>
                  <strong>{profile.college_id}</strong>
                </div>
              </div>

              <div className="profile-info">
                <div className="profile-icon">
                  <Mail size={17} />
                </div>
                <div>
                  <small>EMAIL</small>
                  <strong>{profile.email}</strong>
                </div>
              </div>

              <div className="profile-info">
                <div className="profile-icon">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <small>DEPARTMENT</small>
                  <strong>{profile.department || "Not specified"}</strong>
                </div>
              </div>

              <div className="profile-info">
                <div className="profile-icon">
                  <CalendarDays size={17} />
                </div>
                <div>
                  <small>YEAR</small>
                  <strong>
                    {profile.year > 0
                      ? getYearLabel(profile.year)
                      : "Not specified"}
                  </strong>
                </div>
              </div>

              <div className="profile-info">
                <div className="profile-icon">
                  <Hash size={17} />
                </div>
                <div>
                  <small>SECTION</small>
                  <strong>{profile.section || "Not specified"}</strong>
                </div>
              </div>

              <div className="profile-info">
                <div className="profile-icon">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <small>ROLE</small>
                  <strong>{profile.role_name}</strong>
                </div>
              </div>

              <div className="profile-info">
                <div className="profile-icon">
                  <CalendarDays size={17} />
                </div>
                <div>
                  <small>MEMBER SINCE</small>
                  <strong>
                    {new Date(profile.created_at).toLocaleDateString()}
                  </strong>
                </div>
              </div>

            </div>
          </div>

          {/* Skills */}
          <div className="profile-card skills-card">
            <div className="profile-card-header">
              <div>
                <h3>My Skills</h3>
                <p>
                  Skills used to personalize opportunity recommendations.
                </p>
              </div>
            </div>

            {skillsLoading ? (
              <p className="profile-status">Loading skills...</p>
            ) : (
              <>
                <div className="skills-list">
                  {skills.length === 0 ? (
                    <p className="skills-empty">
                      No skills added yet.
                    </p>
                  ) : (
                    skills.map((skill) => (
                      <div
                        className="skill-item"
                        key={`${skill.skill_id}-${skill.source}`}
                      >
                        <div className="skill-item-left">
                          <span className="skill-name">
                            {skill.skill_name}
                          </span>

                          <span
                            className={`skill-source ${
                              skill.source === "RESUME"
                                ? "resume-source"
                                : "manual-source"
                            }`}
                          >
                            {skill.source}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="skill-add-section">
                  <label htmlFor="skill-select">
                    Add a skill manually
                  </label>

                  <div className="skill-add-row">
                    <select
                      id="skill-select"
                      value={selectedSkill}
                      onChange={(event) =>
                        setSelectedSkill(event.target.value)
                      }
                    >
                      <option value="">Select a skill</option>

                      {availableSkills.map((skill) => (
                        <option
                          key={skill.skill_id}
                          value={skill.skill_id}
                        >
                          {skill.skill_name}
                        </option>
                      ))}
                    </select>

                    <button
                      className="skill-add-button"
                      onClick={addSkill}
                      disabled={!selectedSkill || addingSkill}
                    >
                      <Plus size={17} />
                      {addingSkill ? "Adding..." : "Add Skill"}
                    </button>
                  </div>

                  {skillMessage && (
                    <p className="skill-success">{skillMessage}</p>
                  )}

                  {skillError && (
                    <p className="profile-status error">{skillError}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Resume */}
          <div className="profile-card resume-card">
            <div className="profile-card-header">
              <div>
                <h3>My Resume</h3>
                <p>
                  Upload your resume to detect skills and improve
                  opportunity matching.
                </p>
              </div>
            </div>

            {resumeLoading ? (
              <p className="profile-status">Loading resume...</p>
            ) : (
              <>
                {resume ? (
                  <div className="resume-file">
                    <div className="resume-file-info">
                      <div className="resume-icon">PDF</div>

                      <div>
                        <strong>{resume.file_name}</strong>
                        <small>
                          Uploaded{" "}
                          {new Date(
                            resume.uploaded_at
                          ).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="resume-empty">
                    <strong>No resume uploaded</strong>
                    <small>
                      Upload a PDF resume to enable resume-based
                      opportunity matching.
                    </small>
                  </div>
                )}

                <label className="resume-upload-button">
                  {uploadingResume
                    ? "Processing Resume..."
                    : resume
                    ? "Replace Resume"
                    : "Upload Resume"}

                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={uploadResume}
                    disabled={uploadingResume}
                    hidden
                  />
                </label>

                {resumeMessage && (
                  <p className="skill-success">{resumeMessage}</p>
                )}

                {resumeError && (
                  <p className="profile-status error">{resumeError}</p>
                )}

                {detectedSkills.length > 0 && (
                  <div className="detected-skills">
                    <div className="detected-skills-header">
                      <h4>Skills Detected From Resume</h4>
                      <span>{detectedSkills.length} detected</span>
                    </div>

                    <div className="skills-list">
                      {detectedSkills.map((skill) => (
                        <div
                          className="skill-item"
                          key={skill.skill_id}
                        >
                          <span className="skill-name">
                            {skill.skill_name}
                          </span>

                          <span className="skill-source resume-source">
                            RESUME
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

        {/* Right sidebar */}
        <aside className="profile-side">

          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Account Status</h3>
            </div>

            <div className="status-row">
              <span
                className="status-dot"
                style={{
                  backgroundColor: profile.is_active
                    ? undefined
                    : "#e05252"
                }}
              />

              <div>
                <strong>
                  {profile.is_active
                    ? "Active Account"
                    : "Inactive Account"}
                </strong>

                <small>
                  {profile.is_active
                    ? "Your CampusConnect account is active."
                    : "Your CampusConnect account is inactive."}
                </small>
              </div>
            </div>
          </div>

          <div className="profile-card skills-summary-card">
            <div className="profile-card-header">
              <h3>Skill Summary</h3>
            </div>

            <div className="skill-summary">
              <strong>{skills.length}</strong>
              <span>Total Skill Entries</span>
            </div>

            <div className="skill-summary-row">
              <span>Manual</span>
              <strong>{manualSkillCount}</strong>
            </div>

            <div className="skill-summary-row">
              <span>Resume-derived</span>
              <strong>{resumeSkillCount}</strong>
            </div>
          </div>

        </aside>
      </div>
    </section>
  );
}
