import "./statusBlock.css";

export default function StatusBlock({
  title,
  message,
  tone = "neutral",
  icon = "i",
  action,
}) {
  return (
    <div className={`statusBlock ${tone}`} role={tone === "error" ? "alert" : "status"}>
      <div className="statusIcon" aria-hidden="true">
        {icon}
      </div>
      <div className="statusContent">
        {title && <strong>{title}</strong>}
        {message && <p>{message}</p>}
        {action && <div className="statusAction">{action}</div>}
      </div>
    </div>
  );
}
