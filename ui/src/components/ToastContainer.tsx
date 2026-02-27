import { useToast } from "../hooks/useToast";
import "./ToastContainer.css";

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          {t.message} {t.type === "success" ? "✓" : "✗"}
        </div>
      ))}
    </div>
  );
}
