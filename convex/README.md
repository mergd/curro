# Convex Auth Setup

This project uses Convex's built-in authentication system. Here's what's included:

## 🔧 Setup Instructions

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

### 2. Convex Setup

1. Install Convex CLI: `npm install -g convex`
2. Login to Convex: `npx convex login`
3. Initialize deployment: `npx convex deploy`
4. Copy the deployment URL to `NEXT_PUBLIC_CONVEX_URL`

### 3. Authentication Setup

1. Generate an auth secret: `openssl rand -base64 32`
2. Copy the secret to `AUTH_SECRET` in your `.env.local`
3. (Optional) Set up OAuth providers by adding their credentials

### 4. Convex Auth Configuration

The auth configuration is set up in `convex/auth.ts`. Currently supports anonymous authentication with optional OAuth providers.

## 📊 Database Schema

The schema includes:

- **users**: User accounts (managed by Convex Auth)
- **authSessions**, **authAccounts**: Authentication tables (managed by Convex Auth)
- **messages**: Public messages (no auth required to read)
- **notes**: Private user notes (auth required)

## 🔐 Authentication Flow

### Public Routes

- `/` - Homepage with sign-in option
- `/messages` - Public message board (anyone can read, auth required to post)

### Protected Routes

- `/dashboard` - User dashboard with profile and notes
- `/notes` - User's private notes

## 🚀 Demo Features

### Public Message Board (`/messages`)

- Anyone can read messages
- Must be signed in to post
- Shows author name for authenticated users

### User Dashboard (`/dashboard`)

- Protected route (requires authentication)
- Shows user profile info
- Create and manage private notes

### Authentication Components

- `UserButton` - Sign in/out button with user info
- Anonymous authentication (no signup required)
- Secure data access with user-specific queries

## 🔄 Authentication Flow

Convex Auth handles user sessions automatically:

1. Users sign in anonymously or via OAuth
2. Sessions are managed by Convex Auth
3. User data is automatically isolated by user ID

## 📁 File Structure

```
convex/
├── auth.ts            # Convex Auth configuration
├── auth.config.ts     # Auth provider config
├── schema.ts          # Database schema (includes auth tables)
├── messages.ts        # Public message functions
└── notes.ts           # Private note functions
```

## 🧪 Testing Authentication

1. Visit `/` and click "Sign In" (creates anonymous session)
2. Visit `/dashboard` to see your user info
3. Create some notes (private to your session)
4. Visit `/messages` to post public messages
5. Sign out and verify public routes still work
6. Sign in again to get a new anonymous session

A query function that takes two arguments looks like:

```ts
// functions.js
import { v } from "convex/values";

import { query } from "./_generated/server";

export const myQueryFunction = query({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Read the database as many times as you need here.
    // See https://docs.convex.dev/database/reading-data.
    const documents = await ctx.db.query("tablename").collect();

    // Arguments passed from the client are properties of the args object.
    console.log(args.first, args.second);

    // Write arbitrary JavaScript here: filter, aggregate, build derived data,
    // remove non-public properties, or create new objects.
    return documents;
  },
});
```

Using this query function in a React component looks like:

```ts
const data = useQuery(api.functions.myQueryFunction, {
  first: 10,
  second: "hello",
});
```

A mutation function looks like:

```ts
// functions.js
import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const myMutationFunction = mutation({
  // Validators for arguments.
  args: {
    first: v.string(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.
    const message = { body: args.first, author: args.second };
    const id = await ctx.db.insert("messages", message);

    // Optionally, return a value from your mutation.
    return await ctx.db.get(id);
  },
});
```

Using this mutation function in a React component looks like:

```ts
const mutation = useMutation(api.functions.myMutationFunction);
function handleButtonPress() {
  // fire and forget, the most common way to use mutations
  mutation({ first: "Hello!", second: "me" });
  // OR
  // use the result once the mutation has completed
  mutation({ first: "Hello!", second: "me" }).then((result) =>
    console.log(result),
  );
}
```

Use the Convex CLI to push your functions to a deployment. See everything
the Convex CLI can do by running `npx convex -h` in your project root
directory. To learn more, launch the docs with `npx convex docs`.
