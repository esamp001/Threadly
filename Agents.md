# About Threadly
Threadly is a social media platform that allows users to share their thoughts and ideas with the world. It is built using React, Node.js, and PostgreSQL.

# Threadly Development Guide

# Quick Start with Docker

This setup allows you to run the application with environment variables on any machine without manual configuration.

### Prerequisites
- Docker installed on your machine
- Git

### Setup on New Machine

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd Threadly
```

2. **Create environment file:**
```bash
# Create .env file in project root
touch .env
```

3. **Add your environment variables to .env:**
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=3000
ORIGIN=http://localhost:5173
CREDENTIALS=true
```

4. **Start the application:**
```bash
cd docker
docker-compose up
```

That's it! The Docker container will:
- Build the backend environment
- Install all dependencies automatically
- Use your .env file for configuration
- Start the server on port 3000

### Docker Configuration Files

- `docker/docker-compose.yml` - Main Docker configuration
- `backend/Dockerfile` - Backend container setup
- `.env` - Environment variables (never committed to git)

### Security Notes

- **Never commit .env files** to version control
- The `.env` file is already in `.gitignore`
- Environment variables are loaded securely into the container
- No hardcoded secrets in Docker configuration

### Development

For local development without Docker:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

# Features

- 🚀 Docker-powered development environment
- 🔐 Secure environment variable management
- 📁 File upload with Cloudinary integration
- 🎨 Modern React frontend with Material-UI
- 📱 Responsive design

This setup ensures anyone can clone your repo, create a simple `.env` file, and run `docker-compose up` to get the full application running without any manual dependency installation or configuration.

## Project Structure

```
Threadly/
├── docker/
│   └── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   └── cloudinary/
│   │       └── setupcloud.js
│   └── package.json
├── src/
│   └── components/
│       └── HomeComponents/
├── .env
└── .gitignore
```

## Environment Variables

Required environment variables for the application:

| Variable | Description | Default |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Required |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Required |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Required |
| `PORT` | Backend server port | 3000 |
| `ORIGIN` | Frontend origin | http://localhost:5173 |
| `CREDENTIALS` | Enable credentials | true |

## Docker Commands

- `docker-compose up` - Start all services
- `docker-compose down` - Stop all services
- `docker-compose logs` - View service logs
- `docker-compose build` - Rebuild containers

## Troubleshooting

**Port conflicts:** If port 3000 is already in use, change the port mapping in `docker-compose.yml`

**Permission issues:** Ensure Docker has proper permissions to access the backend directory

**Environment variables not loading:** Check that `.env` file exists in the project root and is properly formatted