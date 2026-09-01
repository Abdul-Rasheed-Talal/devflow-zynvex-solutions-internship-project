import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name must not exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Project description must not exceed 1000 characters'],
    },
    githubRepo: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['admin', 'member', 'viewer'],
          default: 'member',
          required: true
        },
        addedAt: {
          type: Date,
          default: Date.now,
          required: true
        }
      }
    ],
    status: {
      type: String,
      enum: {
        values: ['planning', 'active', 'on_hold', 'completed', 'archived'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'planning',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid project priority',
      },
      default: 'medium',
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Custom validation to ensure dueDate >= startDate
projectSchema.pre('validate', function () {
  if (this.startDate && this.dueDate) {
    if (this.dueDate < this.startDate) {
      this.invalidate('dueDate', 'Due date cannot be earlier than start date');
    }
  }
});

// Prevent duplicate members automatically on save
projectSchema.pre('save', function () {
  if (this.isModified('members') && this.members && this.members.length > 0) {
    const uniqueUsers = new Set();
    const filteredMembers = [];
    
    for (const member of this.members) {
      const userId = member.user ? member.user.toString() : member.toString();
      if (!uniqueUsers.has(userId)) {
        uniqueUsers.add(userId);
        filteredMembers.push(member);
      }
    }
    
    if (filteredMembers.length !== this.members.length) {
      this.members = filteredMembers;
    }
  }
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
