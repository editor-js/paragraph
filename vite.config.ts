import { defineConfig } from 'vite';

import * as path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';

/**
 * Trick to use Vite server.open option on macOS
 * @see https://github.com/facebook/create-react-app/pull/1690#issuecomment-283518768
 */
process.env.BROWSER = 'open';

export default defineConfig({
    plugins: [
        cssInjectedByJsPlugin(),
        dts(),
    ],

    build: {
        lib: {
            entry: path.resolve(__dirname, 'src', 'index.ts'),
            name: 'Paragraph',
            formats: ['umd', 'es'],
            fileName: 'paragraph',
        },
        emptyOutDir: false,
    },

    server: {
        port: 3300,
        open: true,
    }
});