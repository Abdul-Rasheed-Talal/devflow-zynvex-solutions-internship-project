import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import env from '../config/env.js';

/**
 * Calculates deterministic ground-truth project health metrics.
 */
function computeProjectMetrics(project, tasks, activities) {
  const now = new Date();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const reviewTasks = tasks.filter((t) => t.status === 'review').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Overdue task calculation
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
  );
  const urgentOverdue = overdueTasks.filter(
    (t) => t.priority === 'urgent' || t.priority === 'high'
  );
  const unassignedTasks = tasks.filter((t) => !t.assignee && t.status !== 'done');

  // Velocity: tasks completed in last 7 days
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentVelocity = tasks.filter(
    (t) => t.status === 'done' && t.updatedAt && new Date(t.updatedAt) >= oneWeekAgo
  ).length;

  // Project overall due date
  let daysRemaining = null;
  let isProjectOverdue = false;
  if (project.dueDate) {
    const diffMs = new Date(project.dueDate).getTime() - now.getTime();
    daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    isProjectOverdue = daysRemaining < 0;
  }

  // Realistic Grounded Health Score (0-100)
  let healthScore = 100;

  if (totalTasks === 0) {
    healthScore = 92;
  } else {
    // Penalties for overdue tasks
    healthScore -= Math.min(36, urgentOverdue.length * 12);
    healthScore -= Math.min(24, (overdueTasks.length - urgentOverdue.length) * 6);

    // Project overall deadline pressure
    if (isProjectOverdue && completionRate < 100) {
      healthScore -= 22;
    } else if (daysRemaining !== null && daysRemaining <= 3 && completionRate < 60) {
      healthScore -= 14;
    }

    // Review queue bottleneck penalty
    if (totalTasks >= 3 && reviewTasks / totalTasks > 0.35) {
      healthScore -= 10;
    }

    // Unassigned task ambiguity penalty
    if (totalTasks >= 4 && unassignedTasks.length / totalTasks > 0.4) {
      healthScore -= 8;
    }

    // Positive velocity bonus
    if (completionRate >= 80) healthScore += 6;
    if (recentVelocity >= 3) healthScore += 4;
  }

  // Bound to realistic non-trivial figures
  healthScore = Math.max(22, Math.min(96, healthScore));

  let status = 'Healthy';
  if (healthScore < 55) {
    status = 'Critical';
  } else if (healthScore < 80) {
    status = 'At Risk';
  }

  return {
    healthScore,
    status,
    metrics: {
      completionRate,
      totalTasks,
      completedTasks,
      inProgressTasks,
      reviewTasks,
      todoTasks,
      overdueTasks: overdueTasks.length,
      urgentOverdue: urgentOverdue.length,
      unassignedTasks: unassignedTasks.length,
      velocity: recentVelocity,
      daysRemaining,
      isProjectOverdue,
    },
    overdueTaskTitles: overdueTasks.map((t) => t.title),
    urgentOverdueTitles: urgentOverdue.map((t) => t.title),
  };
}

/**
 * Generates dynamic, natural human-grade analysis based on real metrics.
 */
