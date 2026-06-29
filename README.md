# Insider — Interior Design Studio Website

Marketing + portfolio website for **Insider Limited** (Dhaka) with a custom content admin panel.

## Stack
- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**
- **Framer Motion** + **Lenis** (smooth scroll / motion)
- **Prisma** + **SQLite** (dev) — swap `DATABASE_URL` to Postgres for production
- Custom cookie/JWT auth (`jose` + `bcryptjs`)
- Local image uploads to `public/uploads`

## Getting started
```bash
npm install
npx prisma db push      # create the database
npm run seed            # admin user, settings, sample project
npm run dev             # http://localhost:3000
```

## Admin panel
- URL: **/admin** (redirects to /admin/login)
- Default credentials (from `.env`, change before launch):
  - email: `admin@insider.com.bd`
  - password: `insider2026`

### What the client can manage
- **Projects** — title, category, location, area, year, duration, rooms, description, design style, testimonial
- **Two image galleries per project** — 3D renders + Live photos (toggle on the project page)
- **Categories** — dynamic project types (Residential, Commercial, …)
- **Services** — homepage / services cards
- **Site settings** — hero text, rotating words, about, contact details
- **Messages** — contact-form submissions

## Project structure
- `src/app/(site)` — public website
- `src/app/admin` — admin panel (`(panel)` group is auth-protected)
- `src/app/api/upload` — image upload endpoint
- `src/components/site` · `src/components/admin` — UI
- `prisma/schema.prisma` — data model · `prisma/seed.ts` — seed data

## Production notes (when hosting is chosen)
- Set a strong `AUTH_SECRET` and a real admin password
- Switch `DATABASE_URL` to Postgres (e.g. Neon) — no code changes needed
- Move uploads to cloud storage (S3 / Cloudinary / UploadThing)
- Deploy frontend to Vercel
