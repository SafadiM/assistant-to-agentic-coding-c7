const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: block;
    min-height: 100vh;
  }

  header {
    background: var(--color-primary);
    color: var(--color-text-inverse);
    padding: var(--spacing-md) var(--spacing-xl);
    box-shadow: var(--shadow-md);
  }

  header h1 {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: 600;
  }

  main {
    max-width: 960px;
    margin: var(--spacing-xl) auto;
    padding: 0 var(--spacing-lg);
  }
`);

type View = "list" | "create" | "edit" | "detail";

export class AppRoot extends HTMLElement {
  private shadow: ShadowRoot;
  private currentView: View = "list";
  private currentKey = "";
  private mainEl!: HTMLElement;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styles];
  }

  connectedCallback() {
    this.shadow.innerHTML = `
      <header><h1>Config Admin</h1></header>
      <main></main>
      <toast-notification></toast-notification>
    `;
    this.mainEl = this.shadow.querySelector("main")!;

    this.shadow.addEventListener("navigate", (e: Event) => {
      const { view, key } = (e as CustomEvent).detail;
      this.navigateTo(view, key);
    });

    this.renderView();
  }

  private navigateTo(view: View, key?: string) {
    this.currentView = view;
    this.currentKey = key || "";
    this.renderView();
  }

  private renderView() {
    this.mainEl.innerHTML = "";

    switch (this.currentView) {
      case "list": {
        const el = document.createElement("config-list");
        this.mainEl.appendChild(el);
        break;
      }
      case "create": {
        const el = document.createElement("config-form");
        el.setAttribute("mode", "create");
        this.mainEl.appendChild(el);
        break;
      }
      case "edit": {
        const el = document.createElement("config-form");
        el.setAttribute("mode", "edit");
        el.setAttribute("config-key", this.currentKey);
        this.mainEl.appendChild(el);
        break;
      }
      case "detail": {
        const el = document.createElement("config-detail");
        el.setAttribute("config-key", this.currentKey);
        this.mainEl.appendChild(el);
        break;
      }
    }
  }
}
