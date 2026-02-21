const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    position: fixed;
    top: var(--spacing-lg);
    right: var(--spacing-lg);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    pointer-events: none;
  }

  .toast {
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    box-shadow: var(--shadow-md);
    pointer-events: auto;
    animation: slide-in 0.3s ease-out, fade-out 0.3s ease-in forwards;
    animation-delay: 0s, 3.7s;
  }

  .toast--success {
    background: var(--color-success-bg);
    color: var(--color-success);
    border: 1px solid var(--color-success);
  }

  .toast--error {
    background: var(--color-error-bg);
    color: var(--color-danger);
    border: 1px solid var(--color-danger);
  }

  @keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }

  @keyframes fade-out {
    to { opacity: 0; transform: translateY(-10px); }
  }
`);

export class ToastNotification extends HTMLElement {
  private container!: HTMLDivElement;
  private handleToast = (e: Event) => {
    const { message, type } = (e as CustomEvent).detail;
    this.show(message, type);
  };

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [styles];
    this.container = document.createElement("div");
    this.container.className = "toast-container";
    shadow.appendChild(this.container);
  }

  connectedCallback() {
    document.addEventListener("toast", this.handleToast);
  }

  disconnectedCallback() {
    document.removeEventListener("toast", this.handleToast);
  }

  private show(message: string, type: "success" | "error" = "success") {
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.textContent = type === "success" ? `${message} ✓` : `${message} ✗`;
    this.container.appendChild(el);

    setTimeout(() => el.remove(), 4000);
  }
}
