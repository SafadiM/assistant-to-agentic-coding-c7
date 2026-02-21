import { store } from "../state/config-store.js";

const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: block;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
  }

  h2 {
    margin: 0 0 var(--spacing-lg);
    font-size: var(--font-size-xl);
    color: var(--color-text);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  label {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  input, textarea {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-base);
    font-family: var(--font-family);
    color: var(--color-text);
    background: var(--color-surface);
    transition: border-color 0.15s;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  input[readonly] {
    background: var(--color-bg);
    color: var(--color-text-secondary);
    cursor: not-allowed;
  }

  textarea {
    resize: vertical;
    font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace;
    font-size: var(--font-size-sm);
  }

  .error {
    color: var(--color-danger);
    font-size: var(--font-size-sm);
    min-height: 1.25em;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding-top: var(--spacing-sm);
  }

  button {
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--color-border);
    font-family: var(--font-family);
    transition: background-color 0.15s;
  }

  .btn-cancel {
    background: var(--color-surface);
    color: var(--color-text);
  }

  .btn-cancel:hover {
    background: var(--color-hover-row);
  }

  .btn-primary {
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border-color: var(--color-primary);
  }

  .btn-primary:hover {
    background: var(--color-primary-hover);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`);

export class ConfigForm extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styles];
  }

  connectedCallback() {
    this.render();
    if (this.mode === "edit" && this.configKey) {
      this.loadExisting();
    }
  }

  get mode(): "create" | "edit" {
    return (this.getAttribute("mode") as "create" | "edit") || "create";
  }

  get configKey(): string {
    return this.getAttribute("config-key") || "";
  }

  private async loadExisting() {
    await store.loadConfig(this.configKey);
    const { selectedConfig } = store.getState();
    if (!selectedConfig) return;

    const keyInput = this.shadow.querySelector<HTMLInputElement>('input[name="key"]');
    const valueInput = this.shadow.querySelector<HTMLTextAreaElement>('textarea[name="value"]');

    if (keyInput) keyInput.value = selectedConfig.key;
    if (valueInput) {
      valueInput.value =
        typeof selectedConfig.value === "string"
          ? selectedConfig.value
          : JSON.stringify(selectedConfig.value, null, 2);
    }
  }

  private render() {
    const isEdit = this.mode === "edit";

    this.shadow.innerHTML = `
      <form novalidate>
        <h2>${isEdit ? "Edit Config" : "Create Config"}</h2>
        <label>
          Key
          <input type="text" name="key" required ${isEdit ? "readonly" : ""} />
          <span class="error" id="key-error"></span>
        </label>
        <label>
          Value
          <textarea name="value" rows="6" required></textarea>
          <span class="error" id="value-error"></span>
        </label>
        <div class="form-actions">
          <button type="button" class="btn-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Save</button>
        </div>
      </form>
    `;

    this.shadow.querySelector(".btn-cancel")!.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("navigate", {
          bubbles: true,
          composed: true,
          detail: { view: "list" },
        })
      );
    });

    this.shadow.querySelector("form")!.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  private async handleSubmit() {
    const keyInput = this.shadow.querySelector<HTMLInputElement>('input[name="key"]')!;
    const valueInput = this.shadow.querySelector<HTMLTextAreaElement>('textarea[name="value"]')!;
    const keyError = this.shadow.querySelector<HTMLSpanElement>("#key-error")!;
    const valueError = this.shadow.querySelector<HTMLSpanElement>("#value-error")!;
    const submitBtn = this.shadow.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    keyError.textContent = "";
    valueError.textContent = "";

    const key = keyInput.value.trim();
    const rawValue = valueInput.value.trim();

    let valid = true;

    if (!key && this.mode === "create") {
      keyError.textContent = "Key is required";
      valid = false;
    } else if (key.includes(" ") && this.mode === "create") {
      keyError.textContent = "Key must not contain spaces";
      valid = false;
    }

    if (!rawValue) {
      valueError.textContent = "Value is required";
      valid = false;
    }

    let parsedValue: unknown = rawValue;
    if (rawValue.startsWith("{") || rawValue.startsWith("[")) {
      try {
        parsedValue = JSON.parse(rawValue);
      } catch {
        valueError.textContent = "Invalid JSON";
        valid = false;
      }
    }

    if (!valid) return;

    submitBtn.disabled = true;
    try {
      if (this.mode === "edit") {
        await store.updateConfig(this.configKey, { value: parsedValue });
        document.dispatchEvent(
          new CustomEvent("toast", { detail: { message: "Config updated", type: "success" } })
        );
      } else {
        await store.createConfig({ key, value: parsedValue });
        document.dispatchEvent(
          new CustomEvent("toast", { detail: { message: "Config created", type: "success" } })
        );
      }
      this.dispatchEvent(
        new CustomEvent("navigate", {
          bubbles: true,
          composed: true,
          detail: { view: "list" },
        })
      );
    } catch (err) {
      document.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: err instanceof Error ? err.message : "Save failed", type: "error" },
        })
      );
    } finally {
      submitBtn.disabled = false;
    }
  }
}
