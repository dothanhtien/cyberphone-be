# Auth Module

## Overview

The auth module handles customer registration, login, access-token authentication, refresh-token rotation, and logout.

It combines:

- `passport-local` for login with `identifier` + `password`
- `passport-jwt` for bearer-token authentication
- HTTP-only cookies for refresh-token storage
- database-backed refresh tokens with rotation and revocation

By default, the module is protected by a global `JwtAuthGuard`. Endpoints are private unless they are explicitly marked with `@Public()`.

## Module Composition

Main files:

- `src/auth/auth.controller.ts`: HTTP endpoints
- `src/auth/auth.service.ts`: registration, login, refresh, revoke logic
- `src/auth/refresh-token.service.ts`: refresh-token creation, rotation, revocation
- `src/auth/strategies/local.strategy.ts`: credential validation for login
- `src/auth/strategies/jwt.strategy.ts`: bearer-token validation
- `src/auth/guards/jwt-auth.guard.ts`: global auth guard with public-route bypass
- `src/auth/entities/refresh-token.entity.ts`: persisted refresh-token record

Dependencies:

- `UsersModule`
- `CustomersModule`
- `IdentitiesModule`
- `PasswordModule`
- `JwtModule`

## Authentication Model

The module supports two authenticated account types:

- `user`: internal/admin-style users with a `roleId`
- `customer`: storefront customers

Both are normalized into the shared `AuthUser` shape:

```ts
{
  id: string;
  type: 'user' | 'customer';
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  isActive: boolean;
  identityId: string;
  roleId?: string;
}
```

Access-token payload:

```ts
{
  sub: string;
  type: 'user' | 'customer';
  roleId?: string;
  identityId: string;
}
```

## Route Summary

Base path: `/auth`

### `POST /auth/register`

Public endpoint used to create a local login for a customer.

Request body:

```json
{
  "phone": "+84987654321",
  "email": "customer@example.com",
  "password": "Password123",
  "passwordConfirmation": "Password123",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "2000-01-01",
  "gender": "male"
}
```

Validation rules:

- `phone` is required and must match the phone regex in `RegisterDto`
- `email` is optional but must be valid when provided
- `password` is required, minimum 8 chars, and must contain uppercase, lowercase, and a number
- `passwordConfirmation` must match `password`
- `firstName` and `lastName` are required
- `dateOfBirth` is optional and must be `YYYY-MM-DD`
- `gender` is optional and must match the customer enum

Behavior:

1. Checks whether the submitted phone or email already exists in identities.
2. Looks for an active customer with the same phone or email.
3. If a matching customer exists, phone and email must belong to that same customer.
4. If no customer exists, a new customer is created.
5. A local identity is created with a hashed password.

Conflict cases:

- `Phone or email already exists`
- `Phone and email belong to different accounts`
- `Phone and email must match the same existing account`

Response:

```json
{
  "id": "customer-uuid"
}
```

### `POST /auth/login`

Public endpoint protected by `LocalAuthGuard`.

Request body:

```json
{
  "identifier": "customer@example.com",
  "password": "Password123"
}
```

`identifier` can be whichever identity value exists for the local provider, typically phone or email.

Behavior:

1. `LocalStrategy` calls `AuthService.validateUser(identifier, password)`.
2. The matching local identity is loaded from the identities module.
3. Password is verified with `PasswordService`.
4. A JWT access token is signed.
5. A refresh token is generated, hashed, and stored in the database.
6. The refresh token raw value is sent back as an HTTP-only cookie.
7. `lastLoginAt` is updated on the owning account when possible.

Response body:

```json
{
  "data": {
    "id": "account-uuid",
    "type": "customer",
    "phone": "+84987654321",
    "email": "customer@example.com",
    "firstName": "Jane",
    "lastName": "Doe"
  },
  "accessToken": "<jwt>"
}
```

The refresh token is not returned in the JSON response. It is set in the `refresh_token` cookie.

### `GET /auth/me`

Private endpoint that returns the authenticated user resolved from the bearer access token.

Header:

```http
Authorization: Bearer <access-token>
```

Response body:

