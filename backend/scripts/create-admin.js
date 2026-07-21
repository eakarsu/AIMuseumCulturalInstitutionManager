import bcrypt from 'bcryptjs';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pool from '../db.js';

export async function main(env = process.env, database = pool) {
  if (env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin is required');
  }
  const email = String(env.PROVISION_ADMIN_EMAIL || env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(env.PROVISION_ADMIN_PASSWORD || env.ADMIN_PASSWORD || '');
  const name = String(env.PROVISION_ADMIN_NAME || env.BOOTSTRAP_ADMIN_NAME || 'Museum Administrator').trim();
  const organizationName = String(env.PROVISION_COMPANY_NAME || env.BOOTSTRAP_TENANT_NAME || 'Museum Operations').trim();
  if (!email.includes('@') || password.length < 12 || !name || !organizationName) {
    throw new Error('A valid email, 12-character password, administrator name, and organization are required');
  }

  const client = await database.connect();
  try {
    await client.query('BEGIN');
    let organization = (await client.query('SELECT id FROM organizations WHERE name=$1 ORDER BY created_at LIMIT 1', [organizationName])).rows[0];
    if (!organization) {
      organization = (await client.query('INSERT INTO organizations(name) VALUES($1) RETURNING id', [organizationName])).rows[0];
    }
    const user = (await client.query(
      `INSERT INTO users(email,password,name,role,tenant_id)
       VALUES($1,$2,$3,'admin',$4)
       ON CONFLICT(email) DO UPDATE SET
         password=EXCLUDED.password,
         name=EXCLUDED.name,
         role='admin',
         tenant_id=EXCLUDED.tenant_id
       RETURNING id`,
      [email, await bcrypt.hash(password, 12), name, organization.id],
    )).rows[0];
    await client.query(
      `INSERT INTO tenant_memberships(tenant_id,user_id,role,active)
       VALUES($1,$2,'admin',TRUE)
       ON CONFLICT(tenant_id,user_id) DO UPDATE SET role='admin',active=TRUE`,
      [organization.id, user.id],
    );
    await client.query('COMMIT');
    console.log(`Provisioned museum administrator ${email}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  }).finally(() => pool.end());
}
