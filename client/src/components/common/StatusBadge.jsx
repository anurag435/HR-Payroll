const CLASS_BY_STATUS = {
  active: "badge-active",
  pending: "badge-pending",
  inactive: "badge-inactive",
};

const LABEL_BY_STATUS = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
};

export default function StatusBadge({ status }) {
  const className = CLASS_BY_STATUS[status] ?? "badge-inactive";
  const label = LABEL_BY_STATUS[status] ?? status;
  return <span className={className}>{label}</span>;
}