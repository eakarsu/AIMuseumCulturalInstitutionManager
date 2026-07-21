import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { main as migrate } from '../scripts/migrate.js';
import { main as provision } from '../scripts/create-admin.js';

test('migration requires an explicit schema-mutation gate', async () => {
  await assert.rejects(() => migrate({}, { connect: assert.fail }), /ALLOW_SCHEMA_MIGRATION/);
});

test('administrator provisioning binds identity to an active tenant membership', async () => {
  const statements = [];
  const client = {
    async query(sql, values) {
      statements.push([sql, values]);
      if (/SELECT id FROM organizations/.test(sql)) return { rows: [] };
      if (/INSERT INTO organizations/.test(sql)) return { rows: [{ id: 'tenant-1' }] };
      if (/INSERT INTO users/.test(sql)) return { rows: [{ id: 42 }] };
      return { rows: [] };
    },
    release() {},
  };
  await provision({
    BOOTSTRAP_ACKNOWLEDGEMENT: 'create-initial-admin',
    PROVISION_ADMIN_EMAIL: ' Museum.Admin@Example.test ',
    PROVISION_ADMIN_PASSWORD: 'A-valid-password-123!',
    PROVISION_ADMIN_NAME: 'Museum Admin',
    PROVISION_COMPANY_NAME: 'Museum One',
  }, { connect: async () => client });
  assert.ok(statements.some(([sql]) => /ON CONFLICT\(email\) DO UPDATE/.test(sql)));
  assert.ok(statements.some(([sql]) => /tenant_memberships/.test(sql)));
  assert.ok(statements.some(([sql]) => sql === 'COMMIT'));
});

test('login exposes a tenant-bound authenticated session lookup', () => {
  const server = fs.readFileSync(new URL('../server.js', import.meta.url), 'utf8');
  assert.match(server, /app\.get\('\/api\/auth\/me',authenticateToken/);
  assert.match(server, /m\.tenant_id=\$2/);
});

test('operator entrypoints resolve symlinked main-module paths', () => {
  for (const file of ['../scripts/migrate.js', '../scripts/create-admin.js']) {
    const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(source, /realpathSync\(process\.argv\[1\]\)/);
    assert.match(source, /fileURLToPath\(import\.meta\.url\)/);
  }
});
