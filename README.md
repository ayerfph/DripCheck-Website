# DripCheck deployment

## Local development

Create `backend/.env` from `backend/.env.example`, then run:

```bash
cd backend
npm run dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

## Vercel deployment

Import the repository as one Vercel project. Keep the project root at the repository root; the included `vercel.json` builds the Vite frontend and routes `/api/*` to the Express API.

Add these environment variables in Vercel for Production, Preview, and Development as needed:

```text
MONGODB_URI
MONGODB_DATABASE=weatherdb
WEATHERSTACK
FRONTEND=https://your-project.vercel.app
VITE_API_URL=
```

`MONGODB_URI` and `WEATHERSTACK` must remain server-side variables. Do not prefix them with `VITE_`.

In MongoDB Atlas, create a database user and allow connections from Vercel. For initial testing, `0.0.0.0/0` can be used in Atlas Network Access; restrict it further when your hosting setup supports fixed egress IPs.

After adding variables, redeploy the project. Verify:

- `https://your-project.vercel.app/api/health`
- searching for a city from the home page
- opening the dashboard directly or refreshing it
