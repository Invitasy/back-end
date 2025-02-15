import { Server } from "bun";
import dotenv from 'dotenv';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig.js';
import errorMiddleware from './middleware/errorMiddleware.js';
// Routes
import authRoutes from './route/authRoutes.js';
import guestRoutes from './route/guestRoutes.js';
import qrRoutes from './route/qrRoutes.js';
import dashboardRoutes from './route/dashboardRoutes.js';
import healthRoutes from './route/healthRoutes.js';
import sessionRoutes from './route/sessionRoutes.js';
import backupRoutes from './route/backupRoutes.js';

dotenv.config();

const app = {
  port: process.env.PORT || 5000,
  fetch(req) {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle OPTIONS requests for CORS
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Parse URL to get path
    const url = new URL(req.url);
    const path = url.pathname;

    // Basic health check
    if (path === "/") {
      return Response.json({ 
        status: 'ok', 
        message: 'Server is running',
        docs: '/docs' 
      });
    }

    // API routes
    if (path.startsWith('/api')) {
      // Add your route handlers here
      if (path.startsWith('/api/auth')) {
        return authRoutes.handle(req);
      }
      if (path.startsWith('/api/guests')) {
        return guestRoutes.handle(req);
      }
      if (path.startsWith('/api/qr')) {
        return qrRoutes.handle(req);
      }
      if (path.startsWith('/api/dashboard')) {
        return dashboardRoutes.handle(req);
      }
      if (path.startsWith('/api/health')) {
        return healthRoutes.handle(req);
      }
      if (path.startsWith('/api/admin')) {
        return sessionRoutes.handle(req);
      }
      if (path.startsWith('/api/events')) {
        return backupRoutes.handle(req);
      }
    }

    // Swagger documentation
    if (path.startsWith('/docs')) {
      if (path === '/docs.json') {
        return Response.json(swaggerSpec);
      }
      // Note: You'll need to serve the Swagger UI files separately
      return new Response("API Documentation - Configure swagger-ui for Bun", {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 404 for unmatched routes
    return new Response("Not Found", { status: 404 });
  },

  error(error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export default app;