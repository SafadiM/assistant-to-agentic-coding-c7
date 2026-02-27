import { useEffect, useState } from "react";
import { useConfigs } from "../hooks/useConfigs";
import { useToast } from "../hooks/useToast";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Config } from "../types/config";
import "./ConfigList.css";

type View = { name: "list" } | { name: "create" } | { name: "edit"; key: string } | { name: "detail"; key: string };

interface Props {
  onNavigate: (view: View) => void;
}

export function ConfigList({ onNavigate }: Props) {
  const { configs, loading, loadConfigs, deleteConfig } = useConfigs();
  const { showToast } = useToast();
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleDelete = async (key: string) => {
    try {
      await deleteConfig(key);
      showToast("Config deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
    setConfirmKey(null);
  };

  const formatValue = (value: unknown) =>
    typeof value === "string" ? value : JSON.stringify(value);

  let body: React.ReactNode;
  if (loading && configs.length === 0) {
    body = <p className="loading">Loading…</p>;
  } else if (configs.length === 0) {
    body = <p className="empty">No configurations found.</p>;
  } else {
    body = (
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((c: Config) => (
            <tr key={c.id}>
              <td>{c.key}</td>
              <td className="value-cell">{formatValue(c.value)}</td>
              <td>{new Date(c.updatedAt).toLocaleDateString()}</td>
              <td className="actions">
                <button className="btn-view" onClick={() => onNavigate({ name: "detail", key: c.key })}>View</button>
                <button className="btn-edit" onClick={() => onNavigate({ name: "edit", key: c.key })}>Edit</button>
                <button className="btn-delete" onClick={() => setConfirmKey(c.key)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <section className="config-list">
      <div className="toolbar">
        <h2>Configurations</h2>
        <button className="btn-primary" onClick={() => onNavigate({ name: "create" })}>+ New Config</button>
      </div>
      {body}
      {confirmKey && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${confirmKey}"?`}
          onConfirm={() => handleDelete(confirmKey)}
          onCancel={() => setConfirmKey(null)}
        />
      )}
    </section>
  );
}
