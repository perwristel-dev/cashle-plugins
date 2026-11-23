import { buildSourcePlugin } from '../build-source-plugin.mjs';

await buildSourcePlugin(import.meta.url);
