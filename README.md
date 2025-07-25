# ELTORO SLMS Dashboard

A real-time dashboard system for monitoring ELTORO SLMS devices.

## Features

- Real-time device status monitoring
- Interactive dashboard with charts and maps
- Device management through Boards page
- Alert notifications and management
- Analytics for performance tracking
- User authentication

## Architecture

- **Frontend**: HTML, CSS, JavaScript with Chart.js for data visualization
- **Backend**: Node.js with Express
- **Database**: MongoDB for storing device data
- **Real-time Updates**: AJAX polling (every minute)

## Device Data Structure

Each device has the following parameters:
- **dId**: Device ID (e.g., DEV001, DEV002)
- **p**: POWER status (boolean)
- **s**: SWITCH status (boolean)
- **l**: LIGHT status (boolean)
- **t**: Temperature (number)
- **i**: Current (number)
- **b**: Battery level (number)
- **timestamp**: When the data was recorded

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd eltoro-slms-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/eltoro_slms
   ```
   Replace the MONGO_URI with your actual MongoDB connection string.

4. Start the server:
   ```
   npm start
   ```

5. Open the application in your browser:
   ```
   http://localhost:3000/login.html
   ```

## Usage

1. Log in with your credentials
2. Navigate through the dashboard to view device status
3. Check the Boards page for detailed device information
4. Monitor alerts on the Alerts page
5. View performance metrics on the Analytics page

## Data Source

The application fetches data from the JSP endpoint:
```
http://103.140.194.188:6050/iothub/show.jsp
```

This data is then stored in MongoDB and served to the frontend through the Node.js API.