import mongoose from 'mongoose';
import Task from './models/Task.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devflow_test_task';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  FAIL: ${message}`);
    failCount++;
  }
}

async function setup() {
  await mongoose.connect(MONGODB_URI);
  await Task.deleteMany({});
}

async function teardown() {
  await Task.deleteMany({});
  await mongoose.connection.close();
}

async function runTests() {
  await setup();
  console.log('\n--- TASK MODEL TESTS ---');

  const validProjectId = new mongoose.Types.ObjectId();
  const validCreatorId = new mongoose.Types.ObjectId();
  const validAssigneeId = new mongoose.Types.ObjectId();

  // 1. Required project
  try {
    const task = new Task({ title: 'Test Task', creator: validCreatorId });
    await task.validate();
    assert(false, 'Should reject task without project');
  } catch (error) {
    assert(error.errors.project, 'Rejects task without project');
  }

  // Required creator
  try {
    const task = new Task({ title: 'Test Task', project: validProjectId });
    await task.validate();
    assert(false, 'Should reject task without creator');
  } catch (error) {
    assert(error.errors.creator, 'Rejects task without creator');
  }

  // 2. Required title
  try {
    const task = new Task({ project: validProjectId, creator: validCreatorId });
    await task.validate();
    assert(false, 'Should reject task without title');
  } catch (error) {
    assert(error.errors.title, 'Rejects task without title');
  }

  // 3. Title length
  try {
    const longTitle = 'a'.repeat(201);
    const task = new Task({ project: validProjectId, creator: validCreatorId, title: longTitle });
    await task.validate();
    assert(false, 'Should reject title longer than 200 characters');
  } catch (error) {
    assert(error.errors.title, 'Rejects title longer than 200 characters');
  }

  // 4 & 5. Status enum and default
  const defaultTask = new Task({ project: validProjectId, creator: validCreatorId, title: 'Test Status' });
  assert(defaultTask.status === 'todo', 'Status defaults to todo');

  const validStatuses = ['todo', 'in_progress', 'review', 'done'];
  for (const status of validStatuses) {
    defaultTask.status = status;
    const err = defaultTask.validateSync();
    assert(!err || !err.errors.status, `Accepts valid status: ${status}`);
  }

  try {
    const task = new Task({ project: validProjectId, creator: validCreatorId, title: 'Title', status: 'invalid_status' });
    await task.validate();
    assert(false, 'Should reject invalid status');
  } catch (error) {
    assert(error.errors.status, 'Rejects invalid status');
  }

  // 6 & 7. Priority enum and default
  assert(defaultTask.priority === 'medium', 'Priority defaults to medium');

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  for (const priority of validPriorities) {
    defaultTask.priority = priority;
    const err = defaultTask.validateSync();
    assert(!err || !err.errors.priority, `Accepts valid priority: ${priority}`);
  }

  try {
    const task = new Task({ project: validProjectId, creator: validCreatorId, title: 'Title', priority: 'invalid_priority' });
    await task.validate();
    assert(false, 'Should reject invalid priority');
  } catch (error) {
    assert(error.errors.priority, 'Rejects invalid priority');
  }

  // 8. Description
  const taskWithDesc = new Task({ project: validProjectId, creator: validCreatorId, title: 'Title', description: '  some desc  ' });
  await taskWithDesc.validate();
  assert(taskWithDesc.description === 'some desc', 'Accepts and trims description');

  // 9. Optional assignee
  const taskNoAssignee = new Task({ project: validProjectId, creator: validCreatorId, title: 'Title' });
  await taskNoAssignee.validate();
  assert(!taskNoAssignee.assignee, 'Accepts task without assignee');

  const taskWithAssignee = new Task({ project: validProjectId, creator: validCreatorId, title: 'Title', assignee: validAssigneeId });
  await taskWithAssignee.validate();
  assert(taskWithAssignee.assignee.equals(validAssigneeId), 'Accepts valid User ObjectId as assignee');

  // 10. Labels
  const taskWithLabels = new Task({ project: validProjectId, creator: validCreatorId, title: 'Title', labels: ['bug', '  feature  '] });
  await taskWithLabels.validate();
  assert(taskWithLabels.labels.length === 2 && taskWithLabels.labels[1] === 'feature', 'Accepts and trims array of strings for labels');
  
  const taskDefaultLabels = new Task({ project: validProjectId, creator: validCreatorId, title: 'Title' });
  assert(Array.isArray(taskDefaultLabels.labels) && taskDefaultLabels.labels.length === 0, 'Labels defaults to empty array');

  // 11. Due date
  const dueDate = new Date();
  const taskWithDate = new Task({ project: validProjectId, creator: validCreatorId, title: 'Title', dueDate });
  await taskWithDate.validate();
  assert(taskWithDate.dueDate.getTime() === dueDate.getTime(), 'Accepts optional Date for dueDate');

  // 14. Invalid ObjectIds
  try {
    const task = new Task({ project: 'invalid-id', creator: validCreatorId, title: 'Title' });
    await task.validate();
    assert(false, 'Should reject malformed project ObjectId');
  } catch (error) {
    assert(error.errors.project, 'Rejects malformed project ObjectId');
  }

  try {
    const task = new Task({ project: validProjectId, creator: 'invalid-id', title: 'Title' });
    await task.validate();
    assert(false, 'Should reject malformed creator ObjectId');
  } catch (error) {
    assert(error.errors.creator, 'Rejects malformed creator ObjectId');
  }

  try {
    const task = new Task({ project: validProjectId, creator: validCreatorId, title: 'Title', assignee: 'invalid-id' });
    await task.validate();
    assert(false, 'Should reject malformed assignee ObjectId');
  } catch (error) {
    assert(error.errors.assignee, 'Rejects malformed assignee ObjectId');
  }

  // 12, 13 & 15. Valid complete task, Timestamps, Project reference
  const completeTask = new Task({
    project: validProjectId,
    creator: validCreatorId,
    title: 'Complete Task',
    description: 'Detailed description',
    status: 'in_progress',
    priority: 'high',
    assignee: validAssigneeId,
    labels: ['backend', 'database'],
    dueDate: new Date()
  });

  const savedTask = await completeTask.save();
  assert(savedTask._id, 'Successfully creates a fully populated valid Task');
  assert(savedTask.project.equals(validProjectId), 'Confirms project is stored as the expected ObjectId/reference');
  assert(savedTask.createdAt instanceof Date, 'createdAt exists after save');
  assert(savedTask.updatedAt instanceof Date, 'updatedAt exists after save');

  console.log(`\n=== RESULTS: ${passCount} passed, ${failCount} failed ===\n`);
  
  await teardown();
  process.exit(failCount === 0 ? 0 : 1);
}

runTests().catch(async (error) => {
  console.error('UNEXPECTED ERROR:', error);
  await teardown();
  process.exit(1);
});
