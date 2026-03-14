# Auth API (Simple)

This file explains the basic auth endpoints and how to use them.

## Env vars
- `JWT_SECRET` (required for production)
- `JWT_EXPIRES_IN` (optional, default: `7d`)
- `BCRYPT_ROUNDS` (optional, default: `10`)

## Endpoints

### Register
`POST /api/auth/register`

Body:
```json
{
  "user": "Your Name",
  "email": "you@example.com",
  "password": "your-password"
}
```

Response:
```json
{
  "user": {
    "id": "...",
    "user": "Your Name",
    "email": "you@example.com",
    "role": "user",
    "createdAt": "..."
  },
  "token": "JWT_TOKEN"
}
```

### Login
`POST /api/auth/login`

Body:
```json
{
  "email": "you@example.com",
  "password": "your-password"
}
```

Response:
```json
{
  "user": { "...": "..." },
  "token": "JWT_TOKEN"
}
```

### Me (current user)
`GET /api/auth/me`

Header:
`Authorization: Bearer JWT_TOKEN`

Response:
```json
{
  "user": { "...": "..." }
}
```

### Logout
`POST /api/auth/logout`

Note: This is stateless. The client should delete the token on logout.
