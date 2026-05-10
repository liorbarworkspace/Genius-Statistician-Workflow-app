# Genius Statistician Workflow — Israel

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

> A workflow management tool built by a former Genius Sports Israel operator to professionalize and systematize the daily job of a basketball statistician.

---

## The story behind this

I worked as a **basketball statistics operator at Genius Sports Israel** — a company that provides live statistical data for Israeli basketball leagues using FIBA LiveStats software.

The job involves a precise sequence of tasks before, during, and after every game: setting up a station, entering referees and coaches, verifying rosters, broadcasting system-ready messages to WhatsApp groups, uploading final data, filing expense reports, and more. Missing a step has real consequences — from incorrect game data to payment issues.

There was no dedicated tool to guide operators through this workflow. Everything was done from memory or scattered notes. I built this app to change that.

**This is a personal initiative.** I am no longer employed at Genius, but the tool reflects the real operational procedures I followed on the job. The goal: reduce human error, save time, and make the operator role more professional.

---

## What it does

- **Pre-game checklist** — step-by-step task list before tip-off: station setup, officials entry, roster verification, system readiness, READY message broadcast.
- **Post-game checklist** — data upload verification, box-score report, expense logging, error-file review, next-game confirmation.
- **Name parser** — splits referee / coach full names into first/last with one-click copy, ready to paste directly into FIBA LiveStats.
- **Google Calendar reminder** — auto-generates a calendar event timed 30 minutes before tip-off as a reminder to send the READY screenshot.
- **Game history** — logs all games with task-completion status; supports inline editing and CSV export.
- **Admin panel** — manage authorized users in real time via Firestore; view full login history. No redeployment needed to add users.
- **Firebase Auth** — Google Sign-In with role-based access (user / admin).

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS (CDN) |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore |
| Hosting | Any static host (Vercel, Firebase Hosting, etc.) |

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/genius-statistician-workflow.git
cd genius-statistician-workflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

Open `.env` and set:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAIL=your_admin@gmail.com
```

> The `VITE_ADMIN_EMAIL` address is automatically granted admin role on first sign-in.

### 4. Configure internal links (optional)

Two links in `components/OperatorPostGamePage.tsx` are marked `#placeholder`. Replace them with your own:
- `#post-game-edits-link-here` → your post-game error-tracking sheet
- `#schedule-sheet-link-here` → your game schedule / assignment sheet

### 5. Set up Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication → Google** sign-in provider.
3. Enable **Firestore** in production mode.
4. Copy the Firestore security rules from the in-app setup page (shown automatically when Firebase is not yet configured).

### 6. Run locally

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Project structure

```
├── components/
│   ├── OperatorPreGamePage.tsx   # Pre-game checklist with name parser & calendar
│   ├── OperatorPostGamePage.tsx  # Post-game checklist
│   ├── GameHistoryPage.tsx       # Game log with CSV export
│   ├── AdminPage.tsx             # User management panel
│   └── ...
├── services/
│   ├── firebase.ts               # Firebase init
│   ├── authService.ts            # Google Sign-In helpers
│   └── firestoreService.ts       # Firestore CRUD
├── constants.ts                  # Checklist task definitions
├── types.ts                      # TypeScript interfaces
├── App.tsx                       # Routing & state
└── .env.example                  # Environment variable template
```

---

## Screenshots

> _Coming soon_

---

## Notes

- The UI is in **Hebrew** (RTL) — the app is built for Israeli basketball operators.
- The **Caller role** is a placeholder (Work In Progress).
- Internal company links (error sheet, schedule sheet) are replaced with placeholders in the public version — configure them for your own setup.

---

## License

MIT
