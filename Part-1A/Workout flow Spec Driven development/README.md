# Repbook Workout Tracker

A local, single-user workout tracker. The app stores its session history in a
SQLite database on the same device and binds the API to loopback only.

## Requirements

- Node.js 26 LTS and npm.
- A modern desktop or mobile browser.

## Run locally

In one terminal:

```sh
cd backend
npm install
npm run dev
```

In another terminal:

```sh
cd frontend
npm install
npm run dev
```

Open <http://127.0.0.1:5173>. The backend listens on
<http://127.0.0.1:3000>; configure `PORT` or `WORKOUT_DB_PATH` to change its
port or database file. The default database is `data/workouts.sqlite`.

## Test

```sh
cd backend && npm test
cd ../frontend && npm test
```

Backend service and validator coverage gates:

```sh
cd backend && npm run coverage
```

Frontend reducer coverage gate:

```sh
cd frontend && npm run coverage
```

The implementation and data-entry validation scenarios are documented in
[`specs/001-workout-session-tracking/quickstart.md`](specs/001-workout-session-tracking/quickstart.md).

## Data

The database file is created on first API startup and is ignored by Git. To
back it up, stop the backend and copy `data/workouts.sqlite`. Keep this file
private; v1 has no sign-in because it is intended for one user on one device.
