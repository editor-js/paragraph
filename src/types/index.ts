import { BlockToolData, ToolConfig } from '@editorjs/editorjs';

/**
 * Tool's input and output data format
 */
export interface ParagraphToolData extends BlockToolData {
  /**
   * Paragraph's content. Can include HTML tags: <a><b><i>
   */
  text?: string;
}

/**
 * Public features for configuring the tool
 */
export interface ParagraphToolConfig extends ToolConfig {
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
 * CSS class names for elements created by the plugin
 */
export interface ParagraphToolCSS {
  /**
   * Block CSS class name
   */
  block: string;

  /**
   * Wrapper CSS class name
   */
  wrapper: string;
}

/**
 * Used by Editor paste handling API
 */
export interface PasteConfig {
  tags: string[];
}

/**
 * Used by Editor API to display the module in the toolbox
 */
export interface Toolbox {
  icon: string;
  title: string;
}