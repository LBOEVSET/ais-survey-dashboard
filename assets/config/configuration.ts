import 'dotenv/config';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

function expandEnv(input: string, { strict = false } = {}) {
  return input.replace(/\$\{([\w.-]+)(?::-(.*?))?\}/g, (_m, name, def) => {
    const val = process.env[name];
    if (val !== undefined && val !== null && val !== '') return String(val);
    if (def !== undefined) return def;                // supports ${FOO:-default}
    if (strict) throw new Error(`Missing env var: ${name}`);
    return '';                                        // or return _m to keep unresolved
  });
}

function loadYamlWithEnv(path: string, opts?: { strict?: boolean }) {
  const raw = readFileSync(path, 'utf8');
  const expanded = expandEnv(raw, opts);
  return yaml.load(expanded) as Record<string, any>;
}

// usage
const zone = process.env.ZONE ?? 'local';
const cfgPath = join(process.cwd(), 'assets', 'config', `${zone}.config.yaml`);

export const ApplicationConfig = loadYamlWithEnv(cfgPath, { strict: true });
export const TestGetConfig = loadYamlWithEnv(cfgPath);
