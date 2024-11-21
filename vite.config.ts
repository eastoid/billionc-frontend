import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { visualizer } from 'rollup-plugin-visualizer'


export default defineConfig({
	plugins: [
        sveltekit(),
        commonjs(),
        nodePolyfills(),
        visualizer({ open: false }),
    ],
    resolve: {
        alias: {
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            buffer: 'buffer',
            process: 'process/browser',
        }
    },
    optimizeDeps: {
        include: ["rsocket-core", 'crypto-browserify', 'stream-browserify', 'buffer', 'process', "libsodium-wrappers"],
    },
    envPrefix: "PUBLIC_",
    build: {
        target: 'es2022',
        chunkSizeWarningLimit: 150,
    },
    worker: {
        format: "es"
    },
    define: {
        'BUILD_DATE': `${Math.floor(Date.now() / 1000)}`
    }
});
