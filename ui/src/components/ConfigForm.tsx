import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useConfigs } from "../hooks/useConfigs";
import { useToast } from "../hooks/useToast";
import "./ConfigForm.css";

type View = { name: "list" } | { name: "create" } | { name: "edit"; key: string } | { name: "detail"; key: string };

interface Props {
  mode: "create" | "edit";
  configKey?: string;
  onNavigate: (view: View) => void;
}

export function ConfigForm({ mode, configKey, onNavigate }: Props) {
  const { selectedConfig, loadConfig, createConfig, updateConfig } = useConfigs();
  const { showToast } = useToast();

  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [keyError, setKeyError] = useState("");
  const [valueError, setValueError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && configKey) {
      loadConfig(configKey);
    }
  }, [mode, configKey, loadConfig]);

  useEffect(() => {
    if (mode === "edit" && selectedConfig) {
      setKey(selectedConfig.key);
      setValue(
        typeof selectedConfig.value === "string"
          ? selectedConfig.value
          : JSON.stringify(selectedConfig.value, null, 2)
      );
    }
  }, [mode, selectedConfig]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setKeyError("");
    setValueError("");

    const trimmedKey = key.trim();
    const trimmedValue = value.trim();
    let valid = true;

    if (!trimmedKey && mode === "create") {
      setKeyError("Key is required");
      valid = false;
    } else if (trimmedKey.includes(" ") && mode === "create") {
      setKeyError("Key must not contain spaces");
      valid = false;
    }

    if (!trimmedValue) {
      setValueError("Value is required");
      valid = false;
    }

    let parsedValue: unknown = trimmedValue;
    if (trimmedValue.startsWith("{") || trimmedValue.startsWith("[")) {
      try {
        parsedValue = JSON.parse(trimmedValue);
      } catch {
        setValueError("Invalid JSON");
        valid = false;
      }
    }

    if (!valid) return;

    setSubmitting(true);
    try {
      if (mode === "edit" && configKey) {
        await updateConfig(configKey, { value: parsedValue });
        showToast("Config updated", "success");
      } else {
        await createConfig({ key: trimmedKey, value: parsedValue });
        showToast("Config created", "success");
      }
      onNavigate({ name: "list" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="config-form">
      <form noValidate onSubmit={handleSubmit}>
        <h2>{mode === "edit" ? "Edit Config" : "Create Config"}</h2>
        <label>
          Key
          <input
            type="text"
            name="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            readOnly={mode === "edit"}
          />
          <span className="error">{keyError}</span>
        </label>
        <label>
          Value
          <textarea
            name="value"
            rows={6}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <span className="error">{valueError}</span>
        </label>
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => onNavigate({ name: "list" })}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
