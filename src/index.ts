/**
 * Build styles
 */
import './index.css';

import { IconText } from '@codexteam/icons';
import makeFragment from './utils/makeFragment';

import { IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustify } from '@codexteam/icons';

import type {
  API,
  ConversionConfig,
  HTMLPasteEvent,
  PasteConfig,
  SanitizerConfig,
  ToolConfig,
  ToolboxConfig,
} from '@editorjs/editorjs';
import { ActionConfig } from './types/types';
import { TunesMenuConfig } from '@editorjs/editorjs/types/tools';

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
export interface ParagraphConfig extends ToolConfig {
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
export interface ParagraphData {
  /**
   * Paragraph's content
   */
  text: string;

  /**
   * Paragraph alignment
   */
  alignment: ParagraphAlignmentsEnum;
}

/**
 * @typedef {object} ParagraphParams
 * @description Constructor params for the Paragraph tool, use to pass initial data and settings
 * @property {ParagraphData} data - Preload data for the paragraph.
 * @property {ParagraphConfig} config - The configuration for the paragraph.
 * @property {API} api - The Editor.js API.
 * @property {boolean} readOnly - Is paragraph is read-only.
 */
interface ParagraphParams {
  /**
   * Initial data for the paragraph
   */
  data: ParagraphData;
  /**
   * Paragraph tool configuration
   */
  config: ParagraphConfig;
  /**
   * Editor.js API
   */
  api: API;
  /**
   * Is paragraph read-only.
   */
  readOnly: boolean;
}

interface ParagraphAlignments {
  left: string;
  center: string;
  right: string;
  justify: string;
}

/**
 * @typedef {object} ParagraphCSS
 * @description CSS classes names
 * @property {string} block - Editor.js CSS Class for block
 * @property {string} wrapper - Paragraph CSS Class
 */
interface ParagraphCSS {
  /**
   * Editor.js CSS Class for block
   */
  block: string;
  /**
   * Paragraph CSS Class
   */
  wrapper: string;
  /**
   * Paragraph CSS Alignment
   */
  alignment: ParagraphAlignments;
}

enum ParagraphAlignmentsEnum {
  LEFT = 'left', CENTER = 'center', RIGHT = 'right', JUSTIFY = 'justify'
}

export default class Paragraph {
  /**
   * Default placeholder for Paragraph Tool
   *
   * @returns {string}
   * @class
   */
  static get DEFAULT_PLACEHOLDER(): string {
    return '';
  }

  /**
   * Allowed paragraph alignments
   *
   * @public
   * @returns {{left: string, center: string, right: string}}
  */
  static get ALIGNMENTS(): ParagraphAlignments {
    return {
      left: ParagraphAlignmentsEnum.LEFT.toString(),
      center: ParagraphAlignmentsEnum.CENTER.toString(),
      right: ParagraphAlignmentsEnum.RIGHT.toString(),
      justify: ParagraphAlignmentsEnum.JUSTIFY.toString(),
    };
  }

  /**
   * Default paragraph alignment
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_ALIGNMENT(): ParagraphAlignmentsEnum {
    return ParagraphAlignmentsEnum.LEFT;
  }

  /**
   * The Editor.js API
   */
  api: API;

  /**
   * Paragraph's configuration
   */
  config: ParagraphConfig;

  /**
   * Is Paragraph Tool read-only
   */
  readOnly: boolean;

  /**
   * Paragraph Tool's CSS classes
   */
  private _CSS: ParagraphCSS;

  /**
   * Placeholder for Paragraph Tool
   */
  private _placeholder: string;

  /**
   * Paragraph's data
   */
  private _data: ParagraphData;

  /**
   * Paragraph's main Element
   */
  private _element: HTMLDivElement | null;

  /**
   * Whether or not to keep blank paragraphs when saving editor data
   */
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

    this.config = {
      placeholder: config.placeholder,
      preserveBlank: config.preserveBlank
    };

    this.readOnly = readOnly;

    this._CSS = {
      block: this.api.styles.block,
      wrapper: 'ce-paragraph',
      alignment: {
        left: 'ce-paragraph--left',
        center: 'ce-paragraph--center',
        right: 'ce-paragraph--right',
        justify: 'ce-paragraph--justify',
      }
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
    this._data = {
      text: '',
      alignment: Paragraph.DEFAULT_ALIGNMENT
    }
    this._element = null;
    this._preserveBlank = config.preserveBlank ?? false;

    this.data = data;
  }

