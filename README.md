This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on GitHub Pages

This project is configured for static export (`out/`) so it can be hosted on GitHub Pages.

You have two options:

- User/Org site: https://fisalazarm.github.io (repo must be `fisalazarm.github.io`). No basePath needed.
- Project site: https://fisalazarm.github.io/pokedex (repo `pokedex`). Requires basePath `/pokedex`.

Local build for a project page:

```bash
export NEXT_PUBLIC_BASE_PATH=/pokedex
npm run build
npx serve out
```

Local build for a user site:

```bash
unset NEXT_PUBLIC_BASE_PATH
npm run build
```

CI: A workflow at `.github/workflows/deploy.yml` builds and publishes the `out/` folder to Pages on pushes to `main`.
For a project site, create a repository secret `NEXT_PUBLIC_BASE_PATH` with value `/pokedex`. For a user site, leave it empty.
