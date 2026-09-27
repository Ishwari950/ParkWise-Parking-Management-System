# ParkWise – Parking Management System

ParkWise is a dynamic Node.js and Express web application for managing parking slots and vehicle parking records.

## Features
- Parking dashboard
- Add/park a vehicle
- Validate parking data
- Show available and occupied slots
- Release a parked vehicle
- JSON API at `/api/parking`
- Health check at `/health`
- Automated tests
- ESLint quality check
- Docker build
- GitHub Actions CI/CD
- Render deployment

## Run locally

```bash
npm install
npm test
npm run lint
npm start
```

Open: http://localhost:3000

## CI/CD flow

Git push → Lint → Test → Docker Build → Deploy → Live ParkWise

## Technology
Node.js, Express, Git, GitHub, GitHub Actions, Docker, Render
