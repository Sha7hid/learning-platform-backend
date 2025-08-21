## Learning Platform Backend (Microservices)

Backend system for a Learning Platform built with Node.js, Express, and MongoDB. It uses JWT authentication and role-based access control (RBAC) across microservices, fronted by an API Gateway.

### Architecture
- **API Gateway** (`/services/api-gateway`): Single public entrypoint, CORS, request logging, and reverse proxy to internal services.
- **Auth Service** (`/services/auth-service`): Registration, login, and user identity. Issues JWTs containing `sub` (user id) and `role`.
- **Course Service** (`/services/course-service`): Categories and Courses management with RBAC.
- **MongoDB**: Single Mongo container with separate databases per service.

### Roles & Permissions
- **Admin**: Full access to manage categories and courses; can view all courses, delete courses.
- **Institute**: Create courses, assign faculties, update own courses.
- **Faculty**: View courses assigned to them.
- **Student**: View published courses.

### Tech Stack
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

### Directory Structure
```
learning-platform-backend/
  docker-compose.yml
  services/
    api-gateway/
      src/index.js
    auth-service/
      src/index.js, routes/auth.js, models/User.js
    course-service/
      src/index.js, routes/{categories,courses}.js, models/{Category,Course}.js
```

### Environment Variables
Set via your shell or `.env` files when running locally. Docker Compose provides same defaults.
- `JWT_SECRET`: Secret string used to sign JWTs (set to a strong value in prod)
- Auth Service: `PORT` (default 3001), `MONGO_URI` (default `mongodb://mongo:27017/authdb`)
- Course Service: `PORT` (default 3002), `MONGO_URI` (default `mongodb://mongo:27017/coursedb`)
- API Gateway: `PORT` (default 3000), `AUTH_SERVICE_URL`, `COURSE_SERVICE_URL`

Example export for local dev (PowerShell):
```powershell
$env:JWT_SECRET = "supersecret"
```

### Run with Docker (recommended)
```bash
# From repository root
docker compose up -d --build

# Services
# API Gateway: http://localhost:3000
# Auth Service: http://localhost:3001
# Course Service: http://localhost:3002
# MongoDB: localhost:27017
```

### Run locally without Docker
```bash
# 1) Auth Service
cd services/auth-service
npm install
set JWT_SECRET=changeme && set PORT=3001 && set MONGO_URI=mongodb://localhost:27017/authdb && npm run dev

# 2) Course Service (new terminal)
cd services/course-service
npm install
set JWT_SECRET=changeme && set PORT=3002 && set MONGO_URI=mongodb://localhost:27017/coursedb && npm run dev

# 3) API Gateway (new terminal)
cd services/api-gateway
npm install
set PORT=3000 && set AUTH_SERVICE_URL=http://localhost:3001 && set COURSE_SERVICE_URL=http://localhost:3002 && npm run dev
```

### API Documentation (via API Gateway)

Auth
- POST `/auth/register`
  - Body: `{ name, email, password, role }` where `role` in `[admin,institute,faculty,student]`
  - 201: `{ token, user }`
- POST `/auth/login`
  - Body: `{ email, password }`
  - 200: `{ token, user }`
- GET `/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - 200: `{ user }`

Categories
- GET `/categories`
  - Public list of categories
- POST `/categories` (admin)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, description? }`
- PUT `/categories/:id` (admin)
- DELETE `/categories/:id` (admin)

Courses
- GET `/courses` (auth required)
  - Behavior by role:
    - admin/institute: all courses
    - faculty: courses where they are assigned
    - student: only published courses
- POST `/courses` (admin, institute)
  - Body: `{ title, description?, categoryId, isPublished? }`
- POST `/courses/:id/assign-faculty` (institute)
  - Body: `{ facultyIds: ["<facultyUserId>", ...] }`
- PUT `/courses/:id` (admin, owning institute)
- DELETE `/courses/:id` (admin)

### Notes on RBAC
- The JWT payload includes `sub` (user id) and `role`.
- Services validate JWT via `Authorization: Bearer <token>` and enforce per-route roles.

### Deployment & GitHub
1) Initialize and push repository
```bash
git init
git add .
git commit -m "feat: learning platform backend (gateway, auth, course)"
git branch -M main
git remote add origin <your_repo_url>
git push -u origin main
```
2) Set `JWT_SECRET` as a secret in your deployment environment.
3) Build images and deploy (Docker, Kubernetes, or PaaS). The services are container-ready with `Dockerfile`s.

### Troubleshooting
- Ensure MongoDB is running and URIs are correct.
- Use valid JWTs for protected routes; expired or invalid tokens return 401.
- For CORS issues, confirm requests go through the gateway at `http://localhost:3000`.


