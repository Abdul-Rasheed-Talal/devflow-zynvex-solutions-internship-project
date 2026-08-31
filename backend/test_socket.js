import mongoose from 'mongoose';
import { io as Client } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

let ownerCookie = '';
let memberCookie = '';
let unrelatedCookie = '';
let ownerUserId = '';
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

function createSocketClient(cookieString) {
  return Client(BASE_URL, {
    extraHeaders: cookieString ? { Cookie: cookieString } : {},
    autoConnect: false,
  });
}

async function setup() {
  const m = await import('./config/db.js');
  await m.default();
  await import('./server.js');

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await mongoose.connection.db?.dropDatabase();

  const users = ['owner', 'member', 'unrelated'];
  for (const u of users) {
    await req(`${API_URL}/auth/register`, 'POST', {
      name: `${u} User`,
      email: `${u}@example.com`,
      password: 'password123',
    });
  }

  const getCookieFor = async (email) => {
    const r = await req(`${API_URL}/auth/login`, 'POST', { email, password: 'password123' });
    return { cookie: parseCookie(r.cookies), id: r.body.data.id };
  };

  const o = await getCookieFor('owner@example.com');
  ownerCookie = o.cookie; ownerUserId = o.id;

  const m2 = await getCookieFor('member@example.com');
  memberCookie = m2.cookie;

  const u = await getCookieFor('unrelated@example.com');
  unrelatedCookie = u.cookie;

  // Create Project
  const projRes = await req(`${API_URL}/projects`, 'POST', { name: 'Socket Proj' }, ownerCookie);
  createdProjectId = projRes.body.data._id;
}

async function testAuthentication() {
  console.log('\n--- SOCKET AUTHENTICATION ---');
  
  const unauthSocket = createSocketClient('');
  let connectError = false;
  unauthSocket.on('connect_error', () => { connectError = true; });
  unauthSocket.connect();
  
  await new Promise(r => setTimeout(r, 200));
  assert(connectError, 'Unauthenticated connection rejected');
  unauthSocket.disconnect();

  const authSocket = createSocketClient(ownerCookie);
  let connected = false;
  authSocket.on('connect', () => { connected = true; });
  authSocket.connect();
  
  await new Promise(r => setTimeout(r, 200));
  assert(connected, 'Authenticated connection accepted');
  authSocket.disconnect();
}

async function testProjectAuthorization() {
  console.log('\n--- PROJECT ROOM AUTHORIZATION ---');
  
  const ownerSocket = createSocketClient(ownerCookie);
  const unrelatedSocket = createSocketClient(unrelatedCookie);
  
  ownerSocket.connect();
  unrelatedSocket.connect();
  
  await new Promise(r => setTimeout(r, 200));

  // Try to join project
  ownerSocket.emit('join_project', createdProjectId);
  
  let ownerError = false;
  ownerSocket.on('error', (msg) => { ownerError = true; });

  unrelatedSocket.emit('join_project', createdProjectId);
  let unrelatedError = false;
  unrelatedSocket.on('error', (msg) => { unrelatedError = true; });

  await new Promise(r => setTimeout(r, 200));

  assert(!ownerError, 'Owner allowed to join project room');
  assert(unrelatedError, 'Unrelated user rejected from project room');

  ownerSocket.disconnect();
  unrelatedSocket.disconnect();
}

async function testEventEmission() {
  console.log('\n--- EVENT EMISSION & PAYLOADS ---');

  const ownerSocket = createSocketClient(ownerCookie);
  ownerSocket.connect();
  
  await new Promise(r => setTimeout(r, 200));
  ownerSocket.emit('join_project', createdProjectId);
  await new Promise(r => setTimeout(r, 200));

  let receivedPayload = null;
  ownerSocket.on('project.updated', (payload) => {
    receivedPayload = payload;
  });

  // Trigger an update
  const res = await req(`${API_URL}/projects/${createdProjectId}`, 'PATCH', { name: 'Updated Socket Proj' }, ownerCookie);
  
  await new Promise(r => setTimeout(r, 200));

  assert(receivedPayload !== null, 'Event emitted upon successful operation');
  assert(receivedPayload && receivedPayload.projectId === createdProjectId, 'Payload contains safe minimal metadata');
  assert(receivedPayload && !receivedPayload.passwordHash && !receivedPayload.token, 'Payload does not expose sensitive data');

  ownerSocket.disconnect();
}

async function run() {
  try {
    await setup();
    await testAuthentication();
    await testProjectAuthorization();
    await testEventEmission();
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
