import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Project from './models/Project.js';
import { runMigration } from './migrations/migrateProjectMemberships.js';

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

async function runTests() {
  await connectDB();
  await mongoose.connection.db?.dropDatabase();

  console.log('\n--- SCHEMA TESTS ---');

  const ownerId = new mongoose.Types.ObjectId();
  const userId1 = new mongoose.Types.ObjectId();
  const userId2 = new mongoose.Types.ObjectId();
  
  // 1. Valid membership object
  let project = new Project({
    name: 'Schema Test 1',
    owner: ownerId,
    members: [{ user: userId1, role: 'admin' }]
  });
  await project.validate();
  assert(true, 'valid admin role');

  project = new Project({
    name: 'Schema Test 2',
    owner: ownerId,
    members: [{ user: userId1, role: 'member' }]
  });
  await project.validate();
  assert(true, 'valid member role');
  
  project = new Project({
    name: 'Schema Test 3',
    owner: ownerId,
    members: [{ user: userId1, role: 'viewer' }]
  });
  await project.validate();
  assert(true, 'valid viewer role');

  // 2. Invalid role rejected
  project = new Project({
    name: 'Schema Test 4',
    owner: ownerId,
    members: [{ user: userId1, role: 'invalid_role' }]
  });
  let err = project.validateSync();
  assert(err && err.errors['members.0.role'], 'invalid role rejected');

  // 3. Missing user rejected
  project = new Project({
    name: 'Schema Test 5',
    owner: ownerId,
    members: [{ role: 'member' }]
  });
  err = project.validateSync();
  assert(err && err.errors['members.0.user'], 'missing user rejected');

  // 4. addedAt automatically populated
  project = new Project({
    name: 'Schema Test 6',
    owner: ownerId,
    members: [{ user: userId1 }]
  });
  await project.save();
  assert(project.members[0].addedAt instanceof Date, 'addedAt automatically populated');
  assert(project.members[0].role === 'member', 'default role is member');

  // 5. Data integrity: duplicate member prevention
  project.members.push({ user: userId1, role: 'admin' });
  await project.save();
  assert(project.members.length === 1, 'duplicate member prevention works');

  // 6. Data integrity: existing roles are preserved on save
  project.members[0].role = 'admin';
  await project.save();
  assert(project.members[0].role === 'admin', 'existing roles are preserved');

  console.log('\n--- MIGRATION TESTS ---');

  await mongoose.connection.db.collection('projects').deleteMany({});

  // Insert raw old-style projects directly into MongoDB
  const oldProjectId1 = new mongoose.Types.ObjectId();
  const oldProjectId2 = new mongoose.Types.ObjectId();
  
  await mongoose.connection.db.collection('projects').insertMany([
    {
      _id: oldProjectId1,
      name: 'Old Project 1',
      owner: ownerId,
      members: [userId1, userId2, ownerId] // owner accidentally in members
    },
    {
      _id: oldProjectId2,
      name: 'Old Project 2',
      owner: ownerId,
      members: [] // empty
    }
  ]);

  // Run migration
  await runMigration();

  // Verify migration
  const migratedProject1 = await mongoose.connection.db.collection('projects').findOne({ _id: oldProjectId1 });
  assert(migratedProject1.members.length === 2, 'multiple members migrate correctly');
  assert(!migratedProject1.members.some((m) => m.user.toString() === ownerId.toString()), 'owner is not accidentally inserted as a member');
  assert(migratedProject1.members[0].user.toString() === userId1.toString(), 'old ObjectId membership converts correctly');
  assert(migratedProject1.members[0].role === 'member', 'migrated role is member');
  assert(migratedProject1.members[0].addedAt instanceof Date, 'migrated addedAt is present');
  assert(migratedProject1.name === 'Old Project 1', 'unrelated project fields remain unchanged');

  const migratedProject2 = await mongoose.connection.db.collection('projects').findOne({ _id: oldProjectId2 });
  assert(migratedProject2.members.length === 0, 'empty membership array remains valid');

  // Modify roles manually to test idempotency
  await mongoose.connection.db.collection('projects').updateOne(
    { _id: oldProjectId1 },
    { $set: { "members.0.role": "admin" } }
  );

  // Run migration again
  await runMigration();

  const remigratedProject = await mongoose.connection.db.collection('projects').findOne({ _id: oldProjectId1 });
  assert(remigratedProject.members[0].role === 'admin', 'existing roles are preserved during re-migration');
  assert(remigratedProject.members.length === 2, 'migration can safely run twice without duplication');
  assert(remigratedProject.members[0].user.toString() === userId1.toString(), 'already-migrated project is unchanged');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  await mongoose.connection.db?.dropDatabase();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
