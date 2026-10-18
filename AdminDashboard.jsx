import {
  Users,
  GraduationCap,
  BriefcaseBusiness,
  BadgeCheck,
  UserRoundCog,
  Building2
} from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("cc_token");

      try {
        const response = await fetch(
          `${API_URL}/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load dashboard"
          );
        }

        setStats(data.stats);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <section className="admin-page">
        <div className="admin-page-header">
          <div>
            <span className="admin-eyebrow">
              ADMINISTRATION
            </span>
            <h1>Dashboard</h1>
            <p>Loading platform statistics...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-page">
        <div className="admin-page-header">
          <div>
            <span className="admin-eyebrow">
              ADMINISTRATION
            </span>
            <h1>Dashboard</h1>
            <p className="admin-error">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered platform users",
      icon: Users
    },
    {
      title: "Students",
      value: stats.totalStudents,
      description: "Student accounts",
      icon: GraduationCap
    },
    {
      title: "Faculty",
      value: stats.totalFaculty,
      description: "Faculty accounts",
      icon: UserRoundCog
    },
    {
      title: "Clubs",
      value: stats.totalClubs,
      description: "Registered club accounts",
      icon: Building2
    },
    {
      title: "Opportunities",
      value: stats.totalOpportunities,
      description: "Total opportunities",
      icon: BriefcaseBusiness
    },
    {
      title: "Verified Opportunities",
      value: stats.verifiedOpportunities,
      description: "Currently verified",
      icon: BadgeCheck
    }
  ];

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">
            ADMINISTRATION
          </span>

          <h1>Dashboard</h1>

          <p>
            Monitor and manage the CampusConnect platform.
          </p>
        </div>
      </div>

      <div className="admin-stat-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="admin-stat-card" key={card.title}>
              <div className="admin-stat-top">
                <span className="admin-stat-icon">
                  <Icon size={20} />
                </span>
              </div>

              <div className="admin-stat-value">
                {card.value}
              </div>

              <h3>{card.title}</h3>

              <p>{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="admin-dashboard-section">
        <div>
          <span className="admin-eyebrow">
            PLATFORM OVERVIEW
          </span>

          <h2>CampusConnect Administration</h2>

          <p>
            Use the administration panel to manage users,
            notices and platform opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}