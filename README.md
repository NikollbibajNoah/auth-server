> [!NOTE]
> This project is work in progress and is not yet complete. The README will be updated as the project progresses.

# Auth Server
A lightweight and powerful auth server to connect via REST API. This project is created with Node.js and useful libraries like **Fastify**, **jsonwebtoken** and **Prisma**. The authentication server uses stateless JWT tokens to authenticate users.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [API](#api)
- [OAuth 2.0](#oauth-20)
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
    "message": "Login successfull",
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

## OAuth 2.0
The auth server supports the OAuth 2.0 flow for logging in via providers such as Google, GitHub, Facebook, etc. After a successfull redirect-based login, the user is stored in the database without a password.
> [!NOTE]
> Currently the auth server only supports Google and Github OAuth 2.0, but additional providers can be added.

The login endpoints for supported providers are:
`http://localhost:8080/auth/google`
`http://localhost:8080/auth/github`

After a successfull login the server returns the same response format as the traditional login (for example: accessToken and refreshToken).


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

# Auth
ACCESS_TOKEN_SECRET="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
REFRESH_TOKEN_SECRET="1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"

# Frontend
FRONTEND_URL="http://localhost:3000"
FRONTEND_HOSTNAME="localhost"

# OAuth2
OAUTH_CALLBACK_BASE_URL=http://localhost:8080 # Same as backend URL

# Google
GOOGLE_CLIENT_ID="my_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="my_client_secret"

# GitHub
GITHUB_CLIENT_ID="my_client_id"
GITHUB_CLIENT_SECRET="my_client_secret"
```

> [!NOTE]
> Before using OAuth 2.0 you must configure an OAuth client in the Google Cloud Console: https://console.cloud.google.com/ and for github under: settings > developer settings > oauth apps

Steps to configure the Google OAuth 2.0 provider:
1. Create a new project (or select an existing project)
2. Open **APIs and Services** and go to the **OAuth consent screen**. Fill in the required fields (app name, support email, etc.).
3. Choose the user type (typically External for testing with external accounts).
4. Create credentials: select OAuth client ID and set the Application type to **Web application**.
5. Under Authorized redirect URIs add `OAUTH_CALLBACK_BASE_URL/auth/google/callback` (for example: http://localhost:8080/auth/google/callback). The URI must match exactly (scheme, host, port, path).
6. Copy the Client ID and Client Secret into your .env as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
7. Restart your backend after updating .env to ensure the new values are loaded.

Optional note: ensure you configure the correct OAuth client (the one whose Client ID matches `GOOGLE_CLIENT_ID` in your .env and the same for github and all other providers).

## Demo

A minimal test frontend is served directly by the auth server and deployed on Vercel.

🔗 **https://auth-server-hra8.vercel.app**

From there you can:
- Register and login with email and password
- Login via Google OAuth 2.0
- Login via Github OAuth 2.0
- Test token refresh and logout

> Tokens are stored as httpOnly cookies - not visible in JavaScript.

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