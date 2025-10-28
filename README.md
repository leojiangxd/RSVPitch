# RSVPitch

RSVPitch is a soccer match coordination platform that lets players create, join, and organize pickup games with automatic team balancing based on skill and position.

---

## Features

- User registration and login (with authentication and cookies)
- Create matches with city, field, date, time, and player limits
- Join or leave matches
- Automatic team formation balancing goalies and outfielders
- MongoDB Atlas integration for cloud-hosted data
- Environment-based configuration using `.env` for secure credentials

---

## Tech Stack

- Backend: Node.js + Express
- Database: MongoDB (via Mongoose)
- Runtime Tools: Nodemon, dotenv
- Testing: PowerShell REST commands or Postman

---

## Prerequisites

- Node.js (v18 or later)
- npm
- A MongoDB database

## Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/leojiangxd/RSVPitch.git
    cd RSVPitch
    ```

2.  **Install server dependencies:**
    Navigate to the `server` directory and install the required packages.

    ```sh
    cd server
    npm i
    ```

3.  **Install client dependencies:**
    Navigate to the `client` directory and install the required packages.
    ```sh
    cd ../client
    npm i
    ```

### Environment Variables

This project uses environment variables to manage sensitive information and configuration.

#### Server (`/server/.env`)

Create a `.env` file in the `server` directory and add the following variables:

```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
PORT=5000
```

- `MONGO_URI`: Your connection string for your MongoDB database.
- `JWT_SECRET`: A secret string used for signing authentication tokens, this can be anything.
- `PORT`: The port used for the server. The default value is `5000`.

#### Client (`/client/.env`)

Create a `.env` file in the `client` directory and add the following variable:

```
VITE_API_BASE_URL=http://localhost:5000
```

- `VITE_API_BASE_URL`: The URL where the backend server is running. Make sure to use the same port as the backend server. The default value is `http://localhost:5000`.

### Running the Application

You will need to run both the client and server in separate terminal windows.

1.  **Start the server:**
    In the `/server` directory, run:

    ```sh
    npm run dev
    ```

    The server will start, typically on port 5000.

2.  **Start the client:**
    In the `/client` directory, run:
    ```sh
    npm run dev
    ```
    The development server will start, typically on port 5173. You can now open your browser and navigate to the provided URL.
