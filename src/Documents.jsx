import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText, Upload, RefreshCw, CheckCircle2, Clock3, AlertCircle,
  Download, Send, XCircle, ClipboardList, ShieldCheck
} from "lucide-react";
import "./documents.css";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;
const DEPARTMENTS = ["ACADEMICS", "EXAMINATIONS", "HOSTEL"];

function authHeaders() {
  const token = localStorage.getItem("cc_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) }
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) throw new Error(data?.message || "Request failed. Please try again.");
  return data;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function statusLabel(status) {
  return (status || "").replaceAll("_", " ");
}

function StatusPill({ status }) {
  const cls = (status || "pending").toLowerCase();
  return <span className={`doc-status ${cls}`}>{statusLabel(status)}</span>;
}

export default function Documents() {
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("cc_user") || "{}"); }
    catch { return {}; }
  }, []);
  const isStudent = user.role === "STUDENT";
  const [department, setDepartment] = useState("ACADEMICS");
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [file, setFile] = useState(null);
  const [types, setTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTypes = useCallback(async () => {
    if (!isStudent) return;
    const data = await apiRequest(`/documents/types?department=${department}`);
    setTypes(data.documentTypes || []);
    setDocumentTypeId("");
  }, [department, isStudent]);

  const loadRequests = useCallback(async () => {
    const data = await apiRequest(isStudent ? "/documents/mine" : "/documents/inbox");
    setRequests(data.requests || []);
  }, [isStudent]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadRequests(), loadTypes()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadRequests, loadTypes]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openDetails = async (requestId) => {
    setError("");
    try {
      const data = await apiRequest(`/documents/${requestId}`);
      setSelected(data.request);
      setRemarks("");
    } catch (err) { setError(err.message); }
  };

  const submitDocument = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError(""); setNotice("");
    if (!documentTypeId || !purpose.trim() || !file) {
      setError("Select a document type, enter the purpose and attach a PDF.");
      return;
    }
    const form = new FormData();
    form.append("department", department);
    form.append("documentTypeId", documentTypeId);
    form.append("purpose", purpose.trim());
    form.append("document", file);
    setSubmitting(true);
    try {
      await apiRequest("/documents", { method: "POST", body: form });
      setPurpose(""); setFile(null);
      formElement.reset();
      setNotice("Document submitted. You can track its approval below.");
      await loadRequests();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const downloadFile = async (requestId) => {
    setError("");
    try {
      const response = await fetch(`${API_URL}/documents/${requestId}/file`, { headers: authHeaders() });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to download document");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `CampusConnect-document-${requestId}.pdf`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    } catch (err) { setError(err.message); }
  };

  const decide = async (decision) => {
    if (!selected) return;
    if (decision !== "APPROVED" && !remarks.trim()) {
      setError("Please enter remarks when rejecting or requesting a correction.");
      return;
    }
    setSubmitting(true); setError("");
    try {
      await apiRequest(`/documents/${selected.request_id}/decision`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, remarks: remarks.trim() })
      });
      setNotice(decision === "APPROVED" ? "Action recorded successfully." : `Request marked: ${statusLabel(decision)}.`);
      setSelected(null); await loadRequests();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const resubmit = async (requestId, correctedFile) => {
    if (!correctedFile) { setError("Choose the corrected PDF first."); return; }
    const form = new FormData(); form.append("document", correctedFile);
    setSubmitting(true); setError("");
    try {
      await apiRequest(`/documents/${requestId}/resubmit`, { method: "POST", body: form });
      setNotice("Corrected document resubmitted. It has returned to the first authority.");
      await loadRequests(); await openDetails(requestId);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="documents-page">
      <div className="documents-heading">
        <div>
          <span className="documents-eyebrow">CAMPUSCONNECT WORKSPACE</span>
          <h1>{isStudent ? "My Documents" : "Document Approvals"}</h1>
          <p>{isStudent ? "Submit official documents and follow every approval stage." : "Review assigned documents, verify details and record decisions."}</p>
        </div>
        <button className="doc-refresh" onClick={loadAll} type="button"><RefreshCw size={16}/> Refresh</button>
      </div>

      {error && <div className="doc-alert error"><AlertCircle size={17}/>{error}</div>}
      {notice && <div className="doc-alert success"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}

      {isStudent && (
        <section className="doc-panel doc-submit-panel">
          <div className="doc-panel-title"><div className="doc-icon"><Upload size={19}/></div><div><h2>Submit a document</h2><p>PDF only · Maximum file size 10 MB</p></div></div>
          <form className="doc-form" onSubmit={submitDocument}>
            <label>Department<select value={department} onChange={e => setDepartment(e.target.value)}>{DEPARTMENTS.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Document type<select value={documentTypeId} onChange={e => setDocumentTypeId(e.target.value)}><option value="">Select document type</option>{types.map(type => <option key={type.document_type_id} value={type.document_type_id}>{type.document_type_name}</option>)}</select></label>
            <label className="doc-full">Purpose / additional details<textarea rows="3" maxLength="500" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Briefly explain why you are submitting this document..."/></label>
            <label className="doc-full doc-file-field"><span>Attach document (PDF)</span><input type="file" accept="application/pdf,.pdf" onChange={e => setFile(e.target.files?.[0] || null)}/>{file && <small>{file.name}</small>}</label>
            <div className="doc-full doc-form-actions"><button className="doc-primary" type="submit" disabled={submitting}>{submitting ? "Submitting..." : <><Send size={16}/> Submit for approval</>}</button></div>
          </form>
        </section>
      )}

      <section className="doc-panel">
        <div className="doc-panel-title"><div className="doc-icon"><ClipboardList size={19}/></div><div><h2>{isStudent ? "Submission history" : "Assigned to me"}</h2><p>{isStudent ? "Current status and approval progress for your requests." : "Only requests currently awaiting your action are listed."}</p></div><span className="doc-count">{requests.length}</span></div>
        {loading ? <div className="doc-empty">Loading documents...</div> : requests.length === 0 ? <div className="doc-empty"><FileText size={28}/><strong>{isStudent ? "No documents submitted yet" : "No pending approvals"}</strong><span>{isStudent ? "Your submitted requests will appear here." : "New assignments will appear here when a request reaches your stage."}</span></div> : (
          <div className="doc-request-list">
            {requests.map(item => (
              <article className="doc-request-row" key={item.request_id}>
                <div className="doc-request-main"><div className="doc-file-icon"><FileText size={20}/></div><div><strong>{item.document_type_name || `Request #${item.request_id}`}</strong><span>{item.service_department} · Request #{item.request_id}</span><small>{isStudent ? `Submitted ${formatDate(item.created_at)}` : `From ${item.student_name || `Student ${item.student_college_id || ""}`} · ${formatDate(item.created_at)}`}</small></div></div>
                <div className="doc-request-meta">{isStudent && <StatusPill status={item.status}/>}<span>{isStudent ? (item.current_stage ? `At ${item.current_stage.replaceAll("_", " ")}` : "Workflow complete") : `${item.action_type || "ACTION"} · ${item.current_stage?.replaceAll("_", " ") || "Review"}`}</span></div>
                <div className="doc-row-actions"><button type="button" className="doc-secondary" onClick={() => openDetails(item.request_id)}>View details</button>{!isStudent && <button type="button" className="doc-icon-button" title="Download PDF" onClick={() => downloadFile(item.request_id)}><Download size={17}/></button>}</div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="doc-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <section className="doc-modal" role="dialog" aria-modal="true" aria-labelledby="doc-detail-title">
            <div className="doc-modal-head"><div><span className="documents-eyebrow">REQUEST #{selected.request_id}</span><h2 id="doc-detail-title">{selected.document_type_name}</h2></div><button className="doc-icon-button" onClick={() => setSelected(null)} aria-label="Close"><XCircle size={20}/></button></div>
            <div className="doc-detail-summary"><div><small>Department</small><strong>{selected.service_department}</strong></div><div><small>Status</small><StatusPill status={selected.status}/></div><div><small>Submitted</small><strong>{formatDate(selected.created_at)}</strong></div></div>
            <p className="doc-purpose">{selected.purpose}</p>
            <div className="doc-history"><h3><ShieldCheck size={17}/> Approval history</h3>{(selected.approvalHistory || []).map(step => <div className="doc-history-step" key={step.step_id}><div className={`doc-history-dot ${step.status?.toLowerCase()}`}/><div><strong>{step.stage?.replaceAll("_", " ")} <small>· {step.action_type}</small></strong><span>{step.approver_name || "Assigned authority"} · {step.status}</span>{step.remarks && <p>{step.remarks}</p>}{step.acted_at && <small>{formatDate(step.acted_at)}</small>}</div></div>)}</div>
            <div className="doc-modal-actions"><button className="doc-secondary" onClick={() => downloadFile(selected.request_id)} type="button"><Download size={16}/> Download current PDF</button></div>
            {isStudent && selected.status === "CORRECTION_REQUESTED" && <div className="doc-resubmit"><h3>Upload corrected document</h3><input type="file" accept="application/pdf,.pdf" onChange={e => setFile(e.target.files?.[0] || null)}/><button className="doc-primary" disabled={submitting || !file} onClick={() => resubmit(selected.request_id, file)} type="button"><RefreshCw size={16}/> Resubmit document</button></div>}
            {!isStudent && selected.status === "PENDING_APPROVAL" && <div className="doc-decision"><h3>Record your decision</h3><textarea rows="3" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Remarks (required for correction or rejection)"/><div><button className="doc-primary" disabled={submitting} onClick={() => decide("APPROVED")}><CheckCircle2 size={16}/> {selected.approvalHistory?.find(s => s.status === "PENDING")?.action_type === "VERIFY" ? "Verify & forward" : "Approve & forward"}</button><button className="doc-warning" disabled={submitting} onClick={() => decide("CORRECTION_REQUESTED")}>Request correction</button><button className="doc-danger" disabled={submitting} onClick={() => decide("REJECTED")}><XCircle size={16}/> Reject</button></div></div>}
          </section>
        </div>
      )}
    </div>
  );
}
