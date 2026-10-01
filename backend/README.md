# AirGuard Backend API Service

Node.js / Express backend foundation for the AirGuard platform.

## Architecture & Structure

```
backend/
├── src/
│   ├── config/        # Environment and Firebase configuration
│   ├── controllers/   # Route handler controllers
│   ├── middleware/    # Express middleware (error handling, auth, logging)
│   ├── routes/        # Express API endpoints
│   ├── services/      # Business logic & database operations
│   ├── utils/         # Helper functions and utilities
│   └── server.ts      # Server entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## Setup & Running

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env` and fill in required values:
   ```bash
   cp .env.example .env
   ```

3. **Development Server:**
   ```bash
   npm run dev
   ```

4. **Health Check:**
   Access `http://localhost:5000/api/health` to verify server status.
