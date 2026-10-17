# GitHub Repository Manager

A React and TypeScript dashboard for viewing and managing repositories you own on GitHub.

## Features

- Connect using a GitHub personal access token.
- View public and private repositories accessible to your token.
- See repository counts and total stars.
- Search by name, description, or language.
- Select repositories individually or select all visible results.
- Delete selected repositories after confirmation, with progress and per-repository error reporting.
- Access delete controls while scrolling through the repository list.

## Run locally

Install a current Node.js LTS release and npm, then run from the frontend directory:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Run the commands above from the repository root.

## Connect to GitHub

Create a personal access token in GitHub Settings > Developer settings > Personal access tokens.

For a fine-grained token:

1. Choose your personal account as the resource owner.
2. Select all repositories, or explicitly select the repositories you want to manage.
3. Metadata read access supports listing repositories.
4. Enable Administration: Read and write only if you want to delete repositories.

For a classic token, private repository access requires `repo`, and deletion requires `delete_repo`.

Paste the token into the app's token field and select Connect. After changing token access, disconnect and reconnect. The app communicates directly with GitHub; tokens are stored in session storage for the current browser tab and cleared on disconnect. Never commit or share a token.

Counts cover repositories you own that the connected token can access. Shared and organization repositories are excluded.

## Deletion

Deletion affects the actual GitHub repository, including its history, and can affect your contribution graph. Archive projects through GitHub if you want to retain their history. Review the confirmation list before deleting. Some deleted repositories can be restored through GitHub within 90 days, subject to GitHub's restoration rules; do not rely on restoration as a backup.

Bulk deletion sends one request per repository. Successful deletions are removed from the list; failures remain selected with an error message. A progress indicator remains visible while requests and the final refresh run.

## Commands

```sh
npm run dev      # Local development
npm run build    # Type checking and production build
npm run lint     # ESLint checks
npm run preview  # Preview the production build
```

## Stack

React, TypeScript, Vite, Tailwind CSS, Lucide icons, and the GitHub REST API.

The dashboard communicates directly with GitHub and does not require a backend.
