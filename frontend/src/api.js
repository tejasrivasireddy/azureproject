const BASE_URL = "http://localhost:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg).join(", ")
          : `Request failed: ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      q.set(key, value);
    }
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const api = {
  listWorkItems: (filters = {}) =>
    request(`/work-items${buildQuery(filters)}`),
  getWorkItem: (id) => request(`/work-items/${id}`),
  createWorkItem: (data) =>
    request("/work-items", { method: "POST", body: JSON.stringify(data) }),
  updateWorkItem: (id, data) =>
    request(`/work-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteWorkItem: (id) => request(`/work-items/${id}`, { method: "DELETE" }),
  addComment: (id, text, author = "You") =>
    request(`/work-items/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ text, author }),
    }),
  getMeta: () => request("/meta"),
};
