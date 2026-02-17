# MySandbox.codes - Frontend

Next.js 14 frontend for MySandbox.codes

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** + **shadcn/ui**
- **React Query** (data fetching)
- **Zustand** (state management)
- **next-intl** (i18n)

## Getting Started

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel dashboard for automatic deploys.

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.mysandbox.codes/api
NEXT_PUBLIC_CDN_URL=https://cdn.mysandbox.codes
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

## Features

- ✅ Authentication (register, login)
- ✅ Dashboard
- ✅ Profile editor
- ✅ Link management
- ✅ Theme customization (PRO)
- ✅ Analytics
- ✅ Stripe checkout
- ✅ i18n (pt-BR, en, es)
- ✅ Responsive design

## License

MIT
