import { useEffect, useState } from "react";
import {
  Search,
  Users,
  GraduationCap,
  UserRoundCog,
  Building2,
  ShieldCheck,
  Plus,
  X,
  Copy,
  Check
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const emptyForm = {
  collegeId: "",
  fullName: "",
  email: "",
  department: "",
  roleName: "STUDENT",
  year: "",
  section: "",
  isDocumentAuthority: false,
  serviceDepartment: "ACADEMICS",
  authorityType: "CAO"
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureUploadUserId, setSignatureUploadUserId] = useState(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem("cc_token");

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (role) params.append("role", role);

      const query = params.toString();
      const response = await fetch(
        `${API_URL}/admin/users${query ? `?${query}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load users");
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error("Admin users error:", error);
      setError(error.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const token = localStorage.getItem("cc_token");
    try {
      setRolesLoading(true);
      const response = await fetch(`${API_URL}/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load roles");
      }
      setRoles(data.roles || []);
    } catch (error) {
      console.error("Admin roles error:", error);
      setCreateError(error.message || "Unable to load roles");
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const openCreateForm = () => {
    setForm(emptyForm);
    setSignatureFile(null);
    setCreateError("");
    setCreatedCredentials(null);
    setShowCreateForm(true);
    fetchRoles();
  };

  const closeCreateForm = () => {
    if (creating) return;
    setShowCreateForm(false);
    setCreateError("");
    setCreatedCredentials(null);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchUsers();
  };

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "roleName" && value === "STUDENT"
        ? { isDocumentAuthority: false }
        : name === "roleName" && value === "HOD"
          ? { authorityType: "HOD" }
          : name === "roleName" && value === "FACULTY"
            ? { authorityType: "CAO" }
            : {})
    }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreateError("");

    const token = localStorage.getItem("cc_token");
    const payload = new FormData();
    payload.append("collegeId", form.collegeId.trim());
    payload.append("fullName", form.fullName.trim());
    payload.append("email", form.email.trim());
    payload.append("department", form.department.trim());
    payload.append("roleName", form.roleName);

    if (form.roleName === "STUDENT") {
      payload.append("year", String(Number(form.year)));
      payload.append("section", form.section.trim());
    }

    if (form.isDocumentAuthority) {
      payload.append("isDocumentAuthority", "true");
      payload.append("serviceDepartment", form.serviceDepartment);
      payload.append("authorityType", form.authorityType);
      payload.append("academicDepartment", form.department.trim());
      if (signatureFile) payload.append("signature", signatureFile);
    } else {
      payload.append("isDocumentAuthority", "false");
    }

    try {
      setCreating(true);
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: payload
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to create user");
      }

      setCreatedCredentials({
        user: data.user,
        temporaryPassword: data.temporaryPassword
      });
      setForm(emptyForm);
      setSignatureFile(null);
      await fetchUsers();
    } catch (error) {
      console.error("Create user error:", error);
      setCreateError(error.message || "Unable to create user");
    } finally {
      setCreating(false);
    }
  };

  const uploadExistingSignature = async (userId, file) => {
    if (!file) return;
    const token = localStorage.getItem("cc_token");
    const payload = new FormData();
    payload.append("signature", file);
    try {
      setSignatureUploadUserId(userId);
      const response = await fetch(`${API_URL}/admin/users/${userId}/signature`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to upload signature");
      await fetchUsers();
    } catch (error) {
      setError(error.message || "Unable to upload signature");
    } finally {
      setSignatureUploadUserId(null);
    }
  };

  const copyTemporaryPassword = async () => {
    if (!createdCredentials?.temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(createdCredentials.temporaryPassword);
      setCopied(true);
    } catch (error) {
      console.error("Unable to copy temporary password:", error);
      setCreateError("Could not copy automatically. Please select and copy the password.");
    }
  };

  const getRoleIcon = (roleName) => {
    if (roleName === "STUDENT") return <GraduationCap size={15} />;
    if (roleName === "FACULTY") return <UserRoundCog size={15} />;
    if (roleName === "CLUB") return <Building2 size={15} />;
    if (roleName === "ADMIN") return <ShieldCheck size={15} />;
    return <Users size={15} />;
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">USER MANAGEMENT</span>
          <h1>Users</h1>
          <p>View and manage registered CampusConnect users.</p>
        </div>
        <button type="button" className="admin-create-user-button" onClick={openCreateForm}>
          <Plus size={17} /> Create User
        </button>
      </div>

      <div className="admin-users-toolbar">
        <form className="admin-search" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email or college ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <select
          className="admin-role-filter"
          value={role}
          onChange={(event) => setRole(event.target.value)}
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
          <div><strong>Registered Users</strong><span>{users.length} users</span></div>
        </div>

        {loading ? (
          <div className="admin-table-state">Loading users...</div>
        ) : error ? (
          <div className="admin-table-state admin-error">{error}</div>
        ) : users.length === 0 ? (
          <div className="admin-table-state">No users found.</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th><th>College ID</th><th>Department</th>
                  <th>Year</th><th>Section</th><th>Role</th><th>Signature</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {user.full_name?.trim().split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div><strong>{user.full_name}</strong><span>{user.email}</span></div>
                      </div>
                    </td>
                    <td>{user.college_id}</td>
                    <td>{user.department || "—"}</td>
                    <td>{user.year || "—"}</td>
                    <td>{user.section || "—"}</td>
                    <td><span className="admin-role-badge">{getRoleIcon(user.role_name)}{user.role_name}</span></td>
                    <td>
                      {user.is_document_authority ? (
                        <label className="admin-signature-upload">
                          <span>{user.has_signature ? "Replace signature" : "Upload signature"}</span>
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                            disabled={signatureUploadUserId === user.user_id}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) uploadExistingSignature(user.user_id, file);
                              event.target.value = "";
                            }}
                          />
                        </label>
                      ) : "—"}
                    </td>
                    <td>
                      <span className={user.is_active ? "admin-status active" : "admin-status inactive"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="admin-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeCreateForm();
        }}>
          <section className="admin-create-user-modal" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">USER MANAGEMENT</span>
                <h2 id="create-user-title">Create User</h2>
                <p>Create a CampusConnect account and generate a temporary password.</p>
              </div>
              <button type="button" className="admin-modal-close" onClick={closeCreateForm} aria-label="Close">
                <X size={19} />
              </button>
            </div>

            {createdCredentials ? (
              <div className="admin-created-success">
                <div className="admin-success-icon"><Check size={22} /></div>
                <h3>User created successfully</h3>
                <p>{createdCredentials.user?.full_name || "The new user"} can now sign in using their College ID and this temporary password.</p>
                <label>Temporary password</label>
                <div className="admin-temp-password-row">
                  <code>{createdCredentials.temporaryPassword}</code>
                  <button type="button" onClick={copyTemporaryPassword}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="admin-form-note">This password is shown only once. Share it securely. The user should change it after their first login.</p>
                <div className="admin-modal-actions">
                  <button type="button" className="admin-submit-button" onClick={() => {
                    setCreatedCredentials(null);
                    setCopied(false);
                    setShowCreateForm(false);
                  }}>Done</button>
                </div>
              </div>
            ) : (
              <form className="admin-create-user-form" onSubmit={handleCreateUser}>
                {createError && <div className="admin-create-user-error">{createError}</div>}
                {rolesLoading ? (
                  <div className="admin-table-state">Loading roles...</div>
                ) : (
                  <>
                    <div className="admin-create-user-grid">
                      <div className="admin-create-field">
                        <label htmlFor="create-college-id">College ID</label>
                        <input id="create-college-id" name="collegeId" value={form.collegeId} onChange={updateForm} required inputMode="numeric" maxLength={19} placeholder="Enter college ID" />
                      </div>
                      <div className="admin-create-field">
                        <label htmlFor="create-full-name">Full name</label>
                        <input id="create-full-name" name="fullName" value={form.fullName} onChange={updateForm} required maxLength={100} placeholder="Enter full name" />
                      </div>
                      <div className="admin-create-field">
                        <label htmlFor="create-email">Email address</label>
                        <input id="create-email" type="email" name="email" value={form.email} onChange={updateForm} required maxLength={100} placeholder="name@college.edu" />
                      </div>
                      <div className="admin-create-field">
                        <label htmlFor="create-department">Department</label>
                        <input id="create-department" name="department" value={form.department} onChange={updateForm} required maxLength={100} placeholder="e.g. CSE" />
                      </div>
                      <div className="admin-create-field">
                        <label htmlFor="create-role">Account role</label>
                        <select id="create-role" name="roleName" value={form.roleName} onChange={updateForm} required>
                          {roles.map((item) => <option key={item.role_id} value={item.role_name}>{item.role_name}</option>)}
                        </select>
                      </div>
                      {form.roleName === "STUDENT" && (
                        <>
                          <div className="admin-create-field">
                            <label htmlFor="create-year">Academic year</label>
                            <input id="create-year" type="number" name="year" value={form.year} onChange={updateForm} required min="1" max="10" placeholder="e.g. 2" />
                          </div>
                          <div className="admin-create-field">
                            <label htmlFor="create-section">Section</label>
                            <input id="create-section" name="section" value={form.section} onChange={updateForm} required maxLength={10} placeholder="e.g. A" />
                          </div>
                        </>
                      )}
                    </div>

                    {(form.roleName === "FACULTY" || form.roleName === "HOD") && (
                      <div className="admin-authority-setup">
                        <label className="admin-authority-toggle">
                          <input
                            type="checkbox"
                            checked={form.isDocumentAuthority}
                            name="isDocumentAuthority"
                            onChange={updateForm}
                          />
                          <span>
                            <strong>Set up as a document authority</strong>
                            <small>Assign this account to an approval workflow and upload its scanned signature.</small>
                          </span>
                        </label>

                        {form.isDocumentAuthority && (
                          <div className="admin-create-user-grid">
                            <div className="admin-create-field">
                              <label htmlFor="authority-service-department">Service department</label>
                              <select id="authority-service-department" name="serviceDepartment" value={form.serviceDepartment} onChange={updateForm} required>
                                <option value="ACADEMICS">Academics</option>
                                <option value="EXAMINATIONS">Examinations</option>
                                <option value="HOSTEL">Hostel</option>
                              </select>
                            </div>
                            <div className="admin-create-field">
                              <label htmlFor="authority-type">Authority type</label>
                              <select id="authority-type" name="authorityType" value={form.authorityType} onChange={updateForm} required>
                                {form.roleName === "HOD" ? (
                                  <option value="HOD">HOD</option>
                                ) : (
                                  <>
                                    <option value="CAO">CAO</option>
                                    <option value="REGISTRAR">Registrar</option>
                                    <option value="CHIEF_HOSTEL_WARDEN">Chief Hostel Warden</option>
                                  </>
                                )}
                              </select>
                            </div>
                            <div className="admin-create-field admin-signature-field">
                              <label htmlFor="authority-signature">Scanned signature (PNG/JPG)</label>
                              <input
                                id="authority-signature"
                                type="file"
                                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                onChange={(event) => setSignatureFile(event.target.files?.[0] || null)}
                                required={form.isDocumentAuthority}
                              />
                              <small>{signatureFile ? signatureFile.name : "Transparent PNG recommended; maximum 2 MB."}</small>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="admin-form-note">A random temporary password will be generated automatically. Non-student accounts do not require year or section.</p>
                    <div className="admin-modal-actions">
                      <button type="button" className="admin-cancel-button" onClick={closeCreateForm} disabled={creating}>Cancel</button>
                      <button type="submit" className="admin-submit-button" disabled={creating || roles.length === 0}>
                        {creating ? "Creating..." : "Create Account"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
