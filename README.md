# 🧠 quick-notes-local-dominator

## 1. Clone the repository
```sh
git clone https://github.com/your-username/your-project.git
cd your-project
```

## 2. Create an .env file

Create a .env files in services:

```sh
cp ./apps/backend/.env.example ./apps/backend/.env
cp ./apps/frontend/.env.example ./apps/frontend/.env
```


Edit the .env file in every service to match your local environment:

### Backend
#### PostgreSQL
```sh
DATABASE_URL="postgresql://quicknotes:quicknotes@localhost:5432/quicknotes?schema=public"
```

#### Redis
```sh
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### JWT
```sh
JWT_SECRET="your_secret_here"
```

### Frontend
```sh
VITE_API_URL=http://localhost:3000
```

## 3. Install dependencies
npm install

## 4. Start the app
```sh
npm run dev:backend
npm run dev:frontend
```

Your backend will be running at 👉 http://localhost:3000

Your frontend will be running at 👉 http://localhost:4200


## 5. Build and start using Docker Compose

Make sure you have Docker and Docker Compose installed.

```sh
docker-compose up --build
```


This will:

This will build services (frontend and backend)
and will run postgres and redis

## 6. Stop and remove containers
```sh
docker-compose down
```


To also remove volumes:

```sh
docker-compose down -v
```