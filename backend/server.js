import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import pool from './db.js';
import buildGovernedOperations from './routes/governedOperations.js';
import aiRoutes from './routes/ai.js';

dotenv.config({path:'../.env'});
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('JWT_SECRET must contain at least 32 characters');
const app=express();
const allowedOrigins=(process.env.ALLOWED_ORIGINS||'').split(',').map((value)=>value.trim()).filter(Boolean);
app.use(helmet());
app.use(cors({credentials:true,origin:(origin,callback)=>(!origin||allowedOrigins.includes(origin))?callback(null,true):callback(new Error('origin not allowed'))}));
app.use(express.json({limit:'2mb'}));

export function authenticateToken(req,res,next){const header=req.headers.authorization||'';const token=header.startsWith('Bearer ')?header.slice(7):null;if(!token)return res.status(401).json({error:'Access token required'});try{req.user=jwt.verify(token,process.env.JWT_SECRET,{issuer:'museum-cultural-manager'});next();}catch(_){res.status(401).json({error:'Invalid or expired token'});}}
app.get('/api/health',(_req,res)=>res.json({status:'ok',service:'museum-cultural-manager'}));
app.post('/api/auth/login',async(req,res)=>{try{const {email,password}=req.body||{};if(!email||!password)return res.status(400).json({error:'email and password are required'});const result=await pool.query(`SELECT u.id,u.email,u.password,u.name,m.tenant_id,m.role FROM users u LEFT JOIN tenant_memberships m ON m.user_id=u.id AND m.active=TRUE WHERE LOWER(u.email)=LOWER($1) LIMIT 1`,[email]);const row=result.rows[0];if(!row||!await bcrypt.compare(password,row.password))return res.status(401).json({error:'Invalid credentials'});const user={id:row.id,email:row.email,name:row.name,tenantId:row.tenant_id||null,role:row.role||'unassigned'};const token=jwt.sign(user,process.env.JWT_SECRET,{expiresIn:process.env.JWT_TTL||'1h',issuer:'museum-cultural-manager'});res.json({token,user});}catch(_){res.status(500).json({error:'Login failed'});}});
app.get('/api/auth/me',authenticateToken,async(req,res)=>{try{const result=await pool.query(`SELECT u.id,u.email,u.name,m.tenant_id,m.role FROM users u JOIN tenant_memberships m ON m.user_id=u.id AND m.tenant_id=$2 AND m.active=TRUE WHERE u.id=$1 LIMIT 1`,[req.user.id,req.user.tenantId]);const row=result.rows[0];if(!row)return res.status(401).json({error:'Identity is no longer active'});res.json({user:{id:row.id,email:row.email,name:row.name,tenantId:row.tenant_id,role:row.role}});}catch(_){res.status(500).json({error:'Session lookup failed'});}});
app.use('/api/ai',authenticateToken,aiRoutes);
app.use('/api/governed-operations',buildGovernedOperations(authenticateToken));
// Generated CRUD, autonomous, visitor-agent, and gap routes are intentionally unmounted.
app.use('/api',(_req,res)=>res.status(404).json({error:'Not found'}));
async function initializeRuntime(){
 if(process.env.MIGRATE_ON_START!=='true')return;
 const email=process.env.PROVISION_ADMIN_EMAIL||process.env.ADMIN_EMAIL;
 const password=process.env.PROVISION_ADMIN_PASSWORD||process.env.ADMIN_PASSWORD;
 if(!email||!password)throw new Error('Runtime admin credentials are required');
 await pool.query(`
  CREATE TABLE IF NOT EXISTS organizations(id UUID PRIMARY KEY,name TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
  CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,email VARCHAR UNIQUE NOT NULL,password VARCHAR NOT NULL,name VARCHAR NOT NULL,role VARCHAR NOT NULL DEFAULT 'admin',tenant_id UUID,created_at TIMESTAMPTZ DEFAULT NOW());
  ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID;
  CREATE TABLE IF NOT EXISTS tenant_memberships(tenant_id UUID NOT NULL REFERENCES organizations(id),user_id INTEGER NOT NULL REFERENCES users(id),role TEXT NOT NULL,active BOOLEAN NOT NULL DEFAULT TRUE,PRIMARY KEY(tenant_id,user_id));
 `);
 const organizationName=process.env.PROVISION_COMPANY_NAME||'Museum Operations';
 let organization=(await pool.query('SELECT id FROM organizations WHERE name=$1 ORDER BY created_at LIMIT 1',[organizationName])).rows[0];
 if(!organization)organization=(await pool.query('INSERT INTO organizations(id,name) VALUES($1,$2) RETURNING id',[crypto.randomUUID(),organizationName])).rows[0];
 const user=(await pool.query(`INSERT INTO users(email,password,name,role,tenant_id) VALUES($1,$2,$3,'admin',$4) ON CONFLICT(email) DO UPDATE SET password=EXCLUDED.password,name=EXCLUDED.name,role='admin',tenant_id=EXCLUDED.tenant_id RETURNING id`,[email.toLowerCase(),await bcrypt.hash(password,12),process.env.PROVISION_ADMIN_NAME||'Runtime Administrator',organization.id])).rows[0];
 await pool.query(`INSERT INTO tenant_memberships(tenant_id,user_id,role,active) VALUES($1,$2,'admin',TRUE) ON CONFLICT(tenant_id,user_id) DO UPDATE SET role='admin',active=TRUE`,[organization.id,user.id]);
}
const port=Number(process.env.BACKEND_PORT||4000);
initializeRuntime().then(()=>app.listen(port,()=>console.log(`Governed museum API listening on ${port}`))).catch((error)=>{console.error('Runtime initialization failed:',error.message);process.exit(1);});
export default app;
