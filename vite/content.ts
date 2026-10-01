import { resolve } from 'path';
import type { Plugin } from 'vite';
import { loadContent } from './loadContent';

const VIRTUAL = 'virtual:content';
const RESOLVED = '\0' + VIRTUAL;

/** Exposes validated site content as `virtual:content`; a bad file fails the build. */
export function contentPlugin(dir = 'src/content'): Plugin {
  const root = resolve(dir);
  return {
    name: 'portfolio-content',
    resolveId(id) {
      return id === VIRTUAL ? RESOLVED : undefined;
    },
    load(id) {
      if (id !== RESOLVED) return undefined;
      const { content, files } = loadContent(root);
      files.forEach((f) => this.addWatchFile(f));
      return `export default ${JSON.stringify(content)};`;
    },
    handleHotUpdate({ file, server }) {
      if (!resolve(file).startsWith(root) || file.endsWith('.ts')) return;
      const mod = server.moduleGraph.getModuleById(RESOLVED);
      if (mod) server.moduleGraph.invalidateModule(mod);
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
