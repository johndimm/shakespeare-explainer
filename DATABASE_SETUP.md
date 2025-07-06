# Database Setup Guide

## Option 1: Use Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > Database to get your connection string
4. Update your `.env.local` file with:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

## Option 2: Use Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database named `shakespeare_explainer`
3. Update your `.env.local` file with:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/shakespeare_explainer
   ```

## Option 3: Use Railway (Free Tier)

1. Go to [railway.app](https://railway.app) and create an account
2. Create a new project with PostgreSQL
3. Copy the connection string from the project settings
4. Update your `.env.local` file with the connection string

## After Setting Up Database

1. Run the migration:
   ```bash
   npx prisma migrate dev --name init
   ```

2. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set up OAuth consent screen
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `http://localhost:3001` (if using port 3001)
   - Your production domain
7. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production domain
8. Copy the Client ID and add to your `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
   ```

## Environment Variables Checklist

Make sure your `.env.local` file has:

```
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# Database Configuration
DATABASE_URL=your_database_connection_string

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Testing the Setup

1. Start your development server: `npm run dev`
2. Click the "Sign In" button
3. Try both Google Sign-In and email registration
4. Check that users are created in your database
5. Test the chat functionality with usage tracking 