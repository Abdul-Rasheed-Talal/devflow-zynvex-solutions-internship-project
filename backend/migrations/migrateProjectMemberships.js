import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from '../config/db.js';

dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

export const runMigration = async () => {
  console.log('--- Starting Project Membership Migration ---');
  const db = mongoose.connection.db;
  const projectsCol = db.collection('projects');
  
  const projects = await projectsCol.find({}).toArray();
  let migratedCount = 0;
  let skippedCount = 0;

  for (const project of projects) {
    if (!project.members || !Array.isArray(project.members) || project.members.length === 0) {
      skippedCount++;
      continue;
    }

    let needsMigration = false;
    const newMembers = [];
    const seenUsers = new Set();
    const migrationTimestamp = new Date();

    for (const member of project.members) {
      let userIdStr = null;
      let isAlreadyObject = false;

      if (member && typeof member === 'object' && member.user) {
         isAlreadyObject = true;
         userIdStr = member.user.toString();
      } else {
         needsMigration = true;
         userIdStr = member.toString();
      }

      if (userIdStr === project.owner.toString()) {
        needsMigration = true; // filter out owner if they snuck into members array
        continue;
      }

      if (userIdStr && !seenUsers.has(userIdStr)) {
        seenUsers.add(userIdStr);
        
        if (isAlreadyObject) {
          newMembers.push(member);
        } else {
          newMembers.push({
            user: new mongoose.Types.ObjectId(userIdStr),
            role: 'member',
            addedAt: migrationTimestamp
          });
        }
      } else {
        needsMigration = true; 
      }
    }

    if (needsMigration) {
      await projectsCol.updateOne(
        { _id: project._id },
        { $set: { members: newMembers } }
      );
      migratedCount++;
      console.log(`[MIGRATED] Project ID: ${project._id} (${project.name})`);
    } else {
      skippedCount++;
    }
  }

  console.log('--- Migration Completed ---');
  console.log(`Total Projects: ${projects.length}`);
  console.log(`Migrated: ${migratedCount}`);
  console.log(`Skipped (already migrated or empty): ${skippedCount}`);
};

const isMain = process.argv[1] && process.argv[1].includes('migrateProjectMemberships');
if (isMain) {
  connectDB().then(async () => {
    await runMigration();
    process.exit(0);
  }).catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
