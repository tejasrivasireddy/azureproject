export const TYPE_COLORS = {
  Epic: "#773B93",
  Feature: "#009CCC",
  "User Story": "#0078D4",
  Task: "#F2A93B",
  Bug: "#D13438",
};

export const STATUS_STYLES = {
  New: { color: "#605E5C", background: "#F3F2F1" },
  Active: { color: "#0078D4", background: "#DEECF9" },
  Resolved: { color: "#107C10", background: "#DFF6DD" },
  Closed: { color: "#605E5C", background: "#E1DFDD" },
};

export const STATUSES = ["New", "Active", "Resolved", "Closed"];

export const PRIORITY_LABELS = {
  1: "Critical",
  2: "High",
  3: "Medium",
  4: "Low",
};

export const PRIORITY_STYLES = {
  1: { color: "#A4262C", background: "#FDE7E9" },
  2: { color: "#8A6116", background: "#FFF4CE" },
  3: { color: "#0078D4", background: "#DEECF9" },
  4: { color: "#605E5C", background: "#F3F2F1" },
};

export const ITERATIONS = ["Backlog", "Sprint 1", "Sprint 2", "Sprint 3"];
export const TEAM_MEMBERS = ["Unassigned", "You", "Alice", "Bob", "Carol"];
export const CURRENT_USER = "You";

export const ALLOWED_CHILDREN = {
  none: ["Epic", "Feature", "User Story", "Task", "Bug"],
  Epic: ["Feature", "User Story", "Task", "Bug"],
  Feature: ["User Story", "Task", "Bug"],
  "User Story": ["Task", "Bug"],
  Task: [],
  Bug: [],
};

export function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function parseTags(tags) {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}
