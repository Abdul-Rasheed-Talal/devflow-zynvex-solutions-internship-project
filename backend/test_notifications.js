import mongoose from 'mongoose';

const BASE = 'http://localhost:5000/api';

let ownerCookie = '';
let adminCookie = '';
let memberCookie = '';
let unrelatedCookie = '';

let ownerId = '';
let adminId = '';
let memberId = '';
let unrelatedId = '';

let projectId = '';
let taskId = '';
let commentId = '';
let notificationId = '';

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

  const [o, a, m2, u] = await Promise.all([
    login('owner@example.com'),
    login('admin@example.com'),
    login('member@example.com'),
    login('unrelated@example.com'),
  ]);

  ownerCookie = o.cookie; ownerId = o.id;
  adminCookie = a.cookie; adminId = a.id;
  memberCookie = m2.cookie; memberId = m2.id;
  unrelatedCookie = u.cookie; unrelatedId = u.id;

  // Create Project
  const pRes = await req(`${BASE}/projects`, 'POST', { name: 'Test Project' }, ownerCookie);
  projectId = pRes.body.data._id;

  // Add members
  await req(`${BASE}/projects/${projectId}/members`, 'POST', { userId: adminId }, ownerCookie);
  await req(`${BASE}/projects/${projectId}/members/${adminId}`, 'PATCH', { role: 'admin' }, ownerCookie);

  await req(`${BASE}/projects/${projectId}/members`, 'POST', { userId: memberId }, ownerCookie);
  await req(`${BASE}/projects/${projectId}/members/${memberId}`, 'PATCH', { role: 'member' }, ownerCookie);

  // Create Task
  const tRes = await req(`${BASE}/projects/${projectId}/tasks`, 'POST', { title: 'Test Task' }, memberCookie);
  taskId = tRes.body.data._id;
}

async function runTests() {
  await setup();

  console.log('\n--- AUTHENTICATION ---');
  let r = await req(`${BASE}/notifications`, 'GET', null, '');
  assert(r.status === 401, 'Unauthenticated GET rejected with 401');

  r = await req(`${BASE}/notifications/${new mongoose.Types.ObjectId()}/read`, 'PATCH', null, '');
  assert(r.status === 401, 'Unauthenticated PATCH rejected with 401');

  console.log('\n--- NOTIFICATION CREATION (Mentions) ---');
  // Member mentions Admin and Unrelated, and self.
  r = await req(`${BASE}/tasks/${taskId}/comments`, 'POST', { 
    content: 'Hello @admin and @unrelated and @self', 
    mentionedUsers: [adminId, unrelatedId, memberId]
  }, memberCookie);
  assert(r.status === 201, 'Member created comment with mentions');
  commentId = r.body.data._id;

  // Verify Admin got the notification
  r = await req(`${BASE}/notifications`, 'GET', null, adminCookie);
  assert(r.status === 200, 'Admin can fetch notifications');
  assert(r.body.data.length === 1, 'Admin received exactly 1 notification');
  assert(r.body.data[0].type === 'mention', 'Notification type is mention');
  assert(r.body.data[0].actor._id === memberId, 'Actor is the member');
  assert(r.body.data[0].isRead === false, 'Notification is unread');
  notificationId = r.body.data[0]._id;

  // Verify Unrelated did NOT get the notification
  r = await req(`${BASE}/notifications`, 'GET', null, unrelatedCookie);
  assert(r.body.data.length === 0, 'Unrelated user outside project did not receive notification');

  // Verify Member (self) did NOT get the notification
  r = await req(`${BASE}/notifications`, 'GET', null, memberCookie);
  assert(r.body.data.length === 0, 'Author/self-mention does not create notification');

  console.log('\n--- NOTIFICATION CREATION (Task Assignments & Updates) ---');
  // Owner assigns task to Member
  r = await req(`${BASE}/tasks/${taskId}`, 'PATCH', { assignee: memberId }, ownerCookie);
  assert(r.status === 200, 'Owner assigned task to Member');
  
  // Verify Member got task_assigned
  r = await req(`${BASE}/notifications`, 'GET', null, memberCookie);
  assert(r.body.data.length === 1, 'Member received task assignment notification');
  assert(r.body.data[0].type === 'task_assigned', 'Type is task_assigned');

  // Owner updates task status
  r = await req(`${BASE}/tasks/${taskId}`, 'PATCH', { status: 'in_progress' }, ownerCookie);
  
  // Verify Member got task_updated
  r = await req(`${BASE}/notifications`, 'GET', null, memberCookie);
  assert(r.body.data.length === 2, 'Member received task update notification');
  assert(r.body.data[0].type === 'task_updated', 'Newest notification is task_updated');

  console.log('\n--- READ STATE & ISOLATION ---');
  // Admin tries to mark Member's notification as read
  const memberNotifId = r.body.data[0]._id;
  r = await req(`${BASE}/notifications/${memberNotifId}/read`, 'PATCH', null, adminCookie);
  assert(r.status === 403, 'Admin cannot mark Member notification as read');

  // Admin marks their own notification as read
  r = await req(`${BASE}/notifications/${notificationId}/read`, 'PATCH', null, adminCookie);
  assert(r.status === 200, 'Admin can mark own notification as read');
  assert(r.body.data.isRead === true, 'Notification isRead set to true');

  // Verify Admin's unread count
  r = await req(`${BASE}/notifications`, 'GET', null, adminCookie);
  assert(r.body.meta.unreadCount === 0, 'Admin unread count is 0');

  // Member marks all as read
  r = await req(`${BASE}/notifications/read-all`, 'PATCH', null, memberCookie);
  assert(r.status === 200, 'Member can mark all as read');
  
  r = await req(`${BASE}/notifications`, 'GET', null, memberCookie);
  assert(r.body.meta.unreadCount === 0, 'Member unread count is 0');
  assert(r.body.data[0].isRead === true, 'Member notification 1 is read');
  assert(r.body.data[1].isRead === true, 'Member notification 2 is read');

  console.log('\n--- PAGINATION / FILTERING ---');
  assert(r.body.pagination.total === 2, 'Pagination returns correct total');
  assert(r.body.data[0].task.title === 'Test Task', 'Manual task population worked for task_updated');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
