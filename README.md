> [!NOTE]
> This project is work in progress and is not yet complete. The README will be updated as the project progresses.

# Auth Server
A lightweight and powerful auth server to connect via REST API. This project is created with Node.js and useful libraries like **Fastify**, **jsonwebtoken** and **Prisma**. The authentication server uses stateless JWT tokens to authenticate users.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [API](#api)
- [Configuration](#configuration)
- [Installation](#installation)

## Features
- User registration and login
- JWT Access and Refresh Token authentication
- Password hashing with bcrypt
- Protected routes via Bearer Token
- PostgreSQL database with Prisma ORM

## Technologies
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org) | Runtime |
| [Fastify](https://fastify.dev) | Web framework - Server |
| [Prisma](https://prisma.io) | ORM & migrations |
| [PostgreSQL](https://postgresql.org) | Database |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT signing & verification |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing |
| [Docker](https://docker.com) | PostgreSQL container |

## API

### Auth
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login and receive tokens |
| POST | `/refresh` | ❌ | Get a new access token |
| POST | `/logout` | ✅ | Logout and invalidate refresh token |

### User
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| GET | `/me` | ✅ | Get current user info |

### Request & Response Examples

#### POST `/register`
```json
{
    "email": "user@example.com",
    "username": "myuser",
    "password": "password123"
}
```

#### POST `/login`
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

Response:
```json
{
    "statusCode": 200,
    "message": "Login successful",
    "accessToken": "...",
    "refreshToken": "..."
}
```

#### POST `/refresh`
```json
{
    "token": "your-refresh-token"
}
```

## Configuration
The project already offers a `.env.example` file in the root directory, which can be renamed to `.env` and used.
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"
POSTGRES_HOST=localhost
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=auth_db
POSTGRES_PORT=5432

ACCESS_TOKEN_SECRET="your-access-secret"
REFRESH_TOKEN_SECRET="your-refresh-secret"
```

## Installation

### Prerequisites
- Node.js 18+
- Docker

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/NikollbibajNoah/auth-server.git

# 2. Install dependencies
cd auth-server
npm install

# 3. Start PostgreSQL
docker-compose up -d

# 4. Run migrations
npx prisma migrate dev

# 5. Build and start
npm run build
npm start
```

The server is available at: `http://localhost:8080`