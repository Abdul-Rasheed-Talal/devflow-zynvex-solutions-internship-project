import mongoose from 'mongoose';
import User from './models/User.js';

async function runTests() {
  const m = await import('./config/db.js');
  await m.default();

  await import('./server.js');

  const registerUrl = 'http://localhost:5000/api/auth/register';
  const loginUrl = 'http://localhost:5000/api/auth/login';
  const meUrl = 'http://localhost:5000/api/auth/me';
  const logoutUrl = 'http://localhost:5000/api/auth/logout';

  async function req(url, method, data, cookies = '') {
    const opts = { method, headers: {} };
    if (data) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(data);
    }
    if (cookies) {
      opts.headers['Cookie'] = cookies;
    }
    const res = await fetch(url, opts);
    const body = await res.json();
    return { status: res.status, body, cookies: res.headers.get('set-cookie') };
  }

  // Ensure DB is clean
  await mongoose.connection.db?.dropDatabase();

  // Create a user
  await req(registerUrl, 'POST', { name: 'Cookie Test', email: 'cookie@example.com', password: 'secure-password' });

  // Login to get cookie
  console.log('--- TEST: LOGIN SETS COOKIE ---');
  let r = await req(loginUrl, 'POST', { email: 'cookie@example.com', password: 'secure-password' });
  console.log(r.status, 'Has Cookie:', !!r.cookies); // Should be 200, Has Cookie: true

  if (r.body.data && r.body.data.token) {
    console.error('FAIL: Token is still being returned in the JSON body');
  }

  // Parse cookie for next requests
  // Extract devflow_access_token=... from set-cookie
  const rawCookie = r.cookies;
  const match = rawCookie.match(/(devflow_access_token=[^;]+)/);
  const jwtCookie = match ? match[1] : '';
  console.log('Parsed Cookie:', !!jwtCookie);

  console.log('--- TEST: /ME WITHOUT COOKIE ---');
  r = await req(meUrl, 'GET');
  console.log(r.status, r.body.message); // Should be 401

  console.log('--- TEST: /ME WITH COOKIE ---');
  r = await req(meUrl, 'GET', null, jwtCookie);
  console.log(r.status, r.body.data?.name); // Should be 200, Cookie Test

  console.log('--- TEST: LOGOUT CLEARS COOKIE ---');
  r = await req(logoutUrl, 'POST', null, jwtCookie);
  console.log(r.status, 'Clears Cookie:', r.cookies.includes('Max-Age=0') || r.cookies.includes('Expires=Thu, 01 Jan 1970'));

  // Clean up
  await mongoose.connection.db?.dropDatabase();
  process.exit(0);
}

setTimeout(runTests, 1500); // Wait for server to boot
