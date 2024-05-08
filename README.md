## Installation

```sh
npm install
```

Setup your environment variables

Create a `.env` file in the root of your project and add the following:

```
DATABASE_URL="file:./dev.db"
```

## Development

Set up the database:

```sh
npx prisma db push

npx prisma db seed
```

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```