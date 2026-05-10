# Genius Statistician Workflow App

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

A workflow management tool built for basketball statistics operators at Genius Sports Israel.

---

## Background

During my time working as a statistics operator with Genius Sports Israel, I identified a recurring problem: operators — especially new ones — would miss pre-game or post-game steps under time pressure, leading to errors that affected data quality and required manual corrections.

I built this app as a personal initiative to solve that problem. It guides operators through every required task before and after each game with a structured, step-by-step checklist interface — reducing human error and making the operator role more consistent and professional.

The interface is in Hebrew to match the working environment.

---

## Features

- **Pre-game checklist** — step-by-step task guidance before tip-off
- **Post-game checklist** — structured wrap-up flow after the final buzzer
- **Game setup page** — configure game details before starting
- **Game history log** — review past sessions with CSV export
- **Name parser tool** — splits official player names into structured components
- **Admin panel** — user management and access control
- **Login history** — audit trail of operator activity
- **Firebase authentication** — role-based access (operator / admin)
- **Google Sheets integration** — data sync via API

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend / Auth | Firebase Authentication, Firestore |
| Data | Google Sheets API |

---

## Run Locally

**Prerequisites:** Node.js, a Firebase project, a `.env` file with credentials

```bash
npm install
npm run dev
```

Configure your Firebase credentials in `.env` before running.
