import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig.js';
import errorMiddleware from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './route/authRoutes.js';
import guestRoutes from './route/guestRoutes.js';
import qrRoutes from './route/qrRoutes.js';
import dashboardRoutes from './route/dashboardRoutes.js';
import healthRoutes from './route/healthRoutes.js';

dotenv.config();

const app = express();

// Basic middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger documentation - accessible without authentication
app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Wedding Check-in API Documentation"
}));

// Swagger JSON endpoint - also public
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);

// Basic root health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    docs: '/docs' // Adding docs link to root response
  });
});

// Error handling
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;