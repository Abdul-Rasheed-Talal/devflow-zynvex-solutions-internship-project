import mongoose from 'mongoose';
import User from './models/User.js';
import Project from './models/Project.js';
import connectDB from './config/db.js';

async function runTests() {
  await connectDB();

  console.log('--- TEST: PROJECT MODEL VALIDATION ---');
  
  // Ensure DB is clean
  await mongoose.connection.db?.dropDatabase();

  const mockOwnerId = new mongoose.Types.ObjectId();
  const mockMemberId1 = new mongoose.Types.ObjectId();
  const mockMemberId2 = new mongoose.Types.ObjectId();

  try {
    // 1. Verify required fields
    console.log('Testing required fields...');
    let error;
    try {
      await Project.create({});
    } catch (err) {
      error = err;
    }
    if (!error || !error.errors || !error.errors['name'] || !error.errors['owner']) {
      console.error('FAIL: Should require name and owner. Got:', error);
    } else {
      console.log('PASS: Requires name and owner');
    }

    // 2. Verify enum validation
    console.log('Testing enum validation...');
    error = null;
    try {
      await Project.create({ name: 'Test', owner: mockOwnerId, status: 'invalid_status' });
    } catch (err) {
      error = err;
    }
    if (!error || !error.errors || !error.errors['status']) {
      console.error('FAIL: Should reject invalid status. Got:', error);
    } else {
      console.log('PASS: Rejects invalid status');
    }

    // 3. Verify name/description length constraints
    console.log('Testing length constraints...');
    error = null;
    try {
      await Project.create({
        name: 'A'.repeat(101),
        owner: mockOwnerId,
        description: 'B'.repeat(1001)
      });
    } catch (err) {
      error = err;
    }
    if (!error || !error.errors || !error.errors['name'] || !error.errors['description']) {
      console.error('FAIL: Should reject overly long name and description. Got:', error);
    } else {
      console.log('PASS: Enforces length constraints');
    }

    // 4. Verify valid Project document can be constructed
    console.log('Testing valid document creation...');
    const project = await Project.create({
      name: 'Valid Project',
      description: 'A valid description',
      owner: mockOwnerId,
      members: [mockMemberId1],
      startDate: new Date('2026-01-01'),
      dueDate: new Date('2026-12-31')
    });
    
    if (project.name !== 'Valid Project' || !project.createdAt || !project.updatedAt) {
      console.error('FAIL: Project not created properly or missing timestamps');
    } else {
      console.log('PASS: Valid project created successfully with timestamps');
    }

    // 5. Verify date validation (dueDate >= startDate)
    console.log('Testing date validation...');
    error = null;
    try {
      await Project.create({
        name: 'Date Test Project',
        owner: mockOwnerId,
        startDate: new Date('2026-12-31'),
        dueDate: new Date('2026-01-01')
      });
    } catch (err) {
      error = err;
    }
    if (!error || !error.errors || !error.errors['dueDate']) {
      console.error('FAIL: Should reject dueDate earlier than startDate. Got:', error);
    } else {
      console.log('PASS: Enforces dueDate >= startDate');
    }

    // 6. Verify duplicate-member protection
    console.log('Testing duplicate member protection...');
    const dupProject = await Project.create({
      name: 'Duplicate Test',
      owner: mockOwnerId,
      members: [mockMemberId1, mockMemberId1, mockMemberId2]
    });
    
    if (dupProject.members.length !== 2) {
      console.error(`FAIL: Should have filtered duplicate members. Expected 2, got ${dupProject.members.length}`);
    } else {
      console.log('PASS: Duplicate members filtered automatically');
    }

  } catch (err) {
    console.error('UNEXPECTED ERROR:', err);
  } finally {
    // Clean up
    await mongoose.connection.db?.dropDatabase();
    process.exit(0);
  }
}

runTests();
