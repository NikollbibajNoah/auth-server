> [!NOTE]
> This project is work in progress and is not yet complete. The README will be updated as the project progresses.

# Auth Server
A lightweight and powerful auth server to connect via REST API. This project is created with Node.js and useful libraries like **Fastify**, **jsonwebtoken** and **Prisma**. The authentication server uses stateless JWT tokens to authenticate users.

It is also published as a ready-to-use Docker image, so it can be dropped into any backend project as a standalone building block without needing this project's source code (see [Run with Docker](#run-with-docker)).

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [API](#api)
- [OAuth 2.0](#oauth-20)
- [Configuration](#configuration)
- [Mailing](#mailing)
- [Demo](#demo)
- [Installation](#installation)
- [Run with Docker](#run-with-docker)

## Features
- User registration and login
- JWT Access and Refresh Token authentication
- Password hashing with bcrypt
- Protected routes via Bearer Token
- Password reset
- Email verification
- Login notification
- PostgreSQL database with Prisma ORM

## Technologies
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org) | Runtime |
| [Fastify](https://fastify.dev) | Web framework - Server |
| [Prisma](https://prisma.io) | ORM & migrations |
| [PostgreSQL](https://postgresql.org) | Database |
| [Jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT signing & verification |
| [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing |
| [Docker](https://docker.com) | PostgreSQL container / deployment image |
| [Jest](https://jestjs.io/) | Testing framework |

## API

### Auth
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login and receive tokens |
| POST | `/refresh` | ❌ | Get a new access token |
| POST | `/logout` | ✅ | Logout and invalidate refresh token |
| GET  | `/verify-email` | ❌ | Verify email after registration |
| POST | `/forgot-password` | ❌ | Send password reset via mail |
| POST | `/reset-password` | ❌ | Confirm new password and reset |
 
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

The login endpoints for supported providers are:
`http://localhost:8080/auth/google`
`http://localhost:8080/auth/github`

After a successfull login the server returns the same response format as the traditional login (for example: accessToken and refreshToken).


## Configuration
The project already offers a `.env.example` file in the root directory, which can be renamed to `.env` and used.
```env
APP_URL=http://localhost:8080

NODE_ENV=development

# Initial admin account, created/updated automatically on every start
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me

# Mailpit config (local development)
MAILPIT_HOST="127.0.0.1"
MAILPIT_PORT=1025
MAILPIT_UI_PORT=8025
MAILPIT_SMTP_PORT=1025

# Resend config (production)
MAIL_API_KEY="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
MAIL_FROM_NAME="Auth Server"
MAIL_FROM_ADDRESS="onboarding@resend.dev"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"

COOKIE_SECRET="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

# Auth
ACCESS_TOKEN_SECRET="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
REFRESH_TOKEN_SECRET="1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"

# Google
GOOGLE_CLIENT_ID="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
GOOGLE_CLIENT_SECRET="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

# GitHub
GITHUB_CLIENT_ID="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
GITHUB_CLIENT_SECRET="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
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

> [!NOTE]
> Follow the online documentation to set up and use oauth app in github: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app

## Mailing
The auth server uses nodemailer to send emails for reseting the password, verify newly registered users and login notification. For local development, mailpit is used as a docker image in the docker compose. The mailpit UI is availble at: `http://localhost:8025`

In production (`NODE_ENV=production`), [Resend](https://resend.com) is used instead via `MAIL_API_KEY`.

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
npx prisma migrate dev && npm run seed

# 5. Build and start
npm run build
npm start
```

The server is available at: `http://localhost:8080`

## Run with Docker

Instead of building from source, you can run the auth-server directly from its published Docker image - useful for dropping it into another backend project without needing this repository's source code at all.

### Image

```
ghcr.io/nikollbibajnoah/auth-server:latest
```

Also available tagged with the corresponding commit SHA for reproducible, pinned versions (see [Packages](https://github.com/NikollbibajNoah/auth-server/pkgs/container/auth-server)).

### What happens automatically

On every container start, the entrypoint:
1. runs any pending database migrations (`prisma migrate deploy`)
2. seeds base roles (`user`, `admin`), permissions, and an admin user (idempotent, safe to run on every start - controlled via `ADMIN_EMAIL` / `ADMIN_USERNAME` / `ADMIN_PASSWORD`, see [Configuration](#configuration))

### docker-compose.example.yml

```yaml
services:
  auth-server:
    image: ghcr.io/nikollbibajnoah/auth-server:latest
    ports:
      - "8080:8080"
    env_file: .env
    environment:
      # These two must point to the service names below,
      # NOT localhost/127.0.0.1 - containers talk to each other via service name.
      POSTGRES_HOST: auth-postgres
      MAILPIT_HOST: mailpit
    depends_on:
      auth-postgres:
        condition: service_healthy
      mailpit:
        condition: service_started

  auth-postgres:
    image: postgres:18
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-auth_db}
    volumes:
      - auth_postgres_data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-user} -d ${POSTGRES_DB:-auth_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Only needed when NODE_ENV=development.
  # With NODE_ENV=production, Resend is used instead (MAIL_API_KEY), so this service can be removed.
  mailpit:
    image: axllent/mailpit
    ports:
      - "8025:8025" # Web UI to inspect sent emails
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1

volumes:
  auth_postgres_data:
```

Use the same `.env` shown in [Configuration](#configuration) as your `env_file`.

### Quick start

```bash
docker compose up -d
```

The server will be available at `http://localhost:8080`.

### Security note

The seeded admin user is created or updated on every start. If `ADMIN_PASSWORD` is not set, an insecure default password is used - always override this for any production deployment.

### Versioning

Every image is published with two tags:

- `latest` — most recent build from `main`
- `<commit-sha>` — exact, reproducible version, recommended for production deployments

```yaml
image: ghcr.io/nikollbibajnoah/auth-server:<commit-sha>
```