# 🚀 CashFlow Dashboard - Installation Guide

## 📋 Системийн шаардлага

- **Node.js**: 18.0 эсвэл түүнээс дээш хувилбар
- **npm** эсвэл **yarn** package manager
- **Git** (хэрэв repository clone хийх бол)

## 🛠️ Суулгах алхамууд

### 1. Төслийн хавтас руу орох
```bash
cd cashflow-dashboard
```

### 2. Dependencies суулгах
```bash
npm install
# эсвэл
yarn install
```

### 3. Development сервер ажиллуулах
```bash
npm run dev
# эсвэл
yarn dev
```

Хөтөч дээрээ [http://localhost:3000](http://localhost:3000) руу орж үзнэ үү.

### 4. Production build хийх
```bash
npm run build
npm start
# эсвэл
yarn build
yarn start
```

## 📁 Төслийн бүтэц

```
cashflow-dashboard/
├── app/                          # Next.js 14 App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Main dashboard page
│
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── avatar.tsx
│   │   ├── progress.tsx
│   │   └── badge.tsx
│   │
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   ├── header.tsx           # Top header with search & actions
│   │   ├── net-worth-card.tsx   # Net worth display with chart
│   │   ├── stats-cards.tsx      # Income/Expense/Savings cards
│   │   ├── transactions-table.tsx # Transaction history table
│   │   ├── budget-cards.tsx     # Budget progress cards
│   │   ├── spending-chart.tsx   # Donut chart for spending
│   │   ├── smart-insight.tsx    # AI insight card
│   │   └── trend-chart.tsx      # 6-month trend bar chart
│   │
│   └── providers/
│       └── dashboard-provider.tsx # Context API for state management
│
├── lib/
│   ├── types.ts                 # TypeScript interfaces & types
│   ├── utils.ts                 # Utility functions (cn, formatters)
│   └── mock-data.ts             # Mock data for dashboard
│
├── public/                       # Static assets
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── components.json              # shadcn/ui configuration
```

## 🎨 Компонентуудын тайлбар

### Layout Components

#### `Sidebar` (`components/dashboard/sidebar.tsx`)
- Зүүн талын навигаци
- Logo, navigation items, user profile
- Responsive: mobile дээр автоматаар нуугдана

#### `Header` (`components/dashboard/header.tsx`)
- Дээд хэсгийн header
- Search bar, currency selector, month picker, add transaction button
- Sticky positioning

### Data Display Components

#### `NetWorthCard` (`components/dashboard/net-worth-card.tsx`)
- Нийт хөрөнгийн дүн харуулах
- Line chart with SVG
- Өмнөх сартай харьцуулсан өөрчлөлт

#### `StatsCards` (`components/dashboard/stats-cards.tsx`)
- 3 card: Monthly Income, Expenses, Savings Rate
- Өнгөт badge, icon, өөрчлөлтийн хувь

#### `TransactionsTable` (`components/dashboard/transactions-table.tsx`)
- Гүйлгээний түүх харуулах
- Filter: All, Income, Expenses
- Hover эффект, responsive table

#### `BudgetCards` (`components/dashboard/budget-cards.tsx`)
- Budget progress cards
- Progress bar with percentage
- Spent/Limit мэдээлэл

#### `SpendingChart` (`components/dashboard/spending-chart.tsx`)
- Donut chart (SVG)
- Spending категориудаар хуваасан
- Legend with percentages

#### `SmartInsight` (`components/dashboard/smart-insight.tsx`)
- AI-powered санал
- Хэмнэлтийн зөвлөмж

#### `TrendChart` (`components/dashboard/trend-chart.tsx`)
- 6 сарын трэнд bar chart
- Hover эффект

## 🔧 State Management

### DashboardProvider (`components/providers/dashboard-provider.tsx`)
React Context API ашиглан дараах state удирдана:
- `data`: Dashboard датаа
- `user`: Хэрэглэгчийн мэдээлэл
- `currency`: USD/EUR сонголт
- `transactionFilter`: Гүйлгээний filter
- `selectedMonth`: Сонгосон сар

### Hook ашиглах:
```typescript
import { useDashboard } from '@/components/providers/dashboard-provider';

function MyComponent() {
  const { data, currency, setCurrency } = useDashboard();
  // ...
}
```

## 🎯 TypeScript Types

Бүх types `lib/types.ts` файлд тодорхойлогдсон:
- `Transaction`: Гүйлгээний мэдээлэл
- `Budget`: Budget мэдээлэл
- `StatCard`: Статистик card
- `SpendingCategory`: Зардлын категори
- `TrendData`: Трэндийн дата
- `DashboardData`: Dashboard-ийн бүх дата
- `User`: Хэрэглэгчийн мэдээлэл

## 🎨 Styling

### Tailwind CSS
- Custom colors (`brand-bg`, `brand-primary`, гэх мэт)
- Dark mode optimized
- Responsive utilities

### Custom Classes
- `.purple-gradient`: Gradient background
- `.card-shadow`: Custom shadow
- `.custom-scrollbar`: Custom scrollbar style

## 📱 Responsive Design

- **Mobile** (< 768px): Single column layout, sidebar нуугдана
- **Tablet** (768px - 1024px): 2 column grid
- **Desktop** (> 1024px): 3 column grid, sidebar тогтмол харагдана

## 🔄 Real API integration хийх

`lib/mock-data.ts` файлыг өөрийн API-тай солих:

```typescript
// lib/api.ts үүсгэх
export async function fetchDashboardData() {
  const response = await fetch('/api/dashboard');
  return response.json();
}

// DashboardProvider-д ашиглах
const [data, setData] = useState<DashboardData | null>(null);

useEffect(() => {
  fetchDashboardData().then(setData);
}, []);
```

## 🚀 Нэмэлт features нэмэх

### 1. Шинэ компонент нэмэх:
```bash
# components/dashboard/ хавтаст шинэ файл үүсгэх
touch components/dashboard/my-new-component.tsx
```

### 2. shadcn/ui компонент нэмэх:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
```

### 3. Шинэ хуудас нэмэх:
```bash
# app/ хавтаст шинэ хавтас үүсгэх
mkdir app/accounts
touch app/accounts/page.tsx
```

## 🐛 Troubleshooting

### Dependencies суугаагүй бол:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port-д асуудал гарвал:
```bash
# Өөр port дээр ажиллуулах
PORT=3001 npm run dev
```

### Build алдаа гарвал:
```bash
npm run lint
npm run build
```

## 📚 Санамж

- shadcn/ui компонентууд `components/ui/` хавтаст байна
- Бүх датаа `lib/mock-data.ts`-с ирж байгаа
- State management нь Context API ашиглаж байгаа
- TypeScript strict mode идэвхтэй

## 🎉 Амжилт хүсье!

Асуулт гарвал эсвэл тусламж хэрэгтэй бол надад хандана уу!
