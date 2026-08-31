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
let unrelatedUserId = '';

let projectId = '';
let taskId = '';

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

  const users = [
    { name: 'Owner', email: 'owner@example.com' },
    { name: 'Admin', email: 'admin@example.com' },
    { name: 'Member', email: 'member@example.com' },
    { name: 'Viewer', email: 'viewer@example.com' },
    { name: 'Unrelated', email: 'unrelated@example.com' },
  ];

  const cookies = {};
  const ids = {};

  for (const u of users) {
    await req(`${BASE}/auth/register`, 'POST', { ...u, password: 'password123' });
    const r = await req(`${BASE}/auth/login`, 'POST', { email: u.email, password: 'password123' });
    cookies[u.name.toLowerCase()] = parseCookie(r.cookies);
    ids[u.name.toLowerCase()] = r.body.data.id;
  }

  ownerCookie = cookies.owner;
  adminCookie = cookies.admin;
  memberCookie = cookies.member;
  viewerCookie = cookies.viewer;
  unrelatedCookie = cookies.unrelated;

  ownerUserId = ids.owner;
  adminUserId = ids.admin;
  memberUserId = ids.member;
  viewerUserId = ids.viewer;
  unrelatedUserId = ids.unrelated;

  // Create Project
  const p = await req(`${BASE}/projects`, 'POST', { name: 'RBAC Project' }, ownerCookie);
  projectId = p.body.data._id;

  // Add members manually via DB to skip API for initial setup
  const ProjectModel = (await import('./models/Project.js')).default;
  await ProjectModel.findByIdAndUpdate(projectId, {
    $push: {
      members: { $each: [
        { user: adminUserId, role: 'admin' },
        { user: memberUserId, role: 'member' },
        { user: viewerUserId, role: 'viewer' }
      ]}
    }
  });
}

async function testAuthentication() {
  console.log('\n--- AUTHENTICATION ---');
  let r = await req(`${BASE}/projects/${projectId}`, 'GET');
  assert(r.status === 401, 'Unauthenticated request → 401');
}

async function testProjectAccess() {
  console.log('\n--- PROJECT ACCESS ---');
  assert((await req(`${BASE}/projects/${projectId}`, 'GET', null, ownerCookie)).status === 200, 'Owner can access');
  assert((await req(`${BASE}/projects/${projectId}`, 'GET', null, adminCookie)).status === 200, 'Admin can access');
  assert((await req(`${BASE}/projects/${projectId}`, 'GET', null, memberCookie)).status === 200, 'Member can access');
  assert((await req(`${BASE}/projects/${projectId}`, 'GET', null, viewerCookie)).status === 200, 'Viewer can access');
  assert((await req(`${BASE}/projects/${projectId}`, 'GET', null, unrelatedCookie)).status === 403, 'Unrelated user → 403');
}

