import mongoose from 'mongoose';

const BASE = 'http://localhost:5000/api';

let ownerCookie = '';
let memberCookie = '';
let unrelatedCookie = '';
let ownerUserId = '';
let memberUserId = '';
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
}

async function testAuthentication() {
  console.log('\n--- AUTHENTICATION ---');

  let r = await req(`${BASE}/projects`, 'GET');
  assert(r.status === 401, 'GET /projects without auth → 401');

  r = await req(`${BASE}/projects`, 'POST', { name: 'Test' });
  assert(r.status === 401, 'POST /projects without auth → 401');

  r = await req(`${BASE}/projects/507f1f77bcf86cd799439011`, 'GET');
  assert(r.status === 401, 'GET /projects/:id without auth → 401');

  r = await req(`${BASE}/projects/507f1f77bcf86cd799439011`, 'PATCH', { name: 'X' });
  assert(r.status === 401, 'PATCH /projects/:id without auth → 401');

  r = await req(`${BASE}/projects/507f1f77bcf86cd799439011`, 'DELETE');
  assert(r.status === 401, 'DELETE /projects/:id without auth → 401');
}

async function testCreation() {
  console.log('\n--- CREATION ---');

  // Valid project
  let r = await req(`${BASE}/projects`, 'POST', {
    name: 'My Project',
    description: 'A test project',
  }, ownerCookie);
  assert(r.status === 201, 'Valid project → 201');
  assert(r.body.data.name === 'My Project', 'Name matches');
  assert(r.body.data.owner === ownerUserId, 'Authenticated user becomes owner');
  assert(r.body.data.status === 'planning', 'Default status is planning');
  assert(r.body.data.priority === 'medium', 'Default priority is medium');
  assert(Array.isArray(r.body.data.members) && r.body.data.members.length === 0, 'Members array is empty');
  createdProjectId = r.body.data._id;

  // Client cannot override owner
  r = await req(`${BASE}/projects`, 'POST', {
    name: 'Hijacked Project',
    owner: memberUserId,
  }, ownerCookie);
  assert(r.status === 201, 'Project created even with client-supplied owner');
  assert(r.body.data.owner === ownerUserId, 'Client cannot override owner');
  // Clean up this extra project
  await req(`${BASE}/projects/${r.body.data._id}`, 'DELETE', null, ownerCookie);

  // Missing name → 400
  r = await req(`${BASE}/projects`, 'POST', {
    description: 'No name',
  }, ownerCookie);
  assert(r.status === 400, 'Missing name → 400');

  // Invalid status → 400
  r = await req(`${BASE}/projects`, 'POST', {
    name: 'Bad Status',
    status: 'invalid_status',
  }, ownerCookie);
  assert(r.status === 400, 'Invalid status → 400');

  // Invalid priority → 400
  r = await req(`${BASE}/projects`, 'POST', {
    name: 'Bad Priority',
    priority: 'critical',
  }, ownerCookie);
  assert(r.status === 400, 'Invalid priority → 400');

  // Name too long → 400
  r = await req(`${BASE}/projects`, 'POST', {
    name: 'A'.repeat(101),
  }, ownerCookie);
  assert(r.status === 400, 'Name too long → 400');
}

async function testListing() {
  console.log('\n--- LISTING ---');

  // Owner sees project
  let r = await req(`${BASE}/projects`, 'GET', null, ownerCookie);
  assert(r.status === 200, 'GET /projects → 200');
  assert(r.body.data.length >= 1, 'Owner sees their project');

  // Unrelated user sees empty list
  r = await req(`${BASE}/projects`, 'GET', null, unrelatedCookie);
  assert(r.status === 200, 'Unrelated user GET /projects → 200');
  assert(r.body.data.length === 0, 'Unrelated user receives []');

  // Add member to project manually for membership tests
  const Project = (await import('./models/Project.js')).default;
  await Project.findByIdAndUpdate(createdProjectId, {
    $addToSet: { members: memberUserId },
  });

  // Member sees project
  r = await req(`${BASE}/projects`, 'GET', null, memberCookie);
  assert(r.status === 200, 'Member GET /projects → 200');
  assert(r.body.data.some((p) => p._id === createdProjectId), 'Member sees project they belong to');
}