  /**
   * Check if text content is empty and set empty string to inner html.
   * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
   *
   * @param {KeyboardEvent} e - key up event
   */
  public onKeyUp(e: KeyboardEvent): void {
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
  public drawView(): HTMLDivElement {
    const div = document.createElement('DIV');

    div.classList.add(this._CSS.wrapper, this._CSS.block, this._CSS.alignment[this._data.alignment]);
    div.contentEditable = 'false';
    div.dataset.placeholderActive = this.api.i18n.t(this._placeholder);

    if (this._data.text) {
      div.innerHTML = this._data.text;
    }

    if (!this.readOnly) {
      div.contentEditable = 'true';
      div.addEventListener('keyup', this.onKeyUp);
    }

    return div as HTMLDivElement;
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   */
  public render(): HTMLDivElement {
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
  public merge(data: ParagraphData): void {
    if (!this._element) {
      return;
    }

    this._data.text += data.text;
    this._data.alignment = data.alignment;

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
  public validate(savedData: ParagraphData): boolean {
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
  public save(): ParagraphData {
    this._data.text = this._element?.innerHTML ?? "";

    return this.data;
  }

  /**
   * Apply visual representation of activated tune
   * @param tune 
   * @param status 
   */
  public applyTune(tune: ParagraphAlignmentsEnum, status: boolean): void {
    this._element?.classList.toggle(`${this._CSS.alignment[tune]}`, status);
  }

  /**
   * @returns TunesMenuConfig
   */
  public renderSettings(): TunesMenuConfig {
    return Paragraph.alignmentTunes.map(tune => ({
      icon: tune.icon,
      label: this.api.i18n.t(tune.title),
      name: tune.name,
      toggle: tune.toggle,
      closeOnActivate: true,
      isActive: this.data.alignment.toString() === tune.name,
      onActivate: () => {
        /** If it'a user defined tune, execute it's callback stored in action property */
        if (typeof tune.action === 'function') {
          tune.action(tune.name);

          return;
        }
        this.tuneToggled(tune.name);
      },
    }));
  }

  /**
   * On paste callback fired from Editor.
   *
   * @param {HTMLPasteEvent} event - event with pasted data
   */
  public onPaste(event: HTMLPasteEvent): void {
    const data = {
      text: event.detail.data.innerHTML,
      alignment: this.stringToAlignmentEnum(event.detail.data.style.textAlign) || Paragraph.DEFAULT_ALIGNMENT
    };

    this._data = data

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
   * Stores all Tool's data
   */
  private set data(data: ParagraphData) {
    this._data.text = data.text || '';
    this._data.alignment = data.alignment || Paragraph.DEFAULT_ALIGNMENT
  }
  
  /**
   * Get current Tools`s data
   */
  private get data(): ParagraphData {
    return this._data;
  }
  
  /**
   * Convert string to @ParagraphAlignmentsEnum
   * @param value 
   * @returns 
   */
  private stringToAlignmentEnum(value: string): ParagraphAlignmentsEnum | undefined {
    for (const key in ParagraphAlignmentsEnum) {
        if (ParagraphAlignmentsEnum[key as keyof typeof ParagraphAlignmentsEnum] === value) {
            return value as ParagraphAlignmentsEnum;
        }
    }
    return undefined;
  }

  /**
   * Tune has been toggled
   * @param tuneName 
   * @returns @void
   */
  private tuneToggled(tuneName: string): void {
    const tuneAlignment = this.stringToAlignmentEnum(tuneName)
    if(!tuneAlignment) return

    this.resetTunes();
    this.setTune(tuneAlignment);
    this.applyTune(tuneAlignment, true)
  }

  /**
   * Set one tune
   * @param tune 
   * @param force - tune state
   */
  private setTune(tuneAlignment: ParagraphAlignmentsEnum): void {
    this._data.alignment = tuneAlignment
  }

  /**
   * Remove all tunes
   */
  private resetTunes(): void {
    Paragraph.alignmentTunes.forEach((tune) => {
      const tuneAlignment = this.stringToAlignmentEnum(tune.name);
      tuneAlignment && this.applyTune(tuneAlignment, false)
    });
  }

  /**
   * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
   * @returns {ConversionConfig}
   */
  static get conversionConfig(): ConversionConfig {
    return {
      export: 'text', // to convert Paragraph to other block, use 'text' property of saved data
      import: 'text', // to covert other block's exported string to Paragraph, fill 'text' property of tool data
    };
  }

  /**
   * Sanitizer rules
   * @returns {SanitizerConfig} - Edtior.js sanitizer config
   */
  static get sanitize(): SanitizerConfig {
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
   * @returns {PasteConfig} - Paragraph Paste Setting
   */
  static get pasteConfig(): PasteConfig {
    return {
      tags: ['P'],
    };
  }

  /**
   * Icon and title for displaying at the Toolbox
   *
   * @returns {ToolboxConfig} - Paragraph Toolbox Setting
   */
  static get toolbox(): ToolboxConfig {
    return {
      icon: IconText,
      title: 'Text',
    };
  }

  /**
   * Available paragraph tools
   */
  public static get alignmentTunes(): Array<ActionConfig> {
    return [
      {
        name: 'left',
        icon: IconAlignLeft,
        title: 'Align left',
        toggle: true,
      },
      {
        name: 'center',
        icon: IconAlignCenter,
        title: 'Align center',
        toggle: true,
      },
      {
        name: 'right',
        icon: IconAlignRight,
        title: 'Align right',
        toggle: true,
      },
      {
        name: 'justify',
        icon: IconAlignJustify,
        title: 'Justify',
        toggle: true,
      },
    ];
  }
}
