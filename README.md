# WhenWe — Smarter Scheduling with AI

WhenWe is an AI-powered scheduling assistant designed to help busy people find the best times to meet.
It automatically compares your Google Calendar availability, preferences, and priorities with your friends’, then uses AI to suggest the optimal meeting time — so you never have to message “when are you free?” again.

## Hackathon Submission

This project was built for Hornet Hacks 3.0, a Sacramento State hackathon.
WhenWe was developed as a proof of concept to demonstrate how AI + calendar data can solve real-world coordination challenges in an elegant, user-friendly way.

## Features

### Google Calendar Integration:
  - Fetches real events only when needed — no data permanently stored.

### Smart Preferences & Ratings:
  - Users can describe natural-language preferences (e.g. “Mondays after 5 PM suck”).
    
  - Numeric ratings prioritize areas of life — e.g., family, school, work.
    
  - AI uses these to recommend balanced meeting times.

### Friends & Social Layer
  - Add or remove friends directly from your dashboard.
    
  - View and compare availability for scheduling.

### Simple Local Setup
  - Backend uses FastAPI + SQLite.
    
  - Frontend built with Angular + Kendo Scheduler + Material UI.
    
  - Fully runnable locally for hackathon/demo use.

## Tech Stack
- Frontend:	Angular, TypeScript, Material UI, Kendo Scheduler
  
- Backend:	FastAPI, SQLAlchemy, SQLite

- Auth	JWT for user login, Google OAuth for calendar access
  
- AI Scheduling	OpenAI API (for intelligent time suggestions)

## Architecture Overview

### Frontend Flow: 

  - User logs in with email/password.

  - Optionally connects Google Calendar (OAuth popup → token saved).

  - Can add/remove friends, set preferences, and view events.

### Backend Flow: 

  - FastAPI handles /auth/login, /users/me, /users/me/preferences, /users/me/friends, etc.

  - SQLite stores users, friendships, ratings, and Google API tokens.

  - When an AI scheduling request is made, the backend fetches events live from Google and merges user data.

## Local Setup
### Backend:
    cd backend

    python3 -m venv venv

    source venv/bin/activate

    pip install -r requirements.txt

    uvicorn app.main:app --reload


### Environment Variables

    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    JWT_SECRET=your_jwt_secret
    OPENAI_API_KEY=your_openai_key

### Frontend
    cd frontend
    
    npm install
    
    ng serve

Visit 👉 http://localhost:4200

## AI Scheduling (Overview)

WhenWe uses OpenAI’s API to:

1. Parse users’ Google Calendar events.

2. Analyze their preferences and ratings.

3. Suggest the best mutual meeting window.

Example prompt:

`Find a 1-hour meeting time between Alice and Bob that avoids family time and honors both preferences.`

## Inspiration

Scheduling is one of the hardest parts of adult life especially when everyone’s calendar is full.
WhenWe bridges that gap by combining real-time schedule data with AI reasoning, helping people spend less time coordinating and more time connecting.