async function testSingleProject() {
  console.log('\n--- SINGLE PROJECT ---');

  // Owner can retrieve
  let r = await req(`${BASE}/projects/${createdProjectId}`, 'GET', null, ownerCookie);
  assert(r.status === 200, 'Owner can retrieve project');
  assert(r.body.data._id === createdProjectId, 'Correct project returned');

  // Member can retrieve
  r = await req(`${BASE}/projects/${createdProjectId}`, 'GET', null, memberCookie);
  assert(r.status === 200, 'Member can retrieve project');

  // Unrelated user receives 403
  r = await req(`${BASE}/projects/${createdProjectId}`, 'GET', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user receives 403');

  // Nonexistent project → 404
  r = await req(`${BASE}/projects/507f1f77bcf86cd799439011`, 'GET', null, ownerCookie);
  assert(r.status === 404, 'Nonexistent project → 404');

  // Malformed ObjectId handled cleanly
  r = await req(`${BASE}/projects/not-an-id`, 'GET', null, ownerCookie);
  assert(r.status === 400, 'Malformed ObjectId → 400');
}

async function testUpdating() {
  console.log('\n--- UPDATING ---');

  // Owner can update
  let r = await req(`${BASE}/projects/${createdProjectId}`, 'PATCH', {
    name: 'Updated Project',
    status: 'active',
  }, ownerCookie);
  assert(r.status === 200, 'Owner can update project');
  assert(r.body.data.name === 'Updated Project', 'Name updated correctly');
  assert(r.body.data.status === 'active', 'Status updated correctly');

  // Member receives 403
  r = await req(`${BASE}/projects/${createdProjectId}`, 'PATCH', {
    name: 'Hijack Attempt',
  }, memberCookie);
  assert(r.status === 403, 'Member receives 403 on update');

  // Unrelated user receives 403
  r = await req(`${BASE}/projects/${createdProjectId}`, 'PATCH', {
    name: 'Another Hijack',
  }, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user receives 403 on update');

  // Owner cannot change owner
  r = await req(`${BASE}/projects/${createdProjectId}`, 'PATCH', {
    owner: memberUserId,
  }, ownerCookie);
  // Should either succeed but not change owner, or return 400 for no valid fields
  const project = r.body.data;
  if (r.status === 200) {
    assert(project.owner === ownerUserId, 'Owner field not changed despite being in body');
  } else {
    assert(r.status === 400, 'Rejected because owner is not an allowed update field');
  }

  // Owner cannot change members through PATCH
  r = await req(`${BASE}/projects/${createdProjectId}`, 'PATCH', {
    members: [],
  }, ownerCookie);
  if (r.status === 200) {
    assert(r.body.data.members.length > 0, 'Members not changed via PATCH');
  } else {
    assert(r.status === 400, 'Rejected because members is not an allowed update field');
  }

  // Invalid update data → 400
  r = await req(`${BASE}/projects/${createdProjectId}`, 'PATCH', {
    status: 'bogus_status',
  }, ownerCookie);
  assert(r.status === 400, 'Invalid status update → 400');
}

async function testDeletion() {
  console.log('\n--- DELETION ---');

  // Create a project specifically for deletion tests
  let r = await req(`${BASE}/projects`, 'POST', {
    name: 'To Delete',
  }, ownerCookie);
  const deleteId = r.body.data._id;

  // Add member for authorization test
  const Project = (await import('./models/Project.js')).default;
  await Project.findByIdAndUpdate(deleteId, {
    $addToSet: { members: memberUserId },
  });

  // Member receives 403
  r = await req(`${BASE}/projects/${deleteId}`, 'DELETE', null, memberCookie);
  assert(r.status === 403, 'Member receives 403 on delete');

  // Unrelated user receives 403
  r = await req(`${BASE}/projects/${deleteId}`, 'DELETE', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user receives 403 on delete');

  // Owner can delete
  r = await req(`${BASE}/projects/${deleteId}`, 'DELETE', null, ownerCookie);
  assert(r.status === 200, 'Owner can delete project');
  assert(r.body.success === true, 'Delete returns success: true');

  // Nonexistent project → 404
  r = await req(`${BASE}/projects/${deleteId}`, 'DELETE', null, ownerCookie);
  assert(r.status === 404, 'Already-deleted project → 404');

  // Truly nonexistent ID → 404
  r = await req(`${BASE}/projects/507f1f77bcf86cd799439011`, 'DELETE', null, ownerCookie);
  assert(r.status === 404, 'Nonexistent project → 404');
}

async function run() {
  try {
    await setup();
    await testAuthentication();
    await testCreation();
    await testListing();
    await testSingleProject();
    await testUpdating();
    await testDeletion();
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
