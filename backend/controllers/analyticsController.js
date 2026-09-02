import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import mongoose from 'mongoose';

/**
 * @desc    Get global dashboard analytics for the authenticated user
 * @route   GET /api/analytics/global
 * @access  Private
 */
export const getGlobalAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userIdObj = new mongoose.Types.ObjectId(userId);

    // 1. Get all projects accessible by this user
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    });

    const projectIds = projects.map((p) => p._id);

    // 2. Aggregate tasks in these projects
    const allTasks = await Task.find({ project: { $in: projectIds } });

    // Calculate metrics
    const activeProjectsCount = projects.filter(
      (p) => p.status !== 'completed' && p.status !== 'archived'
    ).length;

    const pendingTasksCount = allTasks.filter(
      (t) => t.status !== 'done'
    ).length;

    const now = new Date();
    const overdueTasksCount = allTasks.filter(
      (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    // Status distribution
    const statusDistribution = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };

    allTasks.forEach((t) => {
      if (statusDistribution[t.status] !== undefined) {
        statusDistribution[t.status]++;
      }
    });

    // Format for Recharts PieChart: [{ name: 'To Do', value: 5 }, ...]
    const statusChartData = [
      { name: 'To Do', value: statusDistribution.todo },
      { name: 'In Progress', value: statusDistribution.in_progress },
      { name: 'Review', value: statusDistribution.review },
      { name: 'Done', value: statusDistribution.done },
    ];

    // Upcoming tasks for this specific user (assigned directly)
    const myUpcomingTasks = await Task.find({
      project: { $in: projectIds },
      assignee: userId,
      status: { $ne: 'done' },
    })
      .sort({ dueDate: 1, priority: -1, createdAt: -1 })
      .limit(6)
      .populate('project', 'name');

    // All pending tasks across accessible projects
    const allPendingTasks = await Task.find({
      project: { $in: projectIds },
      status: { $ne: 'done' },
    })
      .sort({ dueDate: 1, priority: -1, createdAt: -1 })
      .limit(6)
      .populate('project', 'name')
      .populate('assignee', 'name avatarUrl');

    // Recent activity feed
    const recentActivities = await Activity.find({
      project: { $in: projectIds },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('actor', 'name avatarUrl')
      .populate('project', 'name');

    res.status(200).json({
      success: true,
      data: {
        activeProjectsCount,
        pendingTasksCount,
        overdueTasksCount,
        statusChartData,
        myUpcomingTasks,
        allPendingTasks,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get project-level analytics (Workload)
 * @route   GET /api/analytics/projects/:projectId
 * @access  Private (viewer or higher)
 */
export const getProjectAnalytics = async (req, res, next) => {
  try {
    const project = req.project; // Populated by requireProjectRole middleware

    // Get all tasks in this project
    const tasks = await Task.find({ project: project._id }).populate('assignee', 'name');

    // Calculate Workload (Tasks per assignee)
    const workloadMap = {}; // { 'UserId': { name: 'User Name', count: 5 } }
    
    // Initialize workload map for all members to ensure 0-counts are shown
    project.members.forEach((m) => {
      // m.user is populated in some contexts, but let's just use the ID if we can't get the name easily,
      // actually we should fetch the user names.
    });
    
    // We'll populate members to get names
    const populatedProject = await Project.findById(project._id).populate('members.user', 'name');
    
    populatedProject.members.forEach((m) => {
       if (m.user) {
         workloadMap[m.user._id.toString()] = {
           name: m.user.name,
           tasks: 0
         };
       }
    });

    // Add owner to workload map
    const owner = await mongoose.model('User').findById(project.owner);
    if (owner && !workloadMap[owner._id.toString()]) {
       workloadMap[owner._id.toString()] = {
         name: owner.name,
         tasks: 0
       };
    }

    // Unassigned category
    workloadMap['unassigned'] = { name: 'Unassigned', tasks: 0 };

    tasks.forEach((t) => {
      if (t.status !== 'done') {
        if (t.assignee) {
          const assigneeId = t.assignee._id.toString();
          if (workloadMap[assigneeId]) {
            workloadMap[assigneeId].tasks++;
          } else {
             // In case assignee is no longer a member
             workloadMap[assigneeId] = {
               name: t.assignee.name || 'Unknown',
               tasks: 1
             };
          }
        } else {
          workloadMap['unassigned'].tasks++;
        }
      }
    });

    // Format for Recharts BarChart: [{ name: 'Alice', tasks: 3 }, ...]
    const workloadChartData = Object.values(workloadMap).sort((a, b) => b.tasks - a.tasks);

    // Overdue tasks in project
    const now = new Date();
    const overdueCount = tasks.filter(
      (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const completedCount = tasks.filter((t) => t.status === 'done').length;
    const totalCount = tasks.length;
    const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    res.status(200).json({
      success: true,
      data: {
        workloadChartData,
        overdueCount,
        completionPercentage,
        totalTasks: totalCount
      },
    });
  } catch (error) {
    next(error);
  }
};
