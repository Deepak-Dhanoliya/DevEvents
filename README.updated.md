# DevEvents

A small event booking app built with Next.js, MongoDB, Cloudinary and PostHog instrumentation.

## Features

- Event listing and details
- Booking/registration flow
- Image uploads via Cloudinary
- Analytics via PostHog

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- MongoDB (Mongoose)
- Cloudinary for file uploads
- Jest for tests

## Requirements

- Node.js (recommended 18+)
- A running MongoDB instance (local or cloud)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root with the variables listed below.

3. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Available scripts

Scripts are defined in `package.json` and available via `npm run <script>`:

- `dev` – start Next.js in development mode
- `build` – build for production
- `start` – start the production server
- `lint` – run ESLint
- `test` – run Jest tests
- `test:watch` – run Jest in watch mode
- `test:coverage` – run tests and collect coverage

Example:

```bash
npm run build
npm start
```

## Environment variables

Create `.env.local` with the following variables (example values shown):

```env
MONGODB_URI="mongodb://localhost:27017/devevents"
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
# NODE_ENV is set automatically by your runtime (development/production)
```

- `MONGODB_URI` — MongoDB connection string used by Mongoose
- `CLOUDINARY_URL` — Cloudinary connection string (used by `cloudinary` SDK)
- `NEXT_PUBLIC_BASE_URL` — base URL used in frontend code
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog public key for client instrumentation

Notes:
- `lib/mongodb.ts` will throw an error if `MONGODB_URI` is not defined.
- Cloudinary's SDK reads `CLOUDINARY_URL` from environment automatically.

## Testing

Run Jest tests with:

```bash
npm run test
```

To view code coverage:

```bash
npm run test:coverage
```

## Deployment

This app can be deployed to Vercel. Ensure environment variables are configured in the deployment target (Vercel dashboard or your CI).

## Project structure (high level)

- `app/` — Next.js app routes and pages
- `components/` — React components
- `lib/` — libraries (MongoDB connector, Cloudinary)
- `database/` — Mongoose models
- `public/` — static assets

## Contributing

PRs and issues are welcome. For larger changes, open an issue first to discuss the approach.

## License

This repository does not include a license file. Add one if you intend to publish or share the project publicly.


