# DietPet

A mobile-first pet nutrition tracker — manage feeding schedules, monitor weight, and keep a medical card for each of your pets.

## Stack

| | |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 7 |
| **Styling** | Tailwind CSS v3 |
| **Routing** | React Router v7 |
| **State** | Custom hook + `localStorage` (no external state lib) |
| **Icons** | Lucide React |
| **PWA** | vite-plugin-pwa |
| **i18n** | Built-in RU / EN with auto-detect |
| **Font** | Nunito |

## What's in the app right now

**Pets**
- Add, edit, delete pets — name, breed, age, weight, photo
- Soft delete with 30-day recovery window
- Duplicate a pet profile

**Diet schedule**
- Multi-week feeding plan per pet
- Each week has daily items: dry food, wet food, natural, medication, other
- Progress tracker — shows current day and week since diet start date
- "Today's feeding" card on the pet page

**Weight tracking**
- Log weight entries with dates
- Chart with weight history

**Medical card**
- Add diagnoses
- Medication courses — name, dose, unit, frequency, duration

**Notes**
- Free-text notes per pet

**App-level**
- Dark / light theme
- Russian and English interface (auto-detected from browser language)
- PWA — installable on mobile
- Splash screen animation
- Responsive layout: full-width on mobile, centered on tablet and desktop

## Run locally

```bash
npm install
npm run dev
```
