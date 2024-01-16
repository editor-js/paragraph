(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".ce-paragraph{line-height:1.6em;outline:none}.ce-paragraph[data-placeholder]:empty:before{content:attr(data-placeholder);color:#707684;font-weight:400;opacity:0}.codex-editor--empty .ce-block:first-child .ce-paragraph[data-placeholder]:empty:before{opacity:1}.codex-editor--toolbox-opened .ce-block:first-child .ce-paragraph[data-placeholder]:empty:before,.codex-editor--empty .ce-block:first-child .ce-paragraph[data-placeholder]:empty:focus:before{opacity:0}.ce-paragraph p:first-of-type{margin-top:0}.ce-paragraph p:last-of-type{margin-bottom:0}")),document.head.appendChild(e)}}catch(t){console.error("vite-plugin-css-injected-by-js",t)}})();
const s = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8 9V7.2C8 7.08954 8.08954 7 8.2 7L12 7M16 9V7.2C16 7.08954 15.9105 7 15.8 7L12 7M12 7L12 17M12 17H10M12 17H14"/></svg>';
/**
 * Base Paragraph Block for the Editor.js.
 * Represents a regular text block
 *
 * @author CodeX (team@codex.so)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 */
class i {
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param data - Previously saved data
   * @param config - User config for Tool
   * @param api - Editor.js api
   * @param readOnly - Read only mode flag
   */
  constructor({ data: t, config: e, api: a, readOnly: r }) {
    this._data = {}, this.api = a, this.readOnly = r, this.config = e, this.CSS = {
      block: this.api.styles.block,
      wrapper: "ce-paragraph"
    }, this.readOnly || (this.onKeyUp = this.onKeyUp.bind(this)), this.placeholder = e.placeholder ?? i.DEFAULT_PLACEHOLDER, this.element = this.drawView(), this.preserveBlank = e.preserveBlank ?? !1, this.data = t;
  }
  /**
   * Default placeholder for Paragraph Tool
   *
   * @class
   */
  static get DEFAULT_PLACEHOLDER() {
    return "";
  }
  /**
   * Check if text content is empty and set empty string to inner html.
   * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
   */
  onKeyUp(t) {
    if (t.code !== "Backspace" && t.code !== "Delete")
      return;
    const { textContent: e } = this.element;
    e === "" && (this.element.innerHTML = "");
  }
  /**
   * Create Tool's view
   */
  drawView() {
    const t = document.createElement("div");
    return t.classList.add(this.CSS.wrapper, this.CSS.block), t.contentEditable = "false", t.dataset.placeholder = this.api.i18n.t(this.placeholder), this.readOnly || (t.contentEditable = "true", t.addEventListener("keyup", this.onKeyUp)), t;
  }
  /**
   * Return Tool's view
   */
  render() {
    return this.element = this.drawView(), this.element;
  }
  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   */
  merge(t) {
    this.data = {
      text: (this.data.text || "") + (t.text || "")
    };
  }
  /**
   * Validate Paragraph block data:
   * - check for emptiness
   *
   * @param savedData — Data received after saving
   *
   * @returns false if saved data is not correct, otherwise true
   */
  validate(t) {
    return !(t.text.trim() === "" && !this.preserveBlank);
  }
  /**
   * Extract Tool's data from the view
   *
   * @param toolsContent - Paragraph tools rendered view
   *
   * @returns Saved data
   */
  save(t) {
    return {
      text: t.innerHTML
    };
  }
  /**
   * On paste callback fired from Editor.
   *
   * @param event - Event with pasted data
   */
  onPaste(t) {
    "data" in t.detail && (this.data = {
      text: t.detail.data.innerHTML
    });
  }
  /**
   * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
   */
  static get conversionConfig() {
    return {
      export: "text",
      // to convert Paragraph to other block, use 'text' property of saved data
      import: "text"
      // to covert other block's exported string to Paragraph, fill 'text' property of tool data
    };
  }
  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      text: {
        br: !0
      }
    };
  }
  /**
   * Returns true to notify the core that read-only mode is supported
   */
  static get isReadOnlySupported() {
    return !0;
  }
  /**
   * Get current Tools`s data
   *
   * @returns Current data
   */
  get data() {
    if (this.element !== null) {
      const t = this.element.innerHTML;
      this._data.text = t;
    }
    return this._data;
  }
  /**
   * Store data in plugin:
   * - at the this._data property
   * - at the HTML
   *
   * @param data — Data to set
   */
  set data(t) {
    this._data = t || {}, this.element !== null && this.hydrate();
  }
  /**
   * Fill tool's view with data
   */
  hydrate() {
    window.requestAnimationFrame(() => {
      this.element.innerHTML = this._data.text || "";
    });
  }
  /**
   * Used by Editor paste handling API.
   * Provides configuration to handle P tags.
   */
  static get pasteConfig() {
    return {
      tags: ["P"]
    };
  }
  /**
   * Icon and title for displaying at the Toolbox
   */
  static get toolbox() {
    return {
      icon: s,
      title: "Text"
    };
  }
}
export {
  i as default
};