```json
{
  "id": "account-uuid",
  "type": "customer",
  "phone": "+84987654321",
  "email": "customer@example.com",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

### `POST /auth/refresh-token`

Public endpoint that rotates the refresh token and issues a new access token.

Input source:

- reads the refresh token from the `refresh_token` cookie
- does not read the token from request body

Behavior:

1. Reads the raw refresh token from cookie.
2. Hashes it and loads the stored token row.
3. Rejects missing, revoked, expired, or unknown tokens.
4. Creates a brand-new refresh token row.
5. Revokes the old token and links it with `replacedByToken`.
6. Signs a new access token.
7. Overwrites the cookie with the new refresh token value.

Response body:

```json
{
  "data": {
    "id": "account-uuid",
    "type": "customer",
    "phone": "+84987654321",
    "email": "customer@example.com",
    "firstName": "Jane",
    "lastName": "Doe"
  },
  "accessToken": "<jwt>"
}
```

Common auth failures:

- `Missing refresh token`
- `Invalid refresh token`
- `Refresh token has been revoked`
- `Refresh token has expired`
- `Account not found`

### `POST /auth/logout`

Private endpoint that revokes the current refresh token and clears the cookie.

Requirements:

- valid bearer access token
- `refresh_token` cookie present

Behavior:

1. Authenticates the caller with `JwtAuthGuard`.
2. Reads the refresh token from cookie.
3. Clears the cookie.
4. Revokes the refresh token if it belongs to the authenticated account.

If the token belongs to another account, the service throws:

- `Not authorized to revoke this token`

Response:

- returns `200 OK`
- service result is `void`

## Guard and Strategy Behavior

### Global JWT Guard

`AuthModule` registers `JwtAuthGuard` as an `APP_GUARD`, so every route in the application is protected by default.

Routes become public only when decorated with:

```ts
@Public()
```

### Local Strategy

`LocalStrategy` is configured with:

```ts
super({ usernameField: 'identifier' });
```

That means login expects:

```json
{
  "identifier": "...",
  "password": "..."
}
```

Invalid credentials return:

- `Identifier or Password is invalid`

Unexpected strategy errors are normalized to:

- `Invalid login attempt`

### JWT Strategy

JWTs are extracted from the bearer authorization header:

```http
Authorization: Bearer <token>
```

The strategy:

- validates `sub`, `type`, and `identityId`
- loads the underlying `user` or `customer`
- rejects unknown account types
- rejects missing or inactive accounts

Guard-level JWT errors are mapped to friendlier responses:

- `Token has expired`
- `Token is invalid`
- `Token not active yet`
- `Unauthorized`

## Refresh Token Design

Refresh tokens are designed for server-side control:

- the client receives a raw UUID token
- the database stores only a SHA-256 hash of that token
- each refresh creates a new token and revokes the old one
- revoked tokens cannot be reused
- concurrent rotation is detected and treated as revocation

Stored refresh-token fields:

- `id`
- `identityId`
- `tokenHash`
- `expiresAt`
- `revokedAt`
- `replacedByToken`
- `createdAt`
- `updatedAt`

This supports:

- token rotation
- logout revocation
- replay resistance for already-rotated tokens
- auditability of token replacement chains

## Cookie Behavior

Cookie name:

```txt
refresh_token
```

Cookie options are derived from configuration:

- `httpOnly: true`
- `path: /`
- `maxAge: REFRESH_TOKEN_TTL * 1000`
- `secure: NODE_ENV === 'production'`
- `sameSite: 'none'` in production
- `sameSite: 'lax'` outside production
- `domain: COOKIE_DOMAIN` only when configured

This means cross-site refresh cookies in production require HTTPS and a compatible frontend cookie configuration.

## Required Configuration

The module depends on these configuration values:

- `JWT_ACCESS_SECRET`: secret used to sign and verify access tokens
- `ACCESS_TOKEN_TTL`: access-token expiration in seconds
- `REFRESH_TOKEN_TTL`: refresh-token expiration in seconds
- `COOKIE_DOMAIN`: optional cookie domain
- `NODE_ENV`: controls `secure` and `sameSite` cookie behavior

`ACCESS_TOKEN_TTL` must be a positive numeric value. Module boot fails if it is missing or invalid.

## End-to-End Flow

### Customer registration flow

1. Client calls `POST /auth/register`.
2. Service creates or resolves the customer record.
3. Service creates a `LOCAL` identity with hashed password.

### Login flow

1. Client calls `POST /auth/login` with `identifier` and `password`.
2. Server validates the local identity.
3. Server returns an access token in JSON.
4. Server sets `refresh_token` as an HTTP-only cookie.

### Authenticated request flow

1. Client sends `Authorization: Bearer <access-token>`.
2. `JwtStrategy` loads the owning account.
3. Controller accesses the user through `@LoggedInUser()`.

### Refresh flow

1. Client calls `POST /auth/refresh-token` with the cookie attached.
2. Old refresh token is validated and rotated.
3. A new access token is returned.
4. A new refresh-token cookie replaces the old one.

### Logout flow

1. Client calls `POST /auth/logout` with bearer token and cookie.
2. Server clears the cookie.
3. Server revokes the refresh token in storage.

## Notes for Frontend Integration

- Persist the access token on the client and send it as a bearer token.
- Allow cookies on login, refresh, and logout requests.
- Do not expect the refresh token in response JSON.
- If the frontend and backend are on different origins in production, cookie settings must support cross-site credentials.

Example fetch usage:

```ts
await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    identifier: 'customer@example.com',
    password: 'Password123',
  }),
});
```
