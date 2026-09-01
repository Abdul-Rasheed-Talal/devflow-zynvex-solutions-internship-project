import fetch from 'node-fetch'; // or global fetch if Node 18+

/**
 * @desc    Fetch GitHub open issues and PRs for a project
 * @route   GET /api/projects/:projectId/github
 * @access  Private (viewer or higher)
 */
export const getGitHubData = async (req, res, next) => {
  try {
    const project = req.project; // Populated by requireProjectRole
    if (!project.githubRepo) {
      return res.status(400).json({ success: false, message: 'No GitHub repository linked to this project' });
    }

    // We should use the project owner's token to fetch data, since the repo might be private to them.
    // We need to fetch the owner's githubAccessToken.
    await project.populate('owner', 'githubAccessToken');

    const accessToken = project.owner.githubAccessToken;
    const headers = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // Fetch Issues and PRs (GitHub treats PRs as issues, but we can filter or use the search API)
    // Fetching the last 10 open issues and PRs
    const [issuesRes, pullsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${project.githubRepo}/issues?state=open&per_page=10`, { headers }),
      fetch(`https://api.github.com/repos/${project.githubRepo}/pulls?state=open&per_page=10`, { headers })
    ]);

    if (!issuesRes.ok || !pullsRes.ok) {
      // If unauthorized, return 400 with a message
      if (issuesRes.status === 401 || issuesRes.status === 404) {
         return res.status(400).json({ 
           success: false, 
           message: 'Unable to access the linked GitHub repository. Ensure the repository exists and the Project Owner has linked their GitHub account with access to it.' 
         });
      }
      const err = new Error('Failed to fetch from GitHub API');
      err.statusCode = 502;
      return next(err);
    }

    const issuesData = await issuesRes.json();
    const pullsData = await pullsRes.json();

    // Filter out PRs from issues (GitHub API returns PRs in the /issues endpoint too)
    const pureIssues = issuesData.filter(issue => !issue.pull_request);

    // Format the response
    const formatItem = (item) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      state: item.state,
      html_url: item.html_url,
      user: {
        login: item.user.login,
        avatar_url: item.user.avatar_url,
      },
      created_at: item.created_at,
    });

    res.status(200).json({
      success: true,
      data: {
        repo: project.githubRepo,
        issues: pureIssues.map(formatItem),
        pullRequests: pullsData.map(formatItem),
      },
    });
  } catch (error) {
    next(error);
  }
};
