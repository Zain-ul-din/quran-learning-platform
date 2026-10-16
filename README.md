<div align="center">

## 📖 Quran Learning Platform

</div>

```diff
- Disclaimer: This project is under active development. Features and documentation may change; contributions to improve the docs are welcome.
```

The Quran Learning Platform is a assistant for anyone learning to recite the Quran. Browse through the chapters, read the verses in Arabic with an English translation alongside, then record yourself reciting a verse — the app transcribes your recitation and uses AI to give you feedback on how you did, like a gentle teacher pointing out what went well and what to work on next.

# Table of Content

- [How It Works](#how-it-works)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [About](#about-us)

## How It Works

1. **Content fetch** — chapters and verses are fetched from the [Quran Foundation API](https://quran.foundation/) with translations included.
2. **Recording** — the app captures your recitation from the microphone.
3. **Transcription** — the audio is sent to `/api/process-audio` and transcribed by OpenAI.
4. **Evaluation** — the transcript is checked word by word against the verse.
5. **Feedback** — a structured, per-word result is streamed back to the UI.

## Technologies

| Tech                                                               | Role                                                |
| ------------------------------------------------------------------ | --------------------------------------------------- |
| [Next.js 16](https://nextjs.org/)                                  | App framework (App Router, React Server Components) |
| [React 19](https://react.dev/)                                     | UI library                                          |
| [TypeScript](https://www.typescriptlang.org/)                      | Type safety                                         |
| [Tailwind CSS 4](https://tailwindcss.com/)                         | Styling                                             |
| [shadcn/ui](https://ui.shadcn.com/)                                | UI components                                       |
| [Base UI](https://base-ui.com/)                                    | Component primitives                                |
| [Motion](https://motion.dev/)                                      | Animations                                          |
| [Zustand](https://zustand.docs.pmnd.rs/)                           | Client state management                             |
| [Quran Foundation API](https://quran.foundation/) (`@quranjs/api`) | Chapters, verses & translations                     |
| [OpenAI](https://openai.com/) (Vercel AI SDK)                      | Transcription & recitation feedback                 |
| [voice-glow](https://www.npmjs.com/package/voice-glow)             | Mic recording & audio visualizer                    |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Zain-ul-din/quran-learning-platform.git
cd quran-learning-platform
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your keys (see [Environment Variables](#environment-variables)).

### 4. Run it

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start learning. ☕

## Environment Variables

| Variable           | Where to get it                                               |
| ------------------ | ------------------------------------------------------------- |
| `QF_CLIENT_ID`     | [Quran Foundation](https://quran.foundation/) API credentials |
| `QF_CLIENT_SECRET` | [Quran Foundation](https://quran.foundation/) API credentials |
| `OPENAI_API_KEY`   | [OpenAI](https://platform.openai.com/api-keys)                |

## About Us

<div align="center">
<h4 font-weight="bold">This repository is maintained by <a href="https://github.com/Zain-ul-din">Zain-Ul-Din</a></h4>
<p> Show some ❤️ by starring this awesome repository! </p>
</div>
