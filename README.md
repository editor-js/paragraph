![](https://badgen.net/badge/Editor.js/v2.0/blue)

# Paragraph Tool for Editor.js

Basic text Tool for the [Editor.js](https://ifmo.su/editor).

## Installation

Get the package

```shell
yarn add @editorjs/paragraph
```

Include module at your application

```javascript
import Paragraph from '@editorjs/paragraph';
```

## Usage

The Paragraph tool is included at editor.js by default. So you don't need to connect it manually.
If you want to connect your customized version of this tool, do not forget to use the [`defaultBlock`](https://editorjs.io/configuration#change-the-default-block)
option of the editor config.

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
var editor = new EditorJS({
  ...

  tools: {
    ...
    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
    },
  }

  ...
});
```

## Config Params

The Paragraph Tool supports these configuration parameters:

| Field | Type     | Description        |
| ----- | -------- | ------------------ |
| placeholder | `string` | The placeholder. Will be shown only in the first paragraph when the whole editor is empty.  |
| preserveBlank | `boolean` | (default: `false`) Whether or not to keep blank paragraphs when saving editor data |

## Output data

| Field  | Type     | Description      |
| ------ | -------- | ---------------- |
| text   | `string` | paragraph's text |


```json
{
    "type" : "paragraph",
    "data" : {
        "text" : "Check out our projects on a <a href=\"https://github.com/codex-team\">GitHub page</a>.",
    }
}
```

