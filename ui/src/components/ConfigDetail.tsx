import { useEffect } from "react";
import { useConfigs } from "../hooks/useConfigs";
import "./ConfigDetail.css";

type View = { name: "list" } | { name: "create" } | { name: "edit"; key: string } | { name: "detail"; key: string };

interface Props {
  configKey: string;
  onNavigate: (view: View) => void;
}

export function ConfigDetail({ configKey, onNavigate }: Props) {
  const { selectedConfig, loading, loadConfig } = useConfigs();

  useEffect(() => {
    loadConfig(configKey);
  }, [configKey, loadConfig]);

  if (loading) {
    return <p className="loading">Loading…</p>;
  }

  if (!selectedConfig) {
    return <p className="loading">Config not found.</p>;
  }

  const c = selectedConfig;
  const valueDisplay = typeof c.value === "string" ? c.value : JSON.stringify(c.value, null, 2);
  const isObject = typeof c.value !== "string";

  return (
    <article className="config-detail">
      <header>
        <button className="btn-back" onClick={() => onNavigate({ name: "list" })}>← Back</button>
        <h2>{c.key}</h2>
        <button className="btn-edit" onClick={() => onNavigate({ name: "edit", key: c.key })}>Edit</button>
      </header>
      <dl>
        <dt>ID</dt>
        <dd>{c.id}</dd>
        <dt>Key</dt>
        <dd>{c.key}</dd>
        <dt>Value</dt>
        <dd>{isObject ? <pre>{valueDisplay}</pre> : valueDisplay}</dd>
        <dt>Created</dt>
        <dd>{c.createdAt}</dd>
        <dt>Updated</dt>
        <dd>{c.updatedAt}</dd>
      </dl>
    </article>
  );
}