function generateNaturalDiagnostic(project, calculated) {
  const { metrics, healthScore, status, urgentOverdueTitles, overdueTaskTitles } = calculated;

  const riskFactors = [];
  const recommendations = [];

  if (metrics.urgentOverdue > 0) {
    riskFactors.push(
      `${metrics.urgentOverdue} urgent deliverable${metrics.urgentOverdue > 1 ? 's are' : ' is'} past deadline (${urgentOverdueTitles.slice(0, 2).join(', ')}).`
    );
    recommendations.push(`Triage and resolve overdue high-priority items to unblock milestone delivery.`);
  } else if (metrics.overdueTasks > 0) {
    riskFactors.push(
      `${metrics.overdueTasks} task${metrics.overdueTasks > 1 ? 's have' : ' has'} missed the target due date.`
    );
    recommendations.push(`Review overdue task deadlines and adjust sprint commitments accordingly.`);
  }

  if (metrics.reviewTasks >= 2 && metrics.reviewTasks / metrics.totalTasks > 0.25) {
    riskFactors.push(
      `${metrics.reviewTasks} deliverables are awaiting code review, creating a potential testing bottleneck.`
    );
    recommendations.push(`Prioritize code reviews and PR approvals to keep downstream verification fluid.`);
  }

  if (metrics.unassignedTasks >= 2) {
    riskFactors.push(
      `${metrics.unassignedTasks} tasks currently have no assigned owner.`
    );
    recommendations.push(`Delegate unassigned backlog tasks to appropriate team members to clarify ownership.`);
  }

  if (metrics.isProjectOverdue) {
    riskFactors.push(`The overall project target deadline has lapsed with ${metrics.totalTasks - metrics.completedTasks} incomplete tasks.`);
    recommendations.push(`Publish an updated release target date to align stakeholder expectations.`);
  }

  if (recommendations.length === 0) {
    recommendations.push(`Maintain current sprint velocity by keeping active WIP limits under 3 tasks per developer.`);
    recommendations.push(`Conduct periodic backlog refinement to prepare upcoming milestone deliverables.`);
    recommendations.push(`Ensure automated tests and PR reviews continue to merge within 24 hours.`);
  }

  // Natural summary
  let summary = '';
  if (metrics.totalTasks === 0) {
    summary = `${project.name} is a newly initialized workspace with no tasks created yet. Workspace health is optimal and ready for sprint planning and task assignment.`;
  } else if (metrics.completedTasks === 0) {
    const activeCount = metrics.inProgressTasks + metrics.reviewTasks;
    summary = `${project.name} is in early sprint execution with ${metrics.totalTasks} active deliverable${metrics.totalTasks > 1 ? 's' : ''}. ${activeCount > 0 ? `${activeCount} task${activeCount > 1 ? 's are' : ' is'} currently in motion` : 'Tasks are queued in the backlog'} with ${metrics.overdueTasks > 0 ? `${metrics.overdueTasks} overdue item requiring attention` : 'no deadline slippage detected'}.`;
  } else if (status === 'Healthy') {
    summary = `${project.name} demonstrates strong delivery momentum with a ${metrics.completionRate}% completion rate (${metrics.completedTasks}/${metrics.totalTasks} tasks closed). Sprint velocity remains healthy with ${metrics.velocity > 0 ? `${metrics.velocity} deliverables completed recently` : 'tasks progressing smoothly'} and no critical blockers.`;
  } else if (status === 'At Risk') {
    summary = `${project.name} is progressing at ${metrics.completionRate}% completion, but exhibits elevated risk due to ${metrics.overdueTasks} overdue item${metrics.overdueTasks > 1 ? 's' : ''}${metrics.urgentOverdue > 0 ? ` including ${metrics.urgentOverdue} high-priority deliverable` : ''}. Review queues and open deliverables require active realignment.`;
  } else {
    summary = `${project.name} is in critical condition. Multiple high-impact deliverables are overdue, and delivery velocity has stalled relative to target milestones. Immediate reprioritization and blocker removal are required.`;
  }

  // Timeline forecast
  let timelineEstimate = 'Delivery pace is on schedule.';
  if (metrics.totalTasks === 0) {
    timelineEstimate = 'Ready for sprint planning.';
  } else if (metrics.velocity > 0) {
    const remaining = metrics.totalTasks - metrics.completedTasks;
    const weeksNeeded = Math.max(1, Math.ceil(remaining / Math.max(1, metrics.velocity)));
    timelineEstimate = `Estimated ~${weeksNeeded} week${weeksNeeded > 1 ? 's' : ''} to completion at current velocity (${metrics.velocity} tasks/week).`;
  } else {
    timelineEstimate = 'Velocity data insufficient; recommend closing active tasks to calibrate forecast.';
  }

  return {
    healthScore,
    status,
    metrics: {
      completionRate: metrics.completionRate,
      totalTasks: metrics.totalTasks,
      completedTasks: metrics.completedTasks,
      inProgressTasks: metrics.inProgressTasks,
      reviewTasks: metrics.reviewTasks,
      overdueTasks: metrics.overdueTasks,
      urgentOverdue: metrics.urgentOverdue,
      unassignedTasks: metrics.unassignedTasks,
      velocity: metrics.velocity,
      daysRemaining: metrics.daysRemaining,
    },
    summary,
    riskFactors,
    recommendations: recommendations.slice(0, 3),
    timelineEstimate,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * @desc    Generate AI Health Report for a project
 * @route   GET /api/projects/:projectId/ai-health
 * @access  Private (Premium / Enterprise only)
 */
export const getProjectHealth = async (req, res, next) => {
  try {
    const projectId = req.project._id;

    // 1. Gather Project Data
    const project = await Project.findById(projectId);
    const tasks = await Task.find({ project: projectId }).populate('assignee', 'name email');
    const activities = await Activity.find({ project: projectId }).sort({ createdAt: -1 }).limit(15);

    // 2. Compute Real Deterministic Figures
    const calculated = computeProjectMetrics(project, tasks, activities);

    // 3. Attempt LLM generation if Gemini or Groq API is configured
    let aiResult = null;

    if (env.geminiApiKey || env.groqApiKey) {
      try {
        const prompt = `You are a strict, veteran software engineering lead reviewing project health metrics.
Ground your evaluation strictly in the following REAL figures:
- Project Name: ${project.name}
- Total Tasks: ${calculated.metrics.totalTasks}
- Completed Tasks: ${calculated.metrics.completedTasks} (${calculated.metrics.completionRate}%)
- In Progress Tasks: ${calculated.metrics.inProgressTasks}
- Review Queue Tasks: ${calculated.metrics.reviewTasks}
- Overdue Tasks: ${calculated.metrics.overdueTasks} (${calculated.metrics.urgentOverdue} urgent/high priority)
- Overdue Task Titles: ${calculated.overdueTaskTitles.join(', ') || 'None'}
- Velocity (last 7 days): ${calculated.metrics.velocity} completed
- Calculated Health Score: ${calculated.healthScore}/100 (${calculated.status})
- Days Remaining to Project Due Date: ${calculated.metrics.daysRemaining !== null ? calculated.metrics.daysRemaining : 'No deadline specified'}

Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "2-3 sentences providing natural, realistic executive assessment citing actual task numbers and velocity.",
  "riskFactors": ["Specific risk 1 citing real items", "Specific risk 2"],
  "recommendations": ["Actionable step 1", "Actionable step 2", "Actionable step 3"],
  "timelineEstimate": "Realistic forecast based on current pace"
}`;

        // A. Try Groq if available
        if (env.groqApiKey) {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${env.groqApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content:
                    'You are an expert technical project management AI. Return ONLY valid JSON with keys summary, riskFactors, recommendations, timelineEstimate.',
                },
                { role: 'user', content: prompt },
              ],
              response_format: { type: 'json_object' },
            }),
          });

          if (groqRes.ok) {
            const data = await groqRes.json();
            const text = data.choices?.[0]?.message?.content?.trim();
            if (text) {
              const parsed = JSON.parse(text);
              aiResult = parsed;
            }
          }
        }

        // B. Try Gemini if Groq was not used or failed
        if (!aiResult && env.geminiApiKey) {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.geminiApiKey}`;
          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              aiResult = JSON.parse(rawText.trim());
            }
          }
        }
      } catch (aiErr) {
        console.warn('[AI Health] External LLM call failed, using grounded analytical engine:', aiErr.message);
      }
    }

    // 4. Assemble Final Response
    const naturalFallback = generateNaturalDiagnostic(project, calculated);

    const finalReport = {
      healthScore: calculated.healthScore,
      status: calculated.status,
      metrics: calculated.metrics,
      summary: aiResult?.summary || naturalFallback.summary,
      riskFactors: aiResult?.riskFactors || naturalFallback.riskFactors,
      recommendations:
        Array.isArray(aiResult?.recommendations) && aiResult.recommendations.length > 0
          ? aiResult.recommendations.slice(0, 3)
          : naturalFallback.recommendations,
      timelineEstimate: aiResult?.timelineEstimate || naturalFallback.timelineEstimate,
      analyzedAt: new Date().toISOString(),
    };

    res.status(200).json({ success: true, data: finalReport });
  } catch (error) {
    next(error);
  }
};
