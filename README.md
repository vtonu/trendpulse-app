# trend pulse

Trend Pulse ranks type-beat markets with daily YouTube search data. It tracks demand, competition, momentum, opportunity, and short-term change for a focused artist list.

<img width="2443" height="1232" alt="Trend Pulse" src="https://github.com/user-attachments/assets/2928a03d-7ee5-40ee-a22e-bb24e81bcd03" />

## local setup

Install and start the app:

```sh
npm install
npm run dev
```

## refresh trend data

Create `.env.local` in the project root:

```env
YOUTUBE_API_KEY=your_key_here
```

Run a refresh:

```sh
npm run refresh-data
```

The script writes the latest results to `public/data/trends.json`. Keep `.env.local` private and never commit the API key.

## daily updates

The GitHub Actions workflow runs every day at 12:17 UTC. Add `YOUTUBE_API_KEY` as a GitHub Actions repository secret. The workflow refreshes the trend data, commits the new JSON file, and pushes it to the repository.

When the repository is linked to Vercel, each data commit starts a new deployment.

## checks

```sh
npm run build
npm run lint
```
