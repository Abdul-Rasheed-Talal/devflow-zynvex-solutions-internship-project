import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import env from '../config/env.js';
import Project from '../models/Project.js';

let io;

/**
 * Initialize Socket.IO server attached to the provided HTTP server.
 * Defines authentication and room authorization logic.
 *
 * @param {import('http').Server} httpServer
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.frontendUrl,
      credentials: true,
    },
  });

  // 1. Authentication Middleware
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.request.headers.cookie || '');
      const token = cookies.devflow_access_token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, env.jwtSecret);
      socket.user = { id: decoded.id };
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  // 2. Connection Logic
  io.on('connection', (socket) => {
    // Automatically join the user's private room (for future notifications)
    socket.join(`user_${socket.user.id}`);

    // Handle Project Room Join Request
    socket.on('join_project', async (projectId) => {
      try {
        if (!projectId) return;

        const project = await Project.findById(projectId).lean();
        if (!project) return; // Project does not exist

        // Check if the user is authorized to access the project
        let isAuthorized = false;
        if (project.owner.toString() === socket.user.id) {
          isAuthorized = true;
        } else {
          const member = project.members.find(
            (m) => m.user.toString() === socket.user.id
          );
          if (member) {
            isAuthorized = true;
          }
        }

        if (isAuthorized) {
          socket.join(`project_${projectId}`);
        } else {
          // Unauthorized users trying to join a project they shouldn't see
          socket.emit('error', 'Unauthorized to join this project');
        }
      } catch (err) {
        console.error('Socket join_project error:', err.message);
      }
    });

    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
    });
    
    // Optional: Keep track of disconnections if needed
    socket.on('disconnect', () => {
      // socket.io handles leaving rooms automatically
    });
  });

  return io;
};

/**
 * Get the initialized Socket.IO server instance.
 * Throws if not initialized.
 */
export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
