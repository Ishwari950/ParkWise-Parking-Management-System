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
## Live Deployment

ParkWise is deployed as a Docker-based web service on Render.

- Live Application: https://parkwise-parking-management-system.onrender.com
- Health Check: `/health`
- API Endpoint: `/api/parking`
- CI/CD: GitHub Actions
## Docker Health Check

The Docker container checks the `/health` endpoint every 30 seconds to verify that the ParkWise application is running correctly.

## Main Features

- View total, available, and occupied parking slots
- Park a vehicle with validated details
- Release a parked vehicle
- View parking records
- Access parking data through `/api/parking`
- Monitor application health through `/health`

## Demo Workflow

1. Open the live ParkWise application.
2. Check available and occupied parking slots.
3. Park a vehicle using the form.
4. Release a parked vehicle.
5. Verify the application health at /health.
6. Check parking data through /api/parking.
