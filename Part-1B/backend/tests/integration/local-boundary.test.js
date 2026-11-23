import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../../src/config.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

describe('local-only inbound boundary', () => {
  it('binds Express and Vite explicitly to loopback', () => {
    const server = fs.readFileSync(path.join(root, 'backend/src/server.js'), 'utf8');
    const vite = fs.readFileSync(path.join(root, 'frontend/vite.config.js'), 'utf8');
    expect(loadConfig({}).host).toBe('127.0.0.1'); expect(server).toContain('listen(config.port, config.host');
    expect(vite).toContain("host: '127.0.0.1'");
    expect(server).not.toMatch(/listen\([^\n]*['"]0\.0\.0\.0/);
    expect(vite).not.toContain("host: '0.0.0.0'");
  });
  it('does not allow runtime configuration to override the listener host', () => {
    expect(loadConfig({ HOST: '0.0.0.0', PORT: '4000' })).toMatchObject({ host: '127.0.0.1', port: 4000 });
  });
});
