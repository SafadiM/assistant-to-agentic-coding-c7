import { useState } from "react";
import { ToastProvider } from "./hooks/useToast";
import { ConfigList } from "./components/ConfigList";
import { ConfigDetail } from "./components/ConfigDetail";
import { ConfigForm } from "./components/ConfigForm";
import { ToastContainer } from "./components/ToastContainer";
import "./App.css";

type View = { name: "list" } | { name: "create" } | { name: "edit"; key: string } | { name: "detail"; key: string };

export function App() {
  const [view, setView] = useState<View>({ name: "list" });

  const navigate = (next: View) => setView(next);

  return (
    <ToastProvider>
      <header className="app-header">
        <h1>Config Admin</h1>
      </header>
      <main className="app-main">
        {view.name === "list" && <ConfigList onNavigate={navigate} />}
        {view.name === "create" && <ConfigForm mode="create" onNavigate={navigate} />}
        {view.name === "edit" && <ConfigForm mode="edit" configKey={view.key} onNavigate={navigate} />}
        {view.name === "detail" && <ConfigDetail configKey={view.key} onNavigate={navigate} />}
      </main>
      <ToastContainer />
    </ToastProvider>
  );
}