async function testProjectMutation() {
  console.log('\n--- PROJECT MUTATION ---');
  let r = await req(`${BASE}/projects/${projectId}`, 'PATCH', { name: 'Updated by Admin' }, adminCookie);
  assert(r.status === 200, 'Admin can update');

  r = await req(`${BASE}/projects/${projectId}`, 'PATCH', { name: 'Updated by Member' }, memberCookie);
  assert(r.status === 403, 'Member rejected');

  r = await req(`${BASE}/projects/${projectId}`, 'PATCH', { name: 'Updated by Viewer' }, viewerCookie);
  assert(r.status === 403, 'Viewer rejected');

  r = await req(`${BASE}/projects/${projectId}`, 'PATCH', { name: 'Updated by Unrelated' }, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user rejected');
}

async function testMembershipManagement() {
  console.log('\n--- MEMBERSHIP MANAGEMENT ---');
  
  // Register a new user to add
  await req(`${BASE}/auth/register`, 'POST', { name: 'NewUser', email: 'new@example.com', password: 'password123' });
  let r = await req(`${BASE}/auth/login`, 'POST', { email: 'new@example.com', password: 'password123' });
  const newUserId = r.body.data.id;

  r = await req(`${BASE}/projects/${projectId}/members`, 'POST', { userId: newUserId, role: 'viewer' }, viewerCookie);
  assert(r.status === 403, 'Viewer rejected from adding member');

  r = await req(`${BASE}/projects/${projectId}/members`, 'POST', { userId: newUserId, role: 'viewer' }, memberCookie);
  assert(r.status === 403, 'Member rejected from adding member');

  r = await req(`${BASE}/projects/${projectId}/members`, 'POST', { userId: newUserId, role: 'viewer' }, adminCookie);
  assert(r.status === 200, 'Admin can add members');

  r = await req(`${BASE}/projects/${projectId}/members/${newUserId}`, 'PATCH', { role: 'member' }, adminCookie);
  assert(r.status === 200, 'Admin can change non-owner roles (viewer -> member)');

  // Owner protection
  r = await req(`${BASE}/projects/${projectId}/members/${ownerUserId}`, 'DELETE', null, adminCookie);
  assert(r.status === 400, 'Admin cannot remove owner');

  r = await req(`${BASE}/projects/${projectId}/members/${ownerUserId}`, 'PATCH', { role: 'member' }, adminCookie);
  assert(r.status === 400, 'Admin cannot change owner\'s role');

  r = await req(`${BASE}/projects/${projectId}/members/${newUserId}`, 'DELETE', null, adminCookie);
  assert(r.status === 200, 'Admin can remove non-owner members');
}

async function testTaskManagement() {
  console.log('\n--- TASK MANAGEMENT ---');

  let r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', { title: 'Viewer Task' }, viewerCookie);
  assert(r.status === 403, 'Viewer rejected from creating task');

  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', { title: 'Member Task' }, memberCookie);
  assert(r.status === 201, 'Member can create task');
  taskId = r.body.data._id;

  r = await req(`${BASE}/tasks/${taskId}`, 'PATCH', { status: 'in_progress' }, viewerCookie);
  assert(r.status === 403, 'Viewer rejected from updating task');

  r = await req(`${BASE}/tasks/${taskId}`, 'PATCH', { status: 'in_progress' }, memberCookie);
  assert(r.status === 200, 'Member can update task');

  r = await req(`${BASE}/tasks/${taskId}`, 'GET', null, viewerCookie);
  assert(r.status === 200, 'Viewer can read task');

  r = await req(`${BASE}/tasks/${taskId}`, 'GET', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user rejected from reading task');

  r = await req(`${BASE}/tasks/${taskId}`, 'DELETE', null, viewerCookie);
  assert(r.status === 403, 'Viewer rejected from deleting task');

  r = await req(`${BASE}/tasks/${taskId}`, 'DELETE', null, memberCookie);
  assert(r.status === 200, 'Member can delete task');
}

async function testProjectDeletion() {
  console.log('\n--- PROJECT DELETION ---');
  let r = await req(`${BASE}/projects/${projectId}`, 'DELETE', null, viewerCookie);
  assert(r.status === 403, 'Viewer rejected from deleting project');

  r = await req(`${BASE}/projects/${projectId}`, 'DELETE', null, memberCookie);
  assert(r.status === 403, 'Member rejected from deleting project');

  r = await req(`${BASE}/projects/${projectId}`, 'DELETE', null, adminCookie);
  assert(r.status === 403, 'Admin rejected from deleting project unless explicitly allowed (owner only)');

  r = await req(`${BASE}/projects/${projectId}`, 'DELETE', null, ownerCookie);
  assert(r.status === 200, 'Owner can delete project');
}

async function run() {
  try {
    await setup();
    await testAuthentication();
    await testProjectAccess();
    await testProjectMutation();
    await testMembershipManagement();
    await testTaskManagement();
    await testProjectDeletion();
  } catch (err) {
    console.error('UNEXPECTED ERROR:', err);
  } finally {
    console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
    await mongoose.connection.db?.dropDatabase();
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
