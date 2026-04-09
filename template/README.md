# Welcome to your Hakuto Website

This is the Hakuto marketing/docs website template. It’s built with Astro and uses shadcn/ui via React islands. The site is bundled to `dist/` and deployed to Cloudflare Workers.

## Project info

**Repo**: <YOUR_REPO_URL>

**Preview/Prod URL**: <YOUR_SITE_URL>

Template note: Placeholders like `<YOUR_…>` are intentional. Replace them when you initialize a real site.

Note: Cloudflare Worker/project name uses the placeholder prefix `hakuto-site-`. Append an identifier per site (e.g., `hakuto-site-landing`).

## How can I edit this code?

**Use your preferred IDE**

If you want to work locally using your own editor, clone this repo and push changes.

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
bun install

# Step 4: Start the development server (auto-reload + instant preview)
bun run dev
```

Alternative (Node/npm):

```sh
npm install
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon)
- Make your changes and commit

**Use GitHub Codespaces**

- Open your repository
- Click `Code` → `Codespaces`
- Create a new Codespace to edit in the browser
- Commit and push changes when done

## What technologies are used for this project?

This project is built with:

- Astro 5.x
- TypeScript
- React (islands)
- shadcn/ui
- Tailwind CSS
- Biome
- Bun

## Project structure

```
src/
├─ components/
│  ├─ ui/            # shadcn/ui React components
│  └─ *.astro        # Astro components
├─ layouts/          # Astro layouts
├─ pages/            # Routes
└─ index.css         # Global styles

public/              # Static assets
worker/              # Worker entry (serves dist)
```

## Can I connect a custom domain?

Yes. Configure routes/domains in `wrangler.toml` and Cloudflare.

Example:

```toml
name = "hakuto-site-landing"

[assets]
directory = "./dist"

[[routes]]
pattern = "example.com"
custom_domain = true
```

