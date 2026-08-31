import mongoose from 'mongoose';

const BASE = 'http://localhost:5000/api';

let ownerCookie = '';
let adminCookie = '';
let memberCookie = '';
let viewerCookie = '';
let unrelatedCookie = '';

let ownerId = '';
let adminId = '';
let memberId = '';
let viewerId = '';
let unrelatedId = '';

let projectId = '';
let taskId = '';
let commentId1 = '';
let commentId2 = '';

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
  if (!res.ok && body && body.message) {
    console.log(`[Error] ${res.status} — ${body.message}`);
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

  for (const u of users) {
    await req(`${BASE}/auth/register`, 'POST', {
      name: u.name,
      email: u.email,
      password: 'password123',
    });
  }

  const login = async (email) => {
    const r = await req(`${BASE}/auth/login`, 'POST', { email, password: 'password123' });
    return { cookie: parseCookie(r.cookies), id: r.body.data.id };
  };

  const [o, a, m2, v, u] = await Promise.all([
    login('owner@example.com'),
    login('admin@example.com'),
    login('member@example.com'),
    login('viewer@example.com'),
    login('unrelated@example.com'),
  ]);

  ownerCookie = o.cookie; ownerId = o.id;
  adminCookie = a.cookie; adminId = a.id;
  memberCookie = m2.cookie; memberId = m2.id;
  viewerCookie = v.cookie; viewerId = v.id;
  unrelatedCookie = u.cookie; unrelatedId = u.id;

  // Create Project
  const pRes = await req(`${BASE}/projects`, 'POST', { name: 'Test Project' }, ownerCookie);
  projectId = pRes.body.data._id;

  // Add members
  await req(`${BASE}/projects/${projectId}/members`, 'POST', { userId: adminId }, ownerCookie);
  await req(`${BASE}/projects/${projectId}/members/${adminId}`, 'PATCH', { role: 'admin' }, ownerCookie);

  await req(`${BASE}/projects/${projectId}/members`, 'POST', { userId: memberId }, ownerCookie);
  await req(`${BASE}/projects/${projectId}/members/${memberId}`, 'PATCH', { role: 'member' }, ownerCookie);

  await req(`${BASE}/projects/${projectId}/members`, 'POST', { userId: viewerId }, ownerCookie);
  await req(`${BASE}/projects/${projectId}/members/${viewerId}`, 'PATCH', { role: 'viewer' }, ownerCookie);

  // Create Task
  const tRes = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', { title: 'Test Task' }, memberCookie);
  taskId = tRes.body.data._id;
}

