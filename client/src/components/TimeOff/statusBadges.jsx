export function TimeOffStatusBadge({ status }) {
  if (status === "approved") return <span className="badge-active">Approved</span>;
  if (status === "to_approve") return <span className="badge-pending">To Approve</span>;
  if (status === "refused") return <span className="badge-inactive">Refused</span>;
  return <span className="badge-inactive">{status}</span>;
}