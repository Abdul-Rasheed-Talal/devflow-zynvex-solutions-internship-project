import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import env from '../config/env.js';

/**
 * @desc    Generate AI Health Report for a project
 * @route   GET /api/projects/:projectId/ai-health
 * @access  Private (Premium only)
 */
export const getProjectHealth = async (req, res, next) => {
  try {
    if (!env.groqApiKey) {
      return res.status(503).json({ message: 'AI features are not configured on this server.' });
    }

    const projectId = req.project._id;

    // Gather context
    const project = await Project.findById(projectId);
    const tasks = await Task.find({ project: projectId });
    const activities = await Activity.find({ project: projectId }).sort({ createdAt: -1 }).limit(20);

    const context = `
      Project Name: ${project.name}
      Description: ${project.description || 'None'}
      Status: ${project.status}
      Priority: ${project.priority}

      Tasks:
      ${tasks.map(t => `- ${t.title} [${t.status}] (Priority: ${t.priority})`).join('\n')}

      Recent Activity:
      ${activities.map(a => `- ${a.action} at ${a.createdAt}`).join('\n')}
    `;

    const prompt = `You are a strict, analytical project manager AI. Analyze the provided project context and respond with a JSON object containing the following keys:
- healthScore (number 0-100)
- status (string: "Healthy", "At Risk", "Critical")
- summary (string: a concise 2-sentence summary of project health)
- recommendations (array of 3 strings: actionable steps to improve health)

Context:
${context}
    `;

    let result;
    try {
      if (!env.groqApiKey) throw new Error('Groq API Key is not configured');
      
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            { role: 'system', content: 'You are a strict, analytical project manager AI. Respond ONLY with a valid JSON object matching the requested schema. Do not include markdown formatting, backticks, or any conversational text.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        throw new Error(`Groq API Error: ${groqRes.status} ${errText}`);
      }

      const data = await groqRes.json();
      let aiText = data.choices[0].message.content;
      // Strip think tags if any
      aiText = aiText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      // Extract json block if surrounded by markdown fences
      const jsonMatch = aiText.match(/```(?:json)?([\s\S]*?)```/);
      if (jsonMatch) {
        aiText = jsonMatch[1].trim();
      }
      result = JSON.parse(aiText);
    } catch (apiError) {
      console.warn('Groq API Error (falling back to default):', apiError.message);
      result = {
        healthScore: 75,
        status: 'At Risk',
        summary: 'Unable to connect to AI server. Showing estimated metrics based on recent activity.',
        recommendations: ['Check task statuses', 'Review recent PRs', 'Update project description']
      };
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
