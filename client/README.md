# Client Application

This is the client application for the investment platform.

## Getting Started

To run the application locally:

```bash
npm install
npm run dev
```

## Features

- User authentication (login, register, password reset)
- Dashboard for account overview
- Investment management
- Deposit and withdrawal functionality
- Profile and security management
- Admin panel for user management

## Project Structure

The project follows a standard React application structure:

- `src/components`: Reusable UI components
- `src/pages`: Page components
- `src/utils`: Utility functions and helpers
- `src/store`: State management using Zustand
- `src/assets`: Static assets like images

## State Management

The application uses Zustand for state management. The main store is defined in `src/store/useStore.js` and includes:

- Authentication state
- User data
- Investment data
- Transaction history
- UI state

## API Integration

The application communicates with a backend API using Axios. API endpoints are defined in the store actions.
