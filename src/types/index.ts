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

export interface ParagraphToolCSS {
    block: string;

    wrapper: 'ce-paragraph';
}