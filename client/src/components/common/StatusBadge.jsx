const TONE_BY_STATUS = {
  active: "active", present: "active", approved: "active",
  validated: "active", paid: "active", computed: "active",

  pending: "pending", "to approve": "pending", draft: "pending",
  processing: "pending", late: "pending", "half day": "pending",

  refused: "danger", cancelled: "danger", expired: "danger", absent: "danger",

  inactive: "inactive", archived: "inactive",
};

const CLASS_BY_TONE = {
  active: "badge-active",
  pending: "badge-pending",
  danger: "badge-danger",
  inactive: "badge-inactive",
};

export default function StatusBadge({ status }) {
  const key = (status ?? "").toString().trim().toLowerCase();
  const className = CLASS_BY_TONE[TONE_BY_STATUS[key] ?? "inactive"];
  return <span className={className}>{status ?? "Unknown"}</span>;
}