# Kotak Backend

Basic Express backend for the Kotak Neo login and 2FA API.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and add your Kotak Neo credentials.

## Run

```bash
npm start
```

For development with automatic restarts:

```bash
npm run dev
```

The server runs on `http://localhost:5000` by default.

## Endpoints

- `GET /api/health`
- `POST /api/kotak-neo/login`
- `POST /api/kotak-neo/verify-2fa`
