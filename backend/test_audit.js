import mongoose from 'mongoose';

const BASE = 'http://localhost:5000/api';

let ownerCookie = '';
let adminCookie = '';
let memberCookie = '';
let viewerCookie = '';
let unrelatedCookie = '';

let ownerUserId = '';
let adminUserId = '';
let memberUserId = '';
let viewerUserId = '';

let createdProjectId = '';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    failed++;
  }
}

async function req(url, method, data = null, cookie = '') {
  const opts = { method, headers: {} };
  if (data) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(data);
  }
  if (cookie) {
    opts.headers['Cookie'] = cookie;
  }
  const res = await fetch(url, opts);
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body, cookies: res.headers.get('set-cookie') };
}

function parseCookie(setCookie) {
  if (!setCookie) return '';
  const match = setCookie.match(/(devflow_access_token=[^;]+)/);
  return match ? match[1] : '';
}

async function setup() {
  const m = await import('./config/db.js');
  await m.default();
  await import('./server.js');

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await mongoose.connection.db?.dropDatabase();

  const users = ['owner', 'admin', 'member', 'viewer', 'unrelated'];
  for (const u of users) {
    await req(`${BASE}/auth/register`, 'POST', {
      name: `${u} User`,
      email: `${u}@example.com`,
      password: 'password123',
    });
  }

  const getCookieFor = async (email) => {
    const r = await req(`${BASE}/auth/login`, 'POST', { email, password: 'password123' });
    return { cookie: parseCookie(r.cookies), id: r.body.data.id };
  };

  const o = await getCookieFor('owner@example.com');
  ownerCookie = o.cookie; ownerUserId = o.id;

  const a = await getCookieFor('admin@example.com');
  adminCookie = a.cookie; adminUserId = a.id;

  const m2 = await getCookieFor('member@example.com');
  memberCookie = m2.cookie; memberUserId = m2.id;

  const v = await getCookieFor('viewer@example.com');
  viewerCookie = v.cookie; viewerUserId = v.id;

  const u = await getCookieFor('unrelated@example.com');
  unrelatedCookie = u.cookie;

  // Create Project
  const projRes = await req(`${BASE}/projects`, 'POST', { name: 'Audit Proj' }, ownerCookie);
  createdProjectId = projRes.body.data._id;

  // Add members
  await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: adminUserId, role: 'admin' }, ownerCookie);
  await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: memberUserId, role: 'member' }, ownerCookie);
  await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: viewerUserId, role: 'viewer' }, ownerCookie);
}

async function testAuthenticationAndAuthorization() {
  console.log('\n--- AUTHENTICATION & AUTHORIZATION ---');

  let r = await req(`${BASE}/projects/${createdProjectId}/audit`, 'GET');
  assert(r.status === 401, 'Unauthenticated request → 401');

  r = await req(`${BASE}/projects/${createdProjectId}/audit`, 'GET', null, ownerCookie);
  assert(r.status === 200, 'Owner can access');

  r = await req(`${BASE}/projects/${createdProjectId}/audit`, 'GET', null, adminCookie);
  assert(r.status === 200, 'Admin can access');

  r = await req(`${BASE}/projects/${createdProjectId}/audit`, 'GET', null, memberCookie);
  assert(r.status === 403, 'Member rejected → 403');

  r = await req(`${BASE}/projects/${createdProjectId}/audit`, 'GET', null, viewerCookie);
  assert(r.status === 403, 'Viewer rejected → 403');

  r = await req(`${BASE}/projects/${createdProjectId}/audit`, 'GET', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user rejected → 403');

  r = await req(`${BASE}/projects/invalidId/audit`, 'GET', null, ownerCookie);
  assert(r.status === 400, 'Malformed project ID → 400');
}

async function testDataIntegrityAndAuditGeneration() {
  console.log('\n--- DATA INTEGRITY & AUDIT GENERATION ---');
  
  let r = await req(`${BASE}/projects/${createdProjectId}/audit`, 'GET', null, ownerCookie);
  let logs = r.body.data;
  
  let addLogs = logs.filter(l => l.action === 'member_added');
  assert(addLogs.length === 3, 'member_added actions logged for all 3 members');
  
  assert(!logs.some(l => l.ipAddress !== undefined), 'ipAddress is stripped from API response');
  assert(addLogs[0].actor.name && addLogs[0].actor.email && !addLogs[0].actor.passwordHash, 'Actor uses safe fields only');

  // Change Role
  let patchRes = await req(`${BASE}/projects/${createdProjectId}/members/${viewerUserId}`, 'PATCH', { role: 'member' }, adminCookie);
  if (patchRes.status !== 200) console.log('PATCH failed:', patchRes.body);
  
  r = await req(`${BASE}/projects/${createdProjectId}/audit`, 'GET', null, adminCookie);
  logs = r.body.data;
  let roleChangeLogs = logs.filter(l => l.action === 'role_changed');
  const match = roleChangeLogs.length === 1 && (roleChangeLogs[0].targetUser?.id === viewerUserId || roleChangeLogs[0].targetUser?._id === viewerUserId);
  assert(match, 'role_changed logged correctly');
  if (!match) console.log('DEBUG:', roleChangeLogs[0]);
  assert(roleChangeLogs[0]?.actor?.id === adminUserId || roleChangeLogs[0]?.actor?._id === adminUserId, 'Actor identified as Admin');

  // Remove Member
  let delRes = await req(`${BASE}/projects/${createdProjectId}/members/${viewerUserId}`, 'DELETE', null, adminCookie);
  if (delRes.status !== 200) console.log('DELETE failed:', delRes.body);
  
  r = await req(`${BASE}/projects/${createdProjectId}/audit`, 'GET', null, adminCookie);
  logs = r.body.data;
  let removeLogs = logs.filter(l => l.action === 'member_removed');
  const matchRm = removeLogs.length === 1 && (removeLogs[0].targetUser?.id === viewerUserId || removeLogs[0].targetUser?._id === viewerUserId);
  assert(matchRm, 'member_removed logged correctly');
  if (!matchRm) console.log('DEBUG RM:', removeLogs[0]);
  
  // Delete Project
  await req(`${BASE}/projects/${createdProjectId}`, 'DELETE', null, ownerCookie);
  
  r = await req(`${BASE}/projects/${createdProjectId}/audit`, 'GET', null, ownerCookie);
  assert(r.status === 404, 'Project is gone, returns 404');

  const AuditLog = (await import('./models/AuditLog.js')).default;
  const rawLogs = await AuditLog.find({ project: createdProjectId }).lean();
  let delLogs = rawLogs.filter(l => l.action === 'project_deleted');
  assert(delLogs.length === 1 && delLogs[0].actor.toString() === ownerUserId, 'project_deleted logged properly in DB');
}

async function run() {
  try {
    await setup();
    await testAuthenticationAndAuthorization();
    await testDataIntegrityAndAuditGeneration();
  } catch (err) {
    console.error('UNEXPECTED ERROR:', err);
    failed++;
  } finally {
    console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
    await mongoose.connection.db?.dropDatabase();
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
