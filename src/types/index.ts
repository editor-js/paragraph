import { BlockToolData, ToolConfig } from '@editorjs/editorjs';

/**
 * Paragraph's input and output data format
 */
export interface ParagraphData extends BlockToolData {
  /**
   * Paragraph's content. Can include HTML tags: <a><b><i>
   */
  text?: string;
}

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

export interface ParagraphCSS {
  block: string;
  wrapper: string;
}

export interface PasteConfig {
  tags: string[];
}

export interface Toolbox {
  icon: string;
  title: string;
}