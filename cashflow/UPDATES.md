# 🎉 Шинэчлэлтүүд / Updates

## ✅ Шинэ features

### 1. 🌍 Хэл солих (MN/EN)
- Header дээр MN/EN хэл сонгох товч нэмэгдлээ
- Бүх текст автоматаар орчуулагдана
- Default: Монгол хэл (MN)

### 2. 💰 Wallet валют - MNT
- Нийт баялаг үргэлж **MNT** (Монгол төгрөг) дээр харагдана
- Header дээр USD, EUR сонгох боломжтой (харьцуулах зориулалттай)
- MNT формат: ₮1,234,567 (таслалгүй)

### 3. 📱 Sidebar хаадаг болсон
- Mobile дээр sidebar автоматаар нуугдана
- Hamburger menu товч header дээр гарна
- Sidebar нээх/хаах анимаци нэмэгдлээ
- Overlay background - хаахад дарж болно

## 🔧 Техникийн өөрчлөлтүүд

### Шинэ файлууд:
- `lib/translations.ts` - MN/EN орчуулга
- Updated `lib/types.ts` - Language, MNT currency
- Updated components - translation support

### Context шинэчлэлт:
```typescript
// DashboardProvider-д нэмэгдсэн:
- language: Language
- setLanguage: (language: Language) => void
- sidebarOpen: boolean
- setSidebarOpen: (open: boolean) => void
```

### Хэрхэн ашиглах:

```typescript
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';

function MyComponent() {
  const { language, setLanguage } = useDashboard();
  const t = useTranslation(language);
  
  return <h1>{t('dashboard')}</h1>;
}
```

## 📝 Орчуулга нэмэх

`lib/translations.ts` файлд шинэ түлхүүр нэмнэ:

```typescript
export const translations = {
  MN: {
    myNewKey: 'Монгол орчуулга',
  },
  EN: {
    myNewKey: 'English translation',
  },
};
```

## 🎨 Mobile Responsive

### Breakpoints:
- **Mobile** (< 640px): Sidebar нуугдана, compact header
- **Tablet** (640px - 1024px): Medium spacing
- **Desktop** (> 1024px): Full sidebar, spacious layout

### Header changes:
- Mobile: Hamburger menu, compact buttons
- Desktop: Full navigation, all buttons visible

## 🚀 Ирээдүйн сайжруулалтууд

Дараах зүйлсийг нэмж болно:
- [ ] Бүх компонентод translation нэмэх (transactions, budgets, гэх мэт)
- [ ] Theme switcher (dark/light mode)
- [ ] Currency converter API холбох
- [ ] Real-time MNT exchange rates
- [ ] Notification system
- [ ] Settings page

## 🐛 Known Issues

- Одоогоор зарим компонентууд англиар байна (translation дуусаагүй)
- Chart labels-ууд translation-гүй
- Mobile дээр зарим animation удаашралтай

## 💡 Tips

1. **Хэл солих**: Header дээр MN/EN дарж солино
2. **Sidebar хаах**: Mobile дээр overlay эсвэл X товч дарна
3. **Currency**: MNT нь wallet-ын default валют
4. **Search**: Монгол үгээр хайх боломжтой

Амжилт хүсье! 🎊
