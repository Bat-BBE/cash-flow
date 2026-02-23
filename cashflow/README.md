# CashFlow Dashboard - Next.js 14

Modern financial dashboard built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize shadcn/ui:
```bash
npx shadcn-ui@latest init
```

3. Add required shadcn components:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
```

4. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cashflow-dashboard/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Dashboard components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── net-worth-card.tsx
│   │   ├── stats-cards.tsx
│   │   ├── transactions-table.tsx
│   │   ├── budget-cards.tsx
│   │   ├── spending-chart.tsx
│   │   ├── smart-insight.tsx
│   │   └── trend-chart.tsx
│   └── providers/
│       └── dashboard-provider.tsx
├── lib/
│   ├── utils.ts            # Utility functions
│   └── types.ts            # TypeScript types
├── public/
└── package.json

```

## 🎨 Features

- ✅ Fully typed with TypeScript
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark mode optimized
- ✅ Component-based architecture
- ✅ State management with Context API
- ✅ shadcn/ui components
- ✅ Tailwind CSS styling

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Material Symbols
- **Fonts**: Inter

## 📝 License

MIT
