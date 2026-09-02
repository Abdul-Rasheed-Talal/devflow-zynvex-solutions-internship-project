import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';

// Helper to check for common free email providers
const isFreeEmailProvider = (email) => {
  const freeDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'aol.com', 'icloud.com', 'protonmail.com', 'yandex.com', 'zoho.com'
  ];
  const domain = email.split('@')[1];
  return freeDomains.includes(domain?.toLowerCase());
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, accountType, companyName } = req.body;

    // 1. Basic validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const err = new Error('Name is required');
      err.statusCode = 400;
      return next(err);
    }
    
    if (!email || typeof email !== 'string' || email.trim() === '') {
      const err = new Error('Email is required');
      err.statusCode = 400;
      return next(err);
    }
    
    if (!password || typeof password !== 'string') {
      const err = new Error('Password is required');
      err.statusCode = 400;
      return next(err);
    }

    if (password.length < 6) {
      const err = new Error('Password must be at least 6 characters');
      err.statusCode = 400;
      return next(err);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const err = new Error('User with this email already exists');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    // Company specific validations
    let finalCompanyName = undefined;
    if (accountType === 'company') {
      if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
        const err = new Error('Company name is required for company accounts');
        err.statusCode = 400;
        return next(err);
      }
      if (isFreeEmailProvider(normalizedEmail)) {
        const err = new Error('A professional corporate email is required for company accounts. Please do not use a free email provider.');
        err.statusCode = 400;
        return next(err);
      }
      finalCompanyName = companyName.trim();
    }

    // 3. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Create User document
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      accountType: accountType === 'company' ? 'company' : 'personal',
      companyName: finalCompanyName
    });

    // We rely on Mongoose validation here to catch any email regex issues, etc.
    try {
      await user.save();
    } catch (saveError) {
      // Safely handle MongoDB duplicate-key error (11000) for race conditions
      if (saveError.code === 11000) {
        const err = new Error('User with this email already exists');
        err.statusCode = 409;
        return next(err);
      }
      // Pass other Mongoose validation errors to central handler
      if (saveError.name === 'ValidationError') {
        saveError.statusCode = 400;
      }
      return next(saveError);
    }

    // 5. Return safe user information (201 Created)
    res.status(201).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || typeof email !== 'string' || email.trim() === '') {
      const err = new Error('Email is required');
      err.statusCode = 400;
      return next(err);
    }
    
    if (!password || typeof password !== 'string' || password === '') {
      const err = new Error('Password is required');
      err.statusCode = 400;
      return next(err);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Find user (must explicitly select passwordHash)
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    
    // Generic error to prevent email enumeration
    const authError = new Error('Invalid email or password');
    authError.statusCode = 401;

    if (!user) {
      return next(authError);
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(authError);
    }

    // Auto-grant full enterprise company & pro rights to master developer email
    if (user.email === 'mabdulrasheedtalal@gmail.com') {
      if (user.accountType !== 'company' || user.subscriptionPlan !== 'pro') {
        user.accountType = 'company';
        user.subscriptionPlan = 'pro';
        if (!user.companyName) user.companyName = 'DevFlow Enterprise';
        await user.save();
      }
    }

    // 4. Generate JWT
    const token = jwt.sign({ id: user._id.toString() }, env.jwtSecret, {
      expiresIn: '1d',
    });

    // 5. Set JWT as HttpOnly cookie
    res.cookie('devflow_access_token', token, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/'
    });

    // 6. Return safe user info (without token in body)
    res.status(200).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    // Auto-grant full enterprise company & pro rights to master developer email
    if (user.email === 'mabdulrasheedtalal@gmail.com') {
      if (user.accountType !== 'company' || user.subscriptionPlan !== 'pro') {
        user.accountType = 'company';
        user.subscriptionPlan = 'pro';
        if (!user.companyName) user.companyName = 'DevFlow Enterprise';
        await user.save();
      }
    }
    
    res.status(200).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (client should clear token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = (req, res, next) => {
  // Clear the HttpOnly authentication cookie
  res.clearCookie('devflow_access_token', {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Handle GitHub OAuth callback
 * @route   POST /api/auth/github/callback
 * @access  Public
 */
export const githubCallback = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'GitHub code is required' });
    }

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: env.githubClientId || process.env.GITHUB_CLIENT_ID,
        client_secret: env.githubClientSecret || process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res.status(400).json({ success: false, message: tokenData.error_description || tokenData.error });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch GitHub user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = await userResponse.json();
    if (!githubUser.id) {
      return res.status(400).json({ success: false, message: 'Failed to fetch GitHub profile' });
    }

    // 3. Determine if user is already logged in (Linking Flow)
    const tokenCookie = req.cookies?.devflow_access_token;
    let currentUserId = null;
    
    if (tokenCookie) {
      try {
        const decoded = jwt.verify(tokenCookie, env.jwtSecret);
        currentUserId = decoded.id;
      } catch (err) {
        // Token invalid/expired, ignore and fall back to login flow
      }
    }

    if (currentUserId) {
      // LINKING FLOW
      const user = await User.findById(currentUserId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      // Check if this GitHub account is already linked to another user
      const existingGitUser = await User.findOne({ githubId: githubUser.id.toString(), _id: { $ne: currentUserId } });
      if (existingGitUser) {
        return res.status(400).json({ success: false, message: 'This GitHub account is already linked to another DevFlow account.' });
      }

      user.githubId = githubUser.id.toString();
      user.githubUsername = githubUser.login;
      user.githubAccessToken = accessToken;
      
      // Update avatar if they don't have one
      if (!user.avatarUrl && githubUser.avatar_url) {
        user.avatarUrl = githubUser.avatar_url;
      }
      
      await user.save();
      
      return res.status(200).json({
        success: true,
        data: user.toSafeObject(),
        message: 'GitHub account linked successfully'
      });
    }

    // LOGIN / REGISTER FLOW
    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (!user) {
      // Check if email matches existing account to link implicitly
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const emails = await emailRes.json();
      const primaryEmailObj = emails.find(e => e.primary) || emails[0];
      const email = primaryEmailObj ? primaryEmailObj.email : `${githubUser.login}@github.devflow.local`;

      user = await User.findOne({ email });

      if (user) {
        // Link to existing user implicitly
        user.githubId = githubUser.id.toString();
        user.githubUsername = githubUser.login;
        user.githubAccessToken = accessToken;
        if (!user.avatarUrl) user.avatarUrl = githubUser.avatar_url;
        await user.save();
      } else {
        // Register new user
        // Generate random password hash since they use OAuth
        const randomPass = await bcrypt.hash(Math.random().toString(36).slice(-8) + 'DevFlow!', 10);
        user = new User({
          name: githubUser.name || githubUser.login,
          email,
          passwordHash: randomPass,
          githubId: githubUser.id.toString(),
          githubUsername: githubUser.login,
          githubAccessToken: accessToken,
          avatarUrl: githubUser.avatar_url,
          accountType: 'personal',
        });
        await user.save();
      }
    } else {
      // Update access token just in case
      user.githubAccessToken = accessToken;
      user.githubUsername = githubUser.login;
      await user.save();
    }

    // 4. Generate JWT
    const token = jwt.sign({ id: user._id.toString() }, env.jwtSecret, {
      expiresIn: '1d',
    });

    res.cookie('devflow_access_token', token, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.status(200).json({
      success: true,
      data: user.toSafeObject(),
      message: 'Logged in with GitHub'
    });
  } catch (error) {
    next(error);
  }
};
