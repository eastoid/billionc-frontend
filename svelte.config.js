// import adapter from '@sveltejs/adapter-node';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	preprocess: [
        vitePreprocess({script: true}),
    ],

	kit: {
        adapter: adapter({
            // default options are shown. On some platforms
            // these options are set automatically — see below
            pages: 'build',
            assets: 'build',
            fallback: "csr",
            precompress: false,
            strict: true,
        }),
        inlineStyleThreshold: 100,
        serviceWorker: { register: false }
	},
    compilerOptions: {
        cssHash: ({hash, css, name, filename}) => `s-${hash(css)}`,
        // disable all warnings coming from node_modules and all accessibility warnings
        warningFilter: (warning) => !warning.filename?.includes('node_modules') && !warning.code.startsWith('a11y'),
    }
};

export default config;