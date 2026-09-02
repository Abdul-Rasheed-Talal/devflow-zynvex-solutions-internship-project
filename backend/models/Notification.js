import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    type: {
      type: String,
      enum: ['mention', 'task_assigned', 'task_updated', 'team_added', 'project_added'],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      // This is a dynamic reference; its meaning depends on `type`.
      // mention -> Comment ID
      // task_assigned / task_updated -> Task ID
      // team_added -> Team ID
      // project_added -> Project ID
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for getting a user's notifications, most recent first.
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
