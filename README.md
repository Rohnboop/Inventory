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

## Supabase setup

The project includes a VS Code MCP configuration at `.vscode/mcp.json` and a database migration at `supabase/migrations/20260903000000_create_inventory_pos.sql`.

1. Open the project in VS Code and authenticate the `supabase` MCP server when prompted.
2. The MCP URL is already scoped to project `ieneymscqqnshlgmyrwz` in `.vscode/mcp.json`.
3. Apply the migration from the Supabase SQL editor or through the Supabase MCP `apply_migration` tool.

The migration creates categories, products, customers, orders, order items, and inventory movements, then seeds the six products shown in the POS screen. The included policies are for development only and should be replaced with authenticated staff policies before production. Do not commit a Supabase access token; rotate any token shared in chat or source control.

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
