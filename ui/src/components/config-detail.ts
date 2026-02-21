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

  header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  h2 {
    margin: 0;
    flex: 1;
    font-size: var(--font-size-xl);
    color: var(--color-text);
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--spacing-sm) var(--spacing-lg);
    margin: 0;
  }

  dt {
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-top: 2px;
  }

  dd {
    margin: 0;
    color: var(--color-text);
    word-break: break-all;
  }

  pre {
    margin: 0;
    padding: var(--spacing-md);
    background: var(--color-bg);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    overflow-x: auto;
    white-space: pre-wrap;
    font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace;
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

  .btn-back {
    background: var(--color-surface);
    color: var(--color-text);
  }

  .btn-back:hover {
    background: var(--color-hover-row);
  }

  .btn-edit {
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border-color: var(--color-primary);
  }

  .btn-edit:hover {
    background: var(--color-primary-hover);
  }

  .loading {
    color: var(--color-text-secondary);
    text-align: center;
    padding: var(--spacing-xl);
  }
`);

export class ConfigDetail extends HTMLElement {
  private shadow: ShadowRoot;
  private handleStateChange = () => this.renderContent();

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styles];
  }

  get configKey(): string {
    return this.getAttribute("config-key") || "";
  }

  connectedCallback() {
    store.addEventListener("state-change", this.handleStateChange);
    this.shadow.innerHTML = `<p class="loading">Loading…</p>`;
    store.loadConfig(this.configKey);
  }

  disconnectedCallback() {
    store.removeEventListener("state-change", this.handleStateChange);
  }

  private renderContent() {
    const { selectedConfig, loading } = store.getState();

    if (loading) {
      this.shadow.innerHTML = `<p class="loading">Loading…</p>`;
      return;
    }

    if (!selectedConfig) {
      this.shadow.innerHTML = `<p class="loading">Config not found.</p>`;
      return;
    }

    const c = selectedConfig;
    const valueDisplay =
      typeof c.value === "string"
        ? c.value
        : JSON.stringify(c.value, null, 2);

    const isObject = typeof c.value !== "string";

    this.shadow.innerHTML = `
      <article>
        <header>
          <button class="btn-back">← Back</button>
          <h2>${this.escapeHtml(c.key)}</h2>
          <button class="btn-edit">Edit</button>
        </header>
        <dl>
          <dt>ID</dt>    <dd>${this.escapeHtml(c.id)}</dd>
          <dt>Key</dt>   <dd>${this.escapeHtml(c.key)}</dd>
          <dt>Value</dt> <dd>${isObject ? `<pre>${this.escapeHtml(valueDisplay)}</pre>` : this.escapeHtml(valueDisplay)}</dd>
          <dt>Created</dt> <dd>${this.escapeHtml(c.createdAt)}</dd>
          <dt>Updated</dt> <dd>${this.escapeHtml(c.updatedAt)}</dd>
        </dl>
      </article>
    `;

    this.shadow.querySelector(".btn-back")!.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("navigate", {
          bubbles: true,
          composed: true,
          detail: { view: "list" },
        })
      );
    });

    this.shadow.querySelector(".btn-edit")!.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("navigate", {
          bubbles: true,
          composed: true,
          detail: { view: "edit", key: c.key },
        })
      );
    });
  }

  private escapeHtml(str: string): string {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}
