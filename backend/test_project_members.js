import mongoose from 'mongoose';

const BASE = 'http://localhost:5000/api';

let ownerCookie = '';
let memberCookie = '';
let unrelatedCookie = '';

let ownerUserId = '';
let memberUserId = '';
let unrelatedUserId = '';

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
  // Import and start server + DB
  const m = await import('./config/db.js');
  await m.default();
  await import('./server.js');

  // Wait for server to boot
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Clean DB
  await mongoose.connection.db?.dropDatabase();

  // Register three users: owner, member, unrelated
  await req(`${BASE}/auth/register`, 'POST', {
    name: 'Owner User',
    email: 'owner@example.com',
    password: 'password123',
  });
  await req(`${BASE}/auth/register`, 'POST', {
    name: 'Member User',
    email: 'member@example.com',
    password: 'password123',
  });
  await req(`${BASE}/auth/register`, 'POST', {
    name: 'Unrelated User',
    email: 'unrelated@example.com',
    password: 'password123',
  });

  // Login each user and store cookies
  let r = await req(`${BASE}/auth/login`, 'POST', {
    email: 'owner@example.com',
    password: 'password123',
  });
  ownerCookie = parseCookie(r.cookies);
  ownerUserId = r.body.data.id;

  r = await req(`${BASE}/auth/login`, 'POST', {
    email: 'member@example.com',
    password: 'password123',
  });
  memberCookie = parseCookie(r.cookies);
  memberUserId = r.body.data.id;

  r = await req(`${BASE}/auth/login`, 'POST', {
    email: 'unrelated@example.com',
    password: 'password123',
  });
  unrelatedCookie = parseCookie(r.cookies);
  unrelatedUserId = r.body.data.id;

  // Create a project for the owner
  r = await req(`${BASE}/projects`, 'POST', {
    name: 'Membership Test Project',
  }, ownerCookie);
  createdProjectId = r.body.data._id;
}

async function testAuthentication() {
  console.log('\n--- AUTHENTICATION ---');

  let r = await req(`${BASE}/projects/${createdProjectId}/members`, 'GET');
  assert(r.status === 401, 'GET members without authentication → 401');

  r = await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: memberUserId });
  assert(r.status === 401, 'POST member without authentication → 401');

  r = await req(`${BASE}/projects/${createdProjectId}/members/${memberUserId}`, 'DELETE');
  assert(r.status === 401, 'DELETE member without authentication → 401');
}

async function testPostMember() {
  console.log('\n--- POST MEMBER ---');

  // Regular member cannot add users (wait, not a member yet, let's make unrelated try)
  let r = await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: memberUserId }, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user cannot add users → 403');

  // Invalid projectId
  r = await req(`${BASE}/projects/not-an-id/members`, 'POST', { userId: memberUserId }, ownerCookie);
  assert(r.status === 400, 'Invalid projectId → 400');

  // Invalid userId
  r = await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: 'not-an-id' }, ownerCookie);
  assert(r.status === 400, 'Invalid userId → 400');

  // Nonexistent user
  r = await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: '507f1f77bcf86cd799439011' }, ownerCookie);
  assert(r.status === 404, 'Nonexistent user → 404');

  // Owner cannot add themselves
  r = await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: ownerUserId }, ownerCookie);
  assert(r.status === 400, 'Owner cannot add themselves → 400');

  // Owner can add existing user
  r = await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: memberUserId }, ownerCookie);
  assert(r.status === 200, 'Owner can add existing user → 200');
  
  // Duplicate member
  r = await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: memberUserId }, ownerCookie);
  assert(r.status === 409, 'Duplicate member → 409 appropriate error');

  // Now member is actually a member, verify they cannot add users either
  r = await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: unrelatedUserId }, memberCookie);
  assert(r.status === 403, 'Regular member cannot add users → 403');
}

async function testGetMembers() {
  console.log('\n--- GET MEMBERS ---');

  // Regular member can get members list in M3
  let r = await req(`${BASE}/projects/${createdProjectId}/members`, 'GET', null, memberCookie);
  assert(r.status === 200, 'Regular member can view membership → 200');

  // Unrelated authenticated user cannot get members list
  r = await req(`${BASE}/projects/${createdProjectId}/members`, 'GET', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated authenticated user cannot manage membership → 403');

  // Owner can get members
  r = await req(`${BASE}/projects/${createdProjectId}/members`, 'GET', null, ownerCookie);
  assert(r.status === 200, 'Owner can get members → 200');
  assert(r.body.data.length === 1, 'Member list contains the new member exactly once');
  
  const fetchedMember = r.body.data[0];
  assert(fetchedMember.id === memberUserId, 'Returns correct member');
  assert(fetchedMember.passwordHash === undefined, 'Sensitive User fields are not exposed');

  // Invalid projectId
  r = await req(`${BASE}/projects/not-an-id/members`, 'GET', null, ownerCookie);
  assert(r.status === 400, 'Invalid projectId → 400');

  // Missing/nonexistent project
  r = await req(`${BASE}/projects/507f1f77bcf86cd799439011/members`, 'GET', null, ownerCookie);
  assert(r.status === 404, 'Missing/nonexistent project → 404');
}

async function testDeleteMember() {
  console.log('\n--- DELETE MEMBER ---');

  // Unrelated user cannot remove members
  let r = await req(`${BASE}/projects/${createdProjectId}/members/${memberUserId}`, 'DELETE', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user cannot remove members → 403');

  // Regular member cannot remove members
  r = await req(`${BASE}/projects/${createdProjectId}/members/${memberUserId}`, 'DELETE', null, memberCookie);
  assert(r.status === 403, 'Regular member cannot remove members → 403');

  // Invalid projectId
  r = await req(`${BASE}/projects/not-an-id/members/${memberUserId}`, 'DELETE', null, ownerCookie);
  assert(r.status === 400, 'Invalid projectId → 400');

  // Invalid userId
  r = await req(`${BASE}/projects/${createdProjectId}/members/not-an-id`, 'DELETE', null, ownerCookie);
  assert(r.status === 400, 'Invalid userId → 400');

  // Removing nonexistent member
  r = await req(`${BASE}/projects/${createdProjectId}/members/507f1f77bcf86cd799439011`, 'DELETE', null, ownerCookie);
  assert(r.status === 404, 'Removing nonexistent member → 404 appropriate error');

  // Owner cannot remove themselves
  r = await req(`${BASE}/projects/${createdProjectId}/members/${ownerUserId}`, 'DELETE', null, ownerCookie);
  assert(r.status === 400, 'Owner cannot remove themselves → 400');

  // Add another member to test "Removing one member leaves other members intact"
  await req(`${BASE}/projects/${createdProjectId}/members`, 'POST', { userId: unrelatedUserId }, ownerCookie);

  // Owner can remove existing member
  r = await req(`${BASE}/projects/${createdProjectId}/members/${memberUserId}`, 'DELETE', null, ownerCookie);
  assert(r.status === 200, 'Owner can remove existing member → 200');

  // Verify other member intact
  r = await req(`${BASE}/projects/${createdProjectId}/members`, 'GET', null, ownerCookie);
  assert(r.body.data.length === 1 && r.body.data[0].id === unrelatedUserId, 'Removing one member leaves other members intact');
}

async function run() {
  try {
    await setup();
    await testAuthentication();
    await testPostMember();
    await testGetMembers();
    await testDeleteMember();
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
