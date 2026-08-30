import mongoose from 'mongoose';

const BASE = 'http://localhost:5000/api';

let ownerCookie = '';
let memberCookie = '';
let unrelatedCookie = '';
let ownerUserId = '';
let memberUserId = '';
let unrelatedUserId = '';
let projectId = '';
let createdTaskId = '';

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
  if (!res.ok && body && body.error) {
    console.log(`[Error] ${res.status} — ${body.error}`);
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

  // Create project
  const p = await req(`${BASE}/projects`, 'POST', {
    name: 'Task Project',
  }, ownerCookie);
  projectId = p.body.data.id || p.body.data._id;

  // Add member
  await req(`${BASE}/projects/${projectId}/members`, 'POST', {
    userId: memberUserId,
  }, ownerCookie);
}

async function run() {
  await setup();

  console.log('\n--- AUTHENTICATION ---');
  let r = await req(`${BASE}/projects/${projectId}/tasks`, 'GET');
  assert(r.status === 401, 'GET tasks without auth → 401');

  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', { title: 'Test' });
  assert(r.status === 401, 'POST task without auth → 401');

  r = await req(`${BASE}/tasks/someid`, 'GET');
  assert(r.status === 401, 'GET single task without auth → 401');

  r = await req(`${BASE}/tasks/someid`, 'PATCH', { title: 'New' });
  assert(r.status === 401, 'PATCH task without auth → 401');

  r = await req(`${BASE}/tasks/someid`, 'DELETE');
  assert(r.status === 401, 'DELETE task without auth → 401');

  console.log('\n--- PROJECT ACCESS ---');
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'GET', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user GET tasks → 403');

  const fakeProjId = new mongoose.Types.ObjectId();
  r = await req(`${BASE}/projects/${fakeProjId}/tasks`, 'GET', null, ownerCookie);
  assert(r.status === 404, 'Nonexistent project GET tasks → 404');

  r = await req(`${BASE}/projects/invalid-id/tasks`, 'GET', null, ownerCookie);
  assert(r.status === 400, 'Malformed projectId GET tasks → 400');

  console.log('\n--- CREATE TASK ---');
  // Valid owner creation
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'First Task',
    description: 'A desc',
  }, ownerCookie);
  assert(r.status === 201, 'Owner valid task → 201');
  assert(r.body.data.title === 'First Task', 'Title matches');
  assert(r.body.data.status === 'todo', 'Defaults status to todo');
  assert(r.body.data.priority === 'medium', 'Defaults priority to medium');
  assert(r.body.data.creator._id === ownerUserId, 'Creator comes from authenticated user');
  assert(r.body.data.project === projectId, 'Project comes from URL');
  createdTaskId = r.body.data.id || r.body.data._id;

  // Member creation
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'Member Task',
  }, memberCookie);
  assert(r.status === 201, 'Member valid task → 201');
  assert(r.body.data.creator._id === memberUserId, 'Member is creator');

  // Client cannot override creator/project
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'Override Task',
    creator: memberUserId,
    project: fakeProjId,
  }, ownerCookie);
  assert(r.status === 201, 'Task created despite override attempt');
  assert(r.body.data.creator._id === ownerUserId, 'Client cannot override creator');
  assert(r.body.data.project === projectId, 'Client cannot override project');

  // Missing title
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {}, ownerCookie);
  assert(r.status === 400, 'Missing title → 400');

  // Title too long
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'a'.repeat(201),
  }, ownerCookie);
  assert(r.status === 400, 'Title > 200 → 400');

  // Invalid status
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'Status', status: 'invalid'
  }, ownerCookie);
  assert(r.status === 400, 'Invalid status → 400');

  // Invalid priority
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'Priority', priority: 'invalid'
  }, ownerCookie);
  assert(r.status === 400, 'Invalid priority → 400');

  // Invalid assignee ID
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'Assignee', assignee: 'invalid-id'
  }, ownerCookie);
  assert(r.status === 400, 'Invalid assignee ID → 400');

  // Nonexistent assignee
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'Assignee', assignee: fakeProjId
  }, ownerCookie);
  assert(r.status === 404, 'Nonexistent assignee → 404');

  // Assignee outside project
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'Assignee', assignee: unrelatedUserId
  }, ownerCookie);
  assert(r.status === 403, 'Assignee outside project → 403');

  // Valid assignee (owner/member)
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'Assignee', assignee: memberUserId
  }, ownerCookie);
  assert(r.status === 201, 'Member as assignee → 201');

  r = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', {
    title: 'Assignee', assignee: ownerUserId
  }, ownerCookie);
  assert(r.status === 201, 'Owner as assignee → 201');

  console.log('\n--- LIST TASKS ---');
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'GET', null, ownerCookie);
  assert(r.status === 200, 'Owner can list');
  assert(Array.isArray(r.body.data) && r.body.data.length >= 5, 'Returns tasks belonging to requested project');
  
  r = await req(`${BASE}/projects/${projectId}/tasks`, 'GET', null, memberCookie);
  assert(r.status === 200, 'Member can list');

  const emptyProj = await req(`${BASE}/projects`, 'POST', { name: 'Empty' }, ownerCookie);
  const emptyProjId = emptyProj.body.data.id || emptyProj.body.data._id;
  r = await req(`${BASE}/projects/${emptyProjId}/tasks`, 'GET', null, ownerCookie);
  assert(r.status === 200 && r.body.data.length === 0, 'Empty project returns []');

  console.log('\n--- SINGLE TASK ---');
  r = await req(`${BASE}/tasks/${createdTaskId}`, 'GET', null, ownerCookie);
  assert(r.status === 200, 'Owner can retrieve');
  assert(r.body.data.title === 'First Task', 'Correct task returned');

  r = await req(`${BASE}/tasks/${createdTaskId}`, 'GET', null, memberCookie);
  assert(r.status === 200, 'Member can retrieve');

  r = await req(`${BASE}/tasks/${createdTaskId}`, 'GET', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user blocked');

  r = await req(`${BASE}/tasks/${fakeProjId}`, 'GET', null, ownerCookie);
  assert(r.status === 404, 'Nonexistent task → 404');

  r = await req(`${BASE}/tasks/invalid-id`, 'GET', null, ownerCookie);
  assert(r.status === 400, 'Malformed task ID → 400');

  console.log('\n--- UPDATE TASK ---');
  r = await req(`${BASE}/tasks/${createdTaskId}`, 'PATCH', {
    title: 'Updated Title',
    status: 'done',
    priority: 'high',
    assignee: ownerUserId
  }, ownerCookie);
  assert(r.status === 200, 'Owner can update');
  assert(r.body.data.title === 'Updated Title', 'Title updated');
  assert(r.body.data.status === 'done', 'Status updated');
  assert(r.body.data.priority === 'high', 'Priority updated');
  assert(r.body.data.assignee._id === ownerUserId, 'Assignee updated');

  r = await req(`${BASE}/tasks/${createdTaskId}`, 'PATCH', {
    description: 'New Desc',
  }, memberCookie);
  assert(r.status === 200, 'Member can update');
  assert(r.body.data.description === 'New Desc', 'Description updated');
  assert(r.body.data.title === 'Updated Title', 'Partial update preserves unspecified fields');

  // Client cannot change creator/project
  r = await req(`${BASE}/tasks/${createdTaskId}`, 'PATCH', {
    creator: memberUserId,
    project: emptyProjId,
  }, ownerCookie);
  assert(r.status === 400, 'Update ignores protected fields / Rejects no valid fields');

  // Invalid assignee update
  r = await req(`${BASE}/tasks/${createdTaskId}`, 'PATCH', {
    assignee: unrelatedUserId,
  }, ownerCookie);
  assert(r.status === 403, 'Unrelated assignee update → 403');

  // Unassign task
  r = await req(`${BASE}/tasks/${createdTaskId}`, 'PATCH', {
    assignee: null,
  }, ownerCookie);
  assert(r.status === 200, 'Allow unassigning with null');
  assert(!r.body.data.assignee, 'Assignee removed');

  console.log('\n--- DELETE TASK ---');
  r = await req(`${BASE}/tasks/${createdTaskId}`, 'DELETE', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user blocked from deleting');

  r = await req(`${BASE}/tasks/${createdTaskId}`, 'DELETE', null, memberCookie);
  assert(r.status === 200, 'Member can delete');
  
  r = await req(`${BASE}/tasks/${createdTaskId}`, 'GET', null, ownerCookie);
  assert(r.status === 404, 'Deleted task no longer retrievable');

  // Owner can also delete
  const anotherTask = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', { title: 'Another' }, ownerCookie);
  r = await req(`${BASE}/tasks/${anotherTask.body.data.id || anotherTask.body.data._id}`, 'DELETE', null, ownerCookie);
  assert(r.status === 200, 'Owner can delete');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
  
  await mongoose.connection.close();
  process.exit(failed === 0 ? 0 : 1);
}

run().catch((error) => {
  console.error('UNEXPECTED ERROR:', error);
  mongoose.connection.close();
  process.exit(1);
});
