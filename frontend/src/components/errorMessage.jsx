export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div style={{ color: "#c62828", fontFamily: "sans-serif", margin: "12px 0" }}>
      <p style={{ margin: "0 0 6px" }}>{message}</p>
      {onRetry && <button onClick={onRetry}>Try again</button>}
    </div>
  );
}