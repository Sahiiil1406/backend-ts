# DevDAO
## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/devdao-org/backend
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase
   PORT=8000
   GITHUB_CLIENT_ID=
   GITHUB_CLIENT_SECRET=
   GITHUB_CALLBACK_URL=

   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GOOGLE_CALLBACK_URL=

   NODEMAILER_EMAIL=
   NODEMAILER_PASSWORD=

   AWS_BUCKET_NAME=devdao
   AWS_ACCESS_KEY_ID=admin
   AWS_SECRET_ACCESS_KEY=admin123
   AWS_ENDPOINT=http://localhost:9000

   JWT_SECRET=your_access_token_secret
   JWT_REFRESH_SECRET=your_refresh_token_secret
   ACCESS_TOKEN_EXPIRY=  # change to 15 minutes
   REFRESH_TOKEN_EXPIRY=   # 7 days

   ```

## Getting Started

Follow these steps to set up and run the project:

### 1. Start the Database

Launch the PostgreSQL database using Docker:

```bash
docker-compose up -d
```

### 2. Install Dependencies

Install the project dependencies:

```bash
npm install
```

### 3. Build the Project(Optional)

Build the project:

```bash
npm run build
```

### 4. Run Database Migrations

Apply database migrations:

```bash
npm run migrate
```

### 5. Start the Development Server

Start the application in development mode:

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000) (or another configured port).

## Stopping the Application

To stop the database container:

```bash
docker-compose down
```

## Available Commands

- `npm run build` - Build the project
- `npm run migrate` - Run database migrations
- `npm run dev` - Start the development server

## Database Connection

The application uses PostgreSQL with the following connection details:
- **Host**: localhost
- **Port**: 5432
- **Database**: mydatabase
- **Username**: myuser
- **Password**: mypassword
