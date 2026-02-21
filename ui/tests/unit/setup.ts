class MockCSSStyleSheet {
  private rules: string[] = [];
  replaceSync(text: string) {
    this.rules = [text];
  }
  get cssRules() {
    return this.rules;
  }
}

if (typeof globalThis.CSSStyleSheet === "undefined" || !("replaceSync" in CSSStyleSheet.prototype)) {
  (globalThis as any).CSSStyleSheet = MockCSSStyleSheet;
}

if (typeof ShadowRoot !== "undefined" && !("adoptedStyleSheets" in ShadowRoot.prototype)) {
  Object.defineProperty(ShadowRoot.prototype, "adoptedStyleSheets", {
    get() { return this._adoptedStyleSheets || []; },
    set(sheets: any[]) { this._adoptedStyleSheets = sheets; },
  });
}
