import { useEffect, useState } from "react";
import {
  Search,
  Users,
  GraduationCap,
  UserRoundCog,
  Building2,
  ShieldCheck
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const token = localStorage.getItem("cc_token");

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (role) {
        params.append("role", role);
      }

      const query = params.toString();

      const response = await fetch(
        `${API_URL}/admin/users${query ? `?${query}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load users"
        );
      }

      setUsers(data.users);
    } catch (error) {
      console.error("Admin users error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchUsers();
  };

  const getRoleIcon = (roleName) => {
    if (roleName === "STUDENT") {
      return <GraduationCap size={15} />;
    }

    if (roleName === "FACULTY") {
      return <UserRoundCog size={15} />;
    }

    if (roleName === "CLUB") {
      return <Building2 size={15} />;
    }

    if (roleName === "ADMIN") {
      return <ShieldCheck size={15} />;
    }

    return <Users size={15} />;
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">
            USER MANAGEMENT
          </span>

          <h1>Users</h1>

          <p>
            View and manage registered CampusConnect users.
          </p>
        </div>
      </div>

      <div className="admin-users-toolbar">
        <form
          className="admin-search"
          onSubmit={handleSearch}
        >
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, email or college ID..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <button type="submit">
            Search
          </button>
        </form>

        <select
          className="admin-role-filter"
          value={role}
          onChange={(event) =>
            setRole(event.target.value)
          }
        >
          <option value="">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="FACULTY">Faculty</option>
          <option value="HOD">HODs</option>
          <option value="CLUB">Clubs</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="admin-users-card">
        <div className="admin-table-header">
          <div>
            <strong>Registered Users</strong>
            <span>{users.length} users</span>
          </div>
        </div>

        {loading ? (
          <div className="admin-table-state">
            Loading users...
          </div>
        ) : error ? (
          <div className="admin-table-state admin-error">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="admin-table-state">
            No users found.
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>College ID</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {user.full_name
                            ?.trim()
                            .split(/\s+/)
                            .map((part) => part[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{user.full_name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{user.college_id}</td>

                    <td>{user.department || "—"}</td>

                    <td>{user.year || "—"}</td>

                    <td>{user.section || "—"}</td>

                    <td>
                      <span className="admin-role-badge">
                        {getRoleIcon(user.role_name)}
                        {user.role_name}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          user.is_active
                            ? "admin-status active"
                            : "admin-status inactive"
                        }
                      >
                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}