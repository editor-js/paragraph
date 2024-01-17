/**
 * Build styles
 */
import './index.css';

// @ts-ignore
import { IconText } from '@codexteam/icons';

import { API, BlockTool, PasteEvent } from '@editorjs/editorjs';
import type { ParagraphConfig, ParagraphCSS, ParagraphData, PasteConfig, Toolbox } from './types';

/**
 * Base Paragraph Block for the Editor.js.
 * Represents a regular text block
 *
 * @author CodeX (team@codex.so)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 */

export default class Paragraph implements BlockTool {

  /**
   * Editor.js api
   */
  private readonly api: API;

  /**
   * Read only mode flag
   */
  private readonly readOnly: boolean;

  /**
   * Tool data for input and output
   */
  private _data: ParagraphData = {};

  /**
   * User config for Tool
   */
  private config: ParagraphConfig;

  /**
   * Tool's element
   */
  private element: HTMLDivElement;

  /**
   * CSS classes
   */
  private readonly CSS: ParagraphCSS;

  /**
   * Placeholder for paragraph if it is first Block
   */
  private readonly placeholder: string;

  /**
   * Whether or not to keep blank paragraphs when saving editor data
   */
  private readonly preserveBlank: boolean;

  /**
   * Default placeholder for Paragraph Tool
   */
  static get DEFAULT_PLACEHOLDER(): string {
    return '';
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param data - Previously saved data
   * @param config - User config for Tool
   * @param api - Editor.js api
   * @param readOnly - Read only mode flag
   */
  constructor({ data, config, api, readOnly }: { data: ParagraphData, config: ParagraphConfig, api: API, readOnly: boolean }) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config;

    this.CSS = {
      block: this.api.styles.block,
      wrapper: 'ce-paragraph'
    };

    if (!this.readOnly) {
      this.onKeyUp = this.onKeyUp.bind(this);
    }

    this.placeholder = config.placeholder ?? Paragraph.DEFAULT_PLACEHOLDER;
    this.element = this.drawView();
    this.preserveBlank = config.preserveBlank ?? false;
    this.data = data;
  }

  /**
   * Check if text content is empty and set empty string to inner html.
   * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
   */
  private onKeyUp(e: KeyboardEvent): void {
    if (e.code !== 'Backspace' && e.code !== 'Delete') {
      return;
    }

    const { textContent } = this.element;

    if (textContent === '') {
      this.element.innerHTML = '';
    }
  }

  /**
   * Create Tool's view
   */
  private drawView(): HTMLDivElement {
    const div = document.createElement('div');

    div.classList.add(this.CSS.wrapper, this.CSS.block);
    div.contentEditable = 'false';
    div.dataset.placeholder = this.api.i18n.t(this.placeholder);

    if (!this.readOnly) {
      div.contentEditable = 'true';
      div.addEventListener('keyup', this.onKeyUp);
    }

    return div;
  }

  /**
   * Return Tool's view
   */
  public render(): HTMLDivElement {
    this.element = this.drawView();

    return this.element;
  }

  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   */
  public merge(data: ParagraphData) {
    this.data = {
      text: (this.data.text || '') + (data.text || '')
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
  public validate(savedData: ParagraphData): boolean {
    if ((savedData.text || '').trim() === '' && !this.preserveBlank) {
      return false;
    }

    return true;
  }

  /**
   * Extract Tool's data from the view
   *
   * @param toolsContent - Paragraph tools rendered view
   *
   * @returns Saved data
   */
  public save(toolsContent: HTMLDivElement): ParagraphData {
    return {
      text: toolsContent.innerHTML
    };
  }

  /**
   * On paste callback fired from Editor.
   *
   * @param event - Event with pasted data
   */
  onPaste(event: PasteEvent) {
    if (!('data' in event.detail)) return;

    this.data = {
      text: (event.detail.data as HTMLElement).innerHTML,
    };
  }

  /**
   * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
   */
  static get conversionConfig() {
    return {
      export: 'text', // to convert Paragraph to other block, use 'text' property of saved data
      import: 'text' // to covert other block's exported string to Paragraph, fill 'text' property of tool data
    };
  }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      text: {
        br: true,
      }
    };
  }

  /**
   * Returns true to notify the core that read-only mode is supported
   */
  static get isReadOnlySupported(): boolean {
    return true;
  }

  /**
   * Get current Tools`s data
   *
   * @returns Current data
   */
  private get data(): ParagraphData {
    if (this.element !== null) {
      const text = this.element.innerHTML;

      this._data.text = text;
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
  private set data(data: ParagraphData) {
    this._data = data || {};
    
    if (this.element !== null) {
      this.hydrate();
    }
  }

  /**
   * Fill tool's view with data
   */
  public hydrate(): void {
    window.requestAnimationFrame(() => {
      this.element.innerHTML = this._data.text || '';
    });
  }

  /**
   * Used by Editor paste handling API.
   * Provides configuration to handle P tags.
   */
  static get pasteConfig(): PasteConfig {
    return {
      tags: [ 'P' ]
    };
  }

  /**
   * Icon and title for displaying at the Toolbox
   */
  static get toolbox(): Toolbox {
    return {
      icon: IconText,
      title: 'Text'
    };
  }
}

export {
  ParagraphData,
  ParagraphConfig,
}