async function runTests() {
  await setup();

  console.log('\n--- COMMENT CREATION ---');
  let r = await req(`${BASE}/tasks/${taskId}/comments`, 'POST', {}, '');
  assert(r.status === 401, 'Unauthenticated request → 401');

  r = await req(`${BASE}/tasks/${taskId}/comments`, 'POST', { content: 'test' }, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user cannot create comment → 403');

  r = await req(`${BASE}/tasks/${taskId}/comments`, 'POST', { content: 'test' }, viewerCookie);
  assert(r.status === 403, 'Viewer cannot create comment → 403');

  r = await req(`${BASE}/tasks/${taskId}/comments`, 'POST', { content: '' }, memberCookie);
  assert(r.status === 400, 'Empty content rejected → 400');

  r = await req(`${BASE}/tasks/${taskId}/comments`, 'POST', { content: 'a'.repeat(2001) }, memberCookie);
  assert(r.status === 400, 'Content length validation enforced → 400');

  r = await req(`${BASE}/tasks/invalid-id/comments`, 'POST', { content: 'test' }, memberCookie);
  assert(r.status === 400, 'Invalid task ID → 400');

  r = await req(`${BASE}/tasks/${new mongoose.Types.ObjectId()}/comments`, 'POST', { content: 'test' }, memberCookie);
  assert(r.status === 404, 'Nonexistent task → 404');

  r = await req(`${BASE}/tasks/${taskId}/comments`, 'POST', { content: 'First comment' }, memberCookie);
  assert(r.status === 201, 'Member can create comment → 201');
  assert(r.body.data.content === 'First comment', 'Content is correct');
  assert(r.body.data.author._id === memberId, 'Author derived from token');
  commentId1 = r.body.data._id;

  r = await req(`${BASE}/tasks/${taskId}/comments`, 'POST', { content: 'Admin comment' }, adminCookie);
  assert(r.status === 201, 'Admin can create comment');

  r = await req(`${BASE}/tasks/${taskId}/comments`, 'POST', { content: 'Owner comment' }, ownerCookie);
  assert(r.status === 201, 'Owner can create comment');

  console.log('\n--- COMMENT RETRIEVAL ---');
  r = await req(`${BASE}/tasks/${taskId}/comments`, 'GET', null, viewerCookie);
  assert(r.status === 200, 'Viewer can read comments');
  assert(r.body.data.length === 3, 'Returns all comments');
  
  r = await req(`${BASE}/tasks/${taskId}/comments`, 'GET', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated user denied');

  console.log('\n--- COMMENT UPDATE ---');
  r = await req(`${BASE}/comments/${commentId1}`, 'PATCH', { content: 'Edited by viewer' }, viewerCookie);
  assert(r.status === 403, 'Viewer cannot update comment');

  r = await req(`${BASE}/comments/${commentId1}`, 'PATCH', { content: 'Edited by unrelated' }, unrelatedCookie);
  assert(r.status === 403, 'Unrelated cannot update comment');

  r = await req(`${BASE}/comments/${commentId1}`, 'PATCH', { content: 'Edited by admin' }, adminCookie);
  assert(r.status === 403, 'Admin cannot edit member\'s comment');

  r = await req(`${BASE}/comments/${commentId1}`, 'PATCH', { content: 'Edited by author' }, memberCookie);
  assert(r.status === 200, 'Author can update their own comment');
  assert(r.body.data.content === 'Edited by author', 'Content was updated');
  assert(r.body.data.isEdited === true, 'isEdited flag set to true');

  r = await req(`${BASE}/comments/${commentId1}`, 'PATCH', { author: adminId }, memberCookie);
  assert(r.status === 200, 'Update ignores protected fields like author');
  assert(r.body.data.author._id === memberId, 'Author remained the same');

  console.log('\n--- COMMENT DELETION ---');
  // Have member create a second comment for admin to delete
  r = await req(`${BASE}/tasks/${taskId}/comments`, 'POST', { content: 'To be deleted by admin' }, memberCookie);
  commentId2 = r.body.data._id;

  r = await req(`${BASE}/comments/${commentId2}`, 'DELETE', null, viewerCookie);
  assert(r.status === 403, 'Viewer cannot delete comment');

  r = await req(`${BASE}/comments/${commentId2}`, 'DELETE', null, unrelatedCookie);
  assert(r.status === 403, 'Unrelated cannot delete comment');

  r = await req(`${BASE}/comments/${commentId2}`, 'DELETE', null, adminCookie);
  assert(r.status === 200, 'Admin can delete any comment');

  r = await req(`${BASE}/comments/${commentId1}`, 'DELETE', null, memberCookie);
  assert(r.status === 200, 'Author can delete their own comment');

  r = await req(`${BASE}/comments/${commentId1}`, 'GET', null, memberCookie);
  assert(r.status === 404, 'Deleted comment is gone');

  console.log('\n--- ACTIVITY ---');
  r = await req(`${BASE}/projects/${projectId}/activity`, 'GET', null, viewerCookie);
  assert(r.status === 200, 'Authorized users can retrieve project activity');
  
  const activities = r.body.data;
  const commentCreatedActs = activities.filter(a => a.action === 'comment_created');
  const commentUpdatedActs = activities.filter(a => a.action === 'comment_updated');
  const commentDeletedActs = activities.filter(a => a.action === 'comment_deleted');

  assert(commentCreatedActs.length > 0, 'Comment creation creates activity');
  assert(commentUpdatedActs.length > 0, 'Comment update creates activity');
  assert(commentDeletedActs.length > 0, 'Comment deletion creates activity');
  
  const firstActivity = commentCreatedActs[commentCreatedActs.length - 1]; // oldest created
  assert(firstActivity.actor._id === memberId, 'Actor is derived from req.user');
  assert(!firstActivity.actor.password, 'Sensitive fields are not exposed in actor');

  r = await req(`${BASE}/projects/${projectId}/activity`, 'GET', null, unrelatedCookie);
  assert(r.status === 403, 'Unauthorized users cannot retrieve activity');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
