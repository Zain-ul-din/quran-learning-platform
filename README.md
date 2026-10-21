<div align="center">
<h1> 📖 Quran Learning Platform</h1>
</div>

A Quran recitation assistant — pick a chapter, read verses in Arabic with translation, then record yourself and get AI feedback on your recitation.

**Development Status:**

<table>
  
<tr>
  <td>
    <img width="120" height="120" alt="mech-working" src="https://github.com/user-attachments/assets/125e5e83-7736-4237-b5a6-fb4dc70ad494" />
  </td>
  <td>
  <i>Evaluating...</i>
    <br />  <br />
    For the current multi-layer system, it is supposed to run evals against an audio and text classification model. Evaluation data includes audio from different dialects and transcribed text from the QF API.
  </td>
</tr>
</table>

## Screenshots

<table>
  <tr>
    <td>
      <img width="673" height="960" alt="image" src="https://github.com/user-attachments/assets/d97a13e3-6798-486a-a417-06c1e1551ba9" />
    </td>
    <td>
      <img width="673" height="960" alt="image" src="https://github.com/user-attachments/assets/d28f06f2-d26c-47d8-bbab-49f5c264fbf8" />
    </td>
  </tr>
</table>



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
| [Motion](https://motion.dev/)                                      | Animations                                          |
| [XState](https://stately.ai/docs/xstate)                           | Client state management (state machines)            |
| [Quran Foundation API](https://quran.foundation/) (`@quranjs/api`) | Chapters, verses & translations                     |
| [OpenAI](https://openai.com/) (Vercel AI SDK)                      | Transcription & recitation feedback                 |

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
