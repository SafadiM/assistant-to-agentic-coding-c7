const styles = new CSSStyleSheet();
styles.replaceSync(`
  dialog {
    border: none;
    border-radius: var(--radius-md);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
    max-width: 400px;
    font-family: var(--font-family);
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  p {
    margin: 0 0 var(--spacing-lg);
    font-size: var(--font-size-base);
    color: var(--color-text);
    line-height: 1.5;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
  }

  button {
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--color-border);
    font-family: var(--font-family);
  }

  .btn-cancel {
    background: var(--color-surface);
    color: var(--color-text);
  }

  .btn-cancel:hover {
    background: var(--color-hover-row);
  }

  .btn-danger {
    background: var(--color-danger);
    color: var(--color-text-inverse);
    border-color: var(--color-danger);
  }

  .btn-danger:hover {
    background: var(--color-danger-hover);
  }
`);

export class ConfirmDialog extends HTMLElement {
  private dialog!: HTMLDialogElement;
  private messageEl!: HTMLParagraphElement;
  private resolve?: (value: boolean) => void;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [styles];

    this.dialog = document.createElement("dialog");
    this.messageEl = document.createElement("p");

    const actions = document.createElement("div");
    actions.className = "dialog-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn-cancel";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => this.close(false));

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn-danger";
    confirmBtn.textContent = "Delete";
    confirmBtn.addEventListener("click", () => this.close(true));

    actions.append(cancelBtn, confirmBtn);
    this.dialog.append(this.messageEl, actions);
    shadow.appendChild(this.dialog);

    this.dialog.addEventListener("close", () => {
      if (this.resolve) {
        this.resolve(false);
        this.resolve = undefined;
      }
    });
  }

  open(message: string): Promise<boolean> {
    this.messageEl.textContent = message;
    this.dialog.showModal();
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  private close(confirmed: boolean) {
    this.dialog.close();
    if (this.resolve) {
      this.resolve(confirmed);
      this.resolve = undefined;
    }
  }
}
