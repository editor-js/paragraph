/**
 * Build styles
 */
import './index.css';

import { IconText } from '@codexteam/icons';
import makeFragment from './utils/makeFragment';

import type {
  API,
  HTMLPasteEvent,
  PasteConfig,
  ToolConfig,
} from '@editorjs/editorjs';

/**
 * Base Paragraph Block for the Editor.js.
 * Represents a regular text block
 *
 * @author CodeX (team@codex.so)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 */

/**
 * @typedef {object} ParagraphConfig
 * @property {string} placeholder - placeholder for the empty paragraph
 * @property {boolean} preserveBlank - Whether or not to keep blank paragraphs when saving editor data
 */
interface ParagraphConfig extends ToolConfig {
  /**
   * Placeholder for the empty paragraph
   */
  placeholder?: string;

  /**
   * Whether or not to keep blank paragraphs when saving editor data
   */
  preserveBlank?: boolean;
}

/**
 * @typedef {object} ParagraphData
 * @description Tool's input and output data format
 * @property {string} text — Paragraph's content. Can include HTML tags: <a><b><i>
 */
interface ParagraphData {
  text: string;
}

interface ParagraphParams {
  data: ParagraphData;
  config: ParagraphConfig;
  api: API;
  readOnly: boolean;
}

interface ParagraphCSS {
  block: string;
  wrapper: string;
}

export default class Paragraph {
  /**
   * Default placeholder for Paragraph Tool
   *
   * @returns {string}
   * @class
   */
  static get DEFAULT_PLACEHOLDER() {
    return '';
  }

  api: API;
  readOnly: boolean;
  private _CSS: ParagraphCSS;
  private _placeholder: string;
  private _data: ParagraphData;
  private _element: HTMLDivElement | null;
  private _preserveBlank: boolean;

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {object} params - constructor params
   * @param {ParagraphData} params.data - previously saved data
   * @param {ParagraphConfig} params.config - user config for Tool
   * @param {object} params.api - editor.js api
   * @param {boolean} readOnly - read only mode flag
   */
  constructor({ data, config, api, readOnly }: ParagraphParams) {
    this.api = api;
    this.readOnly = readOnly;

    this._CSS = {
      block: this.api.styles.block,
      wrapper: 'ce-paragraph',
    };

    if (!this.readOnly) {
      this.onKeyUp = this.onKeyUp.bind(this);
    }

    /**
     * Placeholder for paragraph if it is first Block
     *
     * @type {string}
     */
    this._placeholder = config.placeholder
      ? config.placeholder
      : Paragraph.DEFAULT_PLACEHOLDER;
    this._data = data ?? {};
    this._element = null;
    this._preserveBlank =
      config.preserveBlank !== undefined ? config.preserveBlank : false;
  }

  /**
   * Check if text content is empty and set empty string to inner html.
   * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
   *
   * @param {KeyboardEvent} e - key up event
   */
  onKeyUp(e: KeyboardEvent) {
    if (e.code !== 'Backspace' && e.code !== 'Delete') {
      return;
    }

    if (!this._element) {
      return;
    }

    const { textContent } = this._element;

    if (textContent === '') {
      this._element.innerHTML = '';
    }
  }

  /**
   * Create Tool's view
   *
   * @returns {HTMLDivElement}
   * @private
   */
  drawView(): HTMLDivElement {
    const div = document.createElement('DIV');

    div.classList.add(this._CSS.wrapper, this._CSS.block);
    div.contentEditable = 'false';
    div.dataset.placeholder = this.api.i18n.t(this._placeholder);

    if (this._data.text) {
      div.innerHTML = this._data.text;
    }

    if (!this.readOnly) {
      div.contentEditable = 'true';
      div.addEventListener('keyup', this.onKeyUp);
    }

    /**
     * bypass property 'align' required in html div element
     */
    return div as HTMLDivElement;
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   */
  render(): HTMLDivElement {
    this._element = this.drawView();

    return this._element;
  }

  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   *
   * @param {ParagraphData} data
   * @public
   */
  merge(data: ParagraphData) {
    if (!this._element) {
      return;
    }

    this._data.text += data.text;

    /**
     * We use appendChild instead of innerHTML to keep the links of the existing nodes
     * (for example, shadow caret)
     */
    const fragment = makeFragment(data.text);

    this._element.appendChild(fragment);

    this._element.normalize();
  }

  /**
   * Validate Paragraph block data:
   * - check for emptiness
   *
   * @param {ParagraphData} savedData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(savedData: ParagraphData): boolean {
    if (savedData.text.trim() === '' && !this._preserveBlank) {
      return false;
    }

    return true;
  }

  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLDivElement} toolsContent - Paragraph tools rendered view
   * @returns {ParagraphData} - saved data
   * @public
   */
  save(toolsContent: HTMLDivElement): ParagraphData {
    return {
      text: toolsContent.innerHTML,
    };
  }

  /**
   * On paste callback fired from Editor.
   *
   * @param {HTMLPasteEvent} event - event with pasted data
   */
  onPaste(event: HTMLPasteEvent) {
    const data = {
      text: event.detail.data.innerHTML,
    };

    this._data = data;

    /**
     * We use requestAnimationFrame for performance purposes
     */
    window.requestAnimationFrame(() => {
      if (!this._element) {
        return;
      }
      this._element.innerHTML = this._data.text || '';
    });
  }

  /**
   * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
   */
  static get conversionConfig() {
    return {
      export: 'text', // to convert Paragraph to other block, use 'text' property of saved data
      import: 'text', // to covert other block's exported string to Paragraph, fill 'text' property of tool data
    };
  }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      text: {
        br: true,
      },
    };
  }

  /**
   * Returns true to notify the core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported(): boolean {
    return true;
  }

  /**
   * Used by Editor paste handling API.
   * Provides configuration to handle P tags.
   *
   * @returns {PasteConfig}
   */
  static get pasteConfig(): PasteConfig {
    return {
      tags: ['P'],
    };
  }

  /**
   * Icon and title for displaying at the Toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox(): { icon: string; title: string } {
    return {
      icon: IconText,
      title: 'Text',
    };
  }
}
