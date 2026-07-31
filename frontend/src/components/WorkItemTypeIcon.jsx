const TYPE_META = {
  Epic: { abbr: "E", color: "#773B93" },
  Feature: { abbr: "F", color: "#009CCC" },
  "User Story": { abbr: "US", color: "#0078D4" },
  Task: { abbr: "T", color: "#F2A93B" },
  Bug: { abbr: "B", color: "#D13438" },
};

export default function WorkItemTypeIcon({ type, size = "md" }) {
  const meta = TYPE_META[type] || { abbr: "?", color: "#605E5C" };
  return (
    <span
      className={`wi-type-icon wi-type-icon--${size}`}
      style={{ backgroundColor: meta.color }}
      title={type}
    >
      {meta.abbr}
    </span>
  );
}
