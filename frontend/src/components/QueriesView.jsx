import { useState } from "react";
import { STATUSES, ITERATIONS, TEAM_MEMBERS } from "../constants";

export default function QueriesView({ onRunQuery, onNew }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [assignee, setAssignee] = useState("");
  const [iteration, setIteration] = useState("");
  const [tag, setTag] = useState("");

  function run() {
    onRunQuery({
      search: search || undefined,
      type: type || undefined,
      status: status || undefined,
      assignee: assignee || undefined,
      iteration: iteration || undefined,
      tag: tag || undefined,
    });
  }

  const presets = [
    { label: "Assigned to me", filters: { assignee: "You" } },
    { label: "Active", filters: { status: "Active" } },
    { label: "Sprint 1", filters: { iteration: "Sprint 1" } },
    { label: "Bugs", filters: { type: "Bug" } },
  ];

  return (
    <div className="panel">
      <div className="panel-inner">
        <div className="panel-header">
          <div>
            <h1>Queries</h1>
            <p className="panel-subtitle">Filter work items</p>
          </div>
          <button type="button" className="btn-primary" onClick={onNew}>New work item</button>
        </div>

        <div className="ado-presets">
          {presets.map((p) => (
            <button key={p.label} type="button" className="ado-preset-btn" onClick={() => onRunQuery(p.filters)}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="ado-query-builder">
          <label className="filter-field grow">
            <span>Keywords</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title, description, tags" />
          </label>
          <label className="filter-field">
            <span>Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Any</option>
              {["Epic", "Feature", "User Story", "Task", "Bug"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>State</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Assigned to</span>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">Anyone</option>
              {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Iteration</span>
            <select value={iteration} onChange={(e) => setIteration(e.target.value)}>
              <option value="">Any</option>
              {ITERATIONS.map((it) => <option key={it} value={it}>{it}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Tag</span>
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="tag name" />
          </label>
          <button type="button" className="btn-primary" onClick={run}>Run query</button>
        </div>
      </div>
    </div>
  );
}
