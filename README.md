# ☕ Brew POS

A summer glassmorphism Coffee Shop Point of Sale built with **React + Vite + Tailwind CSS**.  
All data is stored in **localStorage** — no backend required.

---

## ✨ Features

| Section | What it does |
|---------|-------------|
| **POS** | Browse menu, pick size variants (S/M/L), add toppings/add-ons, add to cart |
| **Cart Drawer** | Live order summary, promo voucher picker, built-in calculator with change-due |
| **Orders** | Browse every past order with full item breakdown |
| **Log** | Timeline of all transactions grouped by date with revenue summary |
| **Analytics** | Best sellers, category revenue, size split, add-on popularity, hourly chart |
| **Admin → Products** | Add/edit/delete menu items with dynamic categories & per-size pricing |
| **Admin → Add-ons** | Manage toppings, shots, milk options, syrups |
| **Admin → Vouchers** | Create % or fixed promo codes with usage limits & minimum order rules |
| **Settings** | Rename the POS, set staff/terminal name, toggle dark mode |

---

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
# → http://localhost:3000

# 3. Production build
npm run build

# 4. Preview build locally
npm run preview
```

---

## 📁 Folder structure

```
brew-pos/
├── public/
│   └── favicon.svg
├── src/
│   ├── CoffeePOS.jsx   ← THE living document — edit this in Claude
│   ├── App.jsx         ← thin re-export (never needs changing)
│   ├── main.jsx        ← React DOM mount
│   └── index.css       ← Tailwind directives + keyframe animations
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json         ← SPA routing for Vercel
├── .gitignore
└── package.json
```

### ✏️ How to update with a new version from Claude

1. Get the updated `CoffeePOS.jsx` from Claude
2. Replace `src/CoffeePOS.jsx` with the new file
3. Done — `App.jsx` and `main.jsx` never change

---

## 📲 PWA — Install on any device

Brew POS is a full **Progressive Web App**. After deploying to Vercel:

| Platform | How to install |
|----------|---------------|
| **Android (Chrome)** | Tap the banner or ⋮ menu → "Add to Home Screen" |
| **iPhone / iPad (Safari)** | Tap Share → "Add to Home Screen" |
| **Desktop Chrome / Edge** | Click the install icon (⊕) in the address bar |

Once installed it:
- Opens in **standalone landscape window** (no browser chrome)
- Works **fully offline** — all assets and Google Fonts are cached
- **Auto-updates** silently when you deploy a new version to Vercel

### Custom icons

The project ships with generated orange icons. To use your own logo:
1. Go to **[realfavicongenerator.net](https://realfavicongenerator.net)**
2. Upload your logo image
3. Download and replace `public/icons/icon-192.png` and `public/icons/icon-512.png`

---



### Option A — Vercel CLI

```bash
npm i -g vercel
vercel          # follow the prompts (Framework: Vite)
```

### Option B — GitHub import (recommended)

1. Push this folder to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo
4. Framework preset: **Vite**  
5. Build command: `npm run build`  
6. Output directory: `dist`
7. Click **Deploy** ✅

The `vercel.json` file already handles SPA routing so page refreshes work.

---

## 🛠 Tech stack

| Tool | Version |
|------|---------|
| React | 18 |
| Vite | 5 |
| Tailwind CSS | 3 |
| Storage | localStorage (no backend) |
| Fonts | Google Fonts — Nunito + Pacifico |

---

## 📄 License

MIT — free to use and modify.
