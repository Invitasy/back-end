# Wedding Check-In System Backend

A Node.js backend system for managing wedding guest check-ins, built with Express.js, MySQL, and Firebase Authentication.

## Features

- Guest management (add, edit, delete guests)
- QR code-based check-in system
- Manual check-in option for physical invitations
- Souvenir management (individual/family-based)
- Admin management with role-based access control
- Real-time check-in statistics and history
- Secure authentication using Firebase

## Prerequisites

- Node.js >= 18
- MySQL >= 8.0
- Firebase account
- Google Cloud Platform account (for storage)

## Database Setup

1. Install MySQL 8.0 or higher

2. First-time setup (choose one method):

   ### Method A: Using init.sql (Manual Setup)
   ```sql
   mysql -u root -p < database/init.sql
   ```
   This creates the database and initial structure.

   ### Method B: Using Migrations (Recommended)
   1. Create the database manually:
   ```sql
   CREATE DATABASE wedding_check_in;
   ```
   2. Configure .env with database credentials
   3. Run migrations:
   ```bash
   npm run migrate
   ```

   The migration system keeps track of all schema changes and ensures consistency across environments.

## Making Database Changes

Always use migrations for any database changes after initial setup:

1. Create a new migration file in `database/migrations/`
   Example: `002_add_phone_number.sql`

2. Run the migration:
   ```bash
   npm run migrate
   ```

This ensures all changes are tracked and can be reproduced in other environments.

## Installation & Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
4. Configure your MySQL connection in `.env`:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=wedding_check_in
   DB_PORT=3306
   ```
5. Run database migrations:
   ```bash
   npm run migrate
   ```

## Default Superadmin Credentials
After running migrations, you can login with:
- Email: admin@admin.com
- Password: admin123

Make sure to change these credentials in production!

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/login - Admin login
- POST /api/auth/logout - Admin logout

### Guest Management
- GET /api/guests - Get all guests
- POST /api/guests - Add new guest
- PUT /api/guests/:id - Update guest
- DELETE /api/guests/:id - Delete guest

### Check-in
- POST /api/qr/scan - QR code check-in
- POST /api/guests/:id/manual-check-in - Manual check-in

### Dashboard
- GET /api/dashboard/stats - Get check-in statistics
- GET /api/dashboard/check-in-history - Get recent check-ins

### Admin Management (Superadmin only)
- POST /api/auth/admin - Create admin account
- DELETE /api/auth/admin/:id - Delete admin account

## Docker Support

Build the image:
```bash
docker build -t wedding-checkin .
```

Run the container:
```bash
docker run -p 5000:5000 --env-file .env wedding-checkin
```

## Database Migration

To create a new migration:
1. Add new SQL file in `database/migrations/` with naming pattern: `XXX_description.sql`
2. Run migrations:
   ```bash
   npm run migrate
   ```

## Environment Variables

See `.env.example` for all required environment variables.