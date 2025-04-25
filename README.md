# Health Information System

Date: April 24, 2025  
By: ARON KIPYEGON MUTAI

## Description

This Health Information System is a modern React application designed to manage health programs and client information. It provides a comprehensive interface for healthcare administrators to create health programs, register clients, enroll clients in various health programs, and search for client information.

The application features a clean, responsive UI built with React and Tailwind CSS, providing an efficient workflow for healthcare management tasks.

## Setup Instructions

1. Clone the repository to your local machine
2. Navigate to the project directory and run `npm install` to install dependencies
3. Start the backend server with `npm run server`. This will run your backend on port `5000`
4. In a new terminal, run `npm start` to launch the frontend application

Make sure to verify that your backend is working by opening http://127.0.0.1:5000/api/programs and http://127.0.0.1:5000/api/clients in your browser before proceeding.USE POSTMAN

## Core Features

As a healthcare administrator:

1. **Health Program Management**: Create and view health programs (e.g., TB, Malaria, HIV)
2. **Client Registration**: Register new clients with unique IDs and personal information
3. **Program Enrollment**: Enroll clients in one or more health programs
4. **Client Search**: Search for clients by name and view their detailed profiles
5. **Real-time Data Updates**: All changes sync with the backend for data persistence

## API Endpoints

The base URL for your backend is: `http://127.0.0.1:5000`

### Programs:
- `GET /api/programs` - Retrieve all health programs
- `POST /api/programs` - Create a new health program
  
  Required Headers:
  ```
  {
    "Content-Type": "application/json"
  }
  ```
  
  Request Body:
  ```json
  {
    "name": "string"
  }
  ```

### Clients:
- `GET /api/clients` - Retrieve all clients
- `GET /api/clients/:id` - Retrieve a specific client by ID
- `POST /api/clients` - Register a new client
  
  Required Headers:
  ```
  {
    "Content-Type": "application/json"
  }
  ```
  
  Request Body:
  ```json
  {
    "id": "string",
    "name": "string",
    "age": "number",
    "gender": "string",
    "contact": "string",
    "programs": "array"
  }
  ```

- `PUT /api/clients/:id/enroll` - Enroll a client in programs
  
  Required Headers:
  ```
  {
    "Content-Type": "application/json"
  }
  ```
  
  Request Body:
  ```json
  {
    "programs": ["1", "2"]
  }
  ```

## Technologies Used

- **Frontend**: React, React Hooks, Tailwind CSS
- **State Management**: React useState and useEffect Hooks
- **Backend Communication**: Fetch API
- **UI Components**: Custom React components with Tailwind styling

## Component Structure

The application consists of the following main tabs:

1. **Create Program**: Interface to create and view health programs
2. **Register Client**: Form to register new clients with generated unique IDs
3. **Enroll Client**: Interface to select clients and enroll them in programs
4. **Search Client**: Search functionality to find clients by name
5. **Client Profile**: Detailed view of client information and enrolled programs

## Advanced Features (Future Development)

1. **Authentication and Authorization**: Secure login for healthcare staff
2. **Appointment Scheduling**: Schedule and manage client appointments
3. **Health Records**: Store and retrieve client health records
4. **Data Analytics**: Visualize program enrollment and client statistics
5. **Export Functionality**: Export client and program data in various formats

## Support and Contact Details

For any questions, feedback, or contributions, please contact:

https://github.com/bscit-05-39008695
