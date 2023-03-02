/**
 * Build styles
 */
import './index.css';

import { IconText } from '@codexteam/icons'
import { API, BlockTool, PasteEvent } from '@editorjs/editorjs';
import type { ParagraphToolConfig, ParagraphToolCSS, ParagraphToolData, PasteConfig, Toolbox } from './types';

/**
 * Base Paragraph Block for the Editor.js.
 * Represents simple paragraph
 *
 * @author CodeX <team@codex.so>
 * @copyright CodeX 2023
 * @license The MIT License (MIT)
 */
export default class Paragraph implements BlockTool {
  /**
   * Code API — public methods to work with Editor
   *
   * @link https://editorjs.io/api
   */
  private readonly api: API;

  /**
   * Read-only mode flag
   */
  private readonly readOnly: boolean;

  /**
   * Tool data for input and output
   */
  private _data: ParagraphToolData = {};

  /**
   * Configuration object that passed through the initial Editor configuration.
   */
  private config: ParagraphToolConfig;

  /**
   * Tool's HTML element
   */
  private readonly element: HTMLDivElement;

  /**
   * CSS class names
   */
  private readonly CSS: ParagraphToolCSS;

  /**
   * Placeholder for paragraph if it is first Block
   */
  private readonly placeholder: string;

  /**
   * Will save empty paragraphs if set to true
   */
  private readonly preserveBlank: boolean;

  /**
   * Default placeholder for Paragraph Tool
   *
   * @constructor
   */
  static get DEFAULT_PLACEHOLDER(): string {
    return '';
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param data - previously saved data
   * @param config - user config for Tool
   * @param api - editor.js api
   * @param readOnly - read only mode flag
   */
  constructor({ data, config, api, readOnly }: { data: ParagraphToolData, config: ParagraphToolConfig, api: API, readOnly: boolean }) {
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
   * Create Tool's html view
   */
  private drawView(): HTMLDivElement {
    let div = document.createElement('div');

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
   * Renders tool's view with current data
   *
   * @returns Tool's view
   */
  public render(): HTMLDivElement {
    return this.element;
  }

  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   *
   * @param data - paragraph content
   */
  public merge(data: ParagraphToolData) {
    this.data = {
      text: (this.data.text || '') + (data.text || '')
    };
  }

  /**
   * Validate Paragraph block data:
   * - check for emptiness
   *
   * @param savedData — data received after saving
   *
   * @returns false if saved data is not correct, otherwise true
   */
  public validate(savedData: ParagraphToolData): boolean {
    if (!savedData.text || savedData.text.trim() === '' && !this.preserveBlank) {
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
  public save(toolsContent: HTMLDivElement): ParagraphToolData {
    return {
      text: toolsContent.innerHTML
    };
  }

  /**
   * On paste callback fired from Editor.
   */
  onPaste(event: PasteEvent) {
    if (!('data' in event.detail)) {
      return;
    }

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
   */
  private get data(): ParagraphToolData {
    this._data.text = this.element.innerHTML;

    return this._data;
  }

  /**
   * Updates the internal state and state of the html element
   */
  private set data(data: ParagraphToolData) {
    this._data = data || {};

    this.element.innerHTML = this.data.text || '';
  }

  /**
   * Used by Editor paste handling API.
   * Provides configuration to handle P tags.
   */
  static get pasteConfig(): PasteConfig {
    return {
      tags: ['P']
    };
  }

  /**
   * Icon and title for displaying paragraph module at the Toolbox
   */
  static get toolbox(): Toolbox {
    return {
      icon: IconText,
      title: 'Text'
    };
  }
}

export {
  ParagraphToolData,
  ParagraphToolConfig,
}