import { store } from "../state/config-store.js";
import type { Config } from "../types/config.js";

const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: block;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  h2 {
    margin: 0;
    font-size: var(--font-size-xl);
    color: var(--color-text);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 2px solid var(--color-border);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    font-size: var(--font-size-sm);
    vertical-align: middle;
  }

  tr:hover td {
    background: var(--color-hover-row);
  }

  .value-cell {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace;
    font-size: var(--font-size-sm);
  }

  .actions {
    display: flex;
    gap: var(--spacing-xs);
    white-space: nowrap;
  }

  button {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--font-family);
    transition: background-color 0.15s;
  }

  button:hover {
    background: var(--color-hover-row);
  }

  .btn-primary {
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border-color: var(--color-primary);
    padding: var(--spacing-sm) var(--spacing-lg);
  }

  .btn-primary:hover {
    background: var(--color-primary-hover);
  }

  .btn-delete:hover {
    background: var(--color-danger);
    color: var(--color-text-inverse);
    border-color: var(--color-danger);
  }

  .loading, .empty {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-text-secondary);
  }
`);

export class ConfigList extends HTMLElement {
  private shadow: ShadowRoot;
  private handleStateChange = () => this.renderContent();

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styles];
  }

  connectedCallback() {
    store.addEventListener("state-change", this.handleStateChange);
    store.loadConfigs();
    this.renderContent();
  }

  disconnectedCallback() {
    store.removeEventListener("state-change", this.handleStateChange);
  }

  private renderContent() {
    const { configs, loading } = store.getState();

    let body: string;
    if (loading && configs.length === 0) {
      body = `<p class="loading">Loading…</p>`;
    } else if (configs.length === 0) {
      body = `<p class="empty">No configurations found.</p>`;
    } else {
      body = `
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
            ${configs.map((c) => this.renderRow(c)).join("")}
          </tbody>
        </table>
      `;
    }

    this.shadow.innerHTML = `
      <section>
        <div class="toolbar">
          <h2>Configurations</h2>
          <button class="btn-primary" id="btn-new">+ New Config</button>
        </div>
        ${body}
      </section>
      <confirm-dialog></confirm-dialog>
    `;

    this.shadow.querySelector("#btn-new")!.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("navigate", {
          bubbles: true,
          composed: true,
          detail: { view: "create" },
        })
      );
    });

    this.shadow.querySelectorAll(".btn-view").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("navigate", {
            bubbles: true,
            composed: true,
            detail: { view: "detail", key: (btn as HTMLElement).dataset.key },
          })
        );
      });
    });

    this.shadow.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("navigate", {
            bubbles: true,
            composed: true,
            detail: { view: "edit", key: (btn as HTMLElement).dataset.key },
          })
        );
      });
    });

    this.shadow.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => this.handleDelete((btn as HTMLElement).dataset.key!));
    });
  }

  private renderRow(c: Config): string {
    const valueStr =
      typeof c.value === "string" ? c.value : JSON.stringify(c.value);
    const updatedDate = new Date(c.updatedAt).toLocaleDateString();

    return `
      <tr>
        <td>${this.escapeHtml(c.key)}</td>
        <td class="value-cell">${this.escapeHtml(valueStr)}</td>
        <td>${updatedDate}</td>
        <td class="actions">
          <button class="btn-view" data-key="${this.escapeAttr(c.key)}">View</button>
          <button class="btn-edit" data-key="${this.escapeAttr(c.key)}">Edit</button>
          <button class="btn-delete" data-key="${this.escapeAttr(c.key)}">Delete</button>
        </td>
      </tr>
    `;
  }

  private async handleDelete(key: string) {
    const dialog = this.shadow.querySelector<any>("confirm-dialog");
    if (!dialog) return;

    const confirmed = await dialog.open(`Are you sure you want to delete "${key}"?`);
    if (!confirmed) return;

    try {
      await store.deleteConfig(key);
      document.dispatchEvent(
        new CustomEvent("toast", { detail: { message: "Config deleted", type: "success" } })
      );
    } catch (err) {
      document.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            message: err instanceof Error ? err.message : "Delete failed",
            type: "error",
          },
        })
      );
    }
  }

  private escapeHtml(str: string): string {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  private escapeAttr(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }
}
