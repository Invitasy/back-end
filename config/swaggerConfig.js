import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wedding Check-in System API',
      version: '1.0.0',
      description: 'API documentation for Wedding Check-in System',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Guests',
        description: 'Guest management endpoints'
      },
      {
        name: 'QR Code',
        description: 'QR code operations'
      },
      {
        name: 'Dashboard',
        description: 'Statistics and monitoring'
      },
      {
        name: 'Backup & Export',
        description: 'Event backup and export operations'
      },
      {
        name: 'Health & Monitoring',
        description: 'System health and monitoring'
      },
      {
        name: 'Session Management',
        description: 'Admin session and device management'
      }
    ]
  },
  apis: [
    './docs/*.yml',
    './route/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;