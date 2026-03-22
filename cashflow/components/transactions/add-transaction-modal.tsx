// components/transactions/add-transaction-modal.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: unknown) => void;
  accounts: string[];
  categories: string[];
}

type EntryMode = 'manual' | 'file';

const DEFAULT_CATEGORIES = [
  { value: 'food', label: '🍔  Хоол, хүнс' },
  { value: 'transport', label: '🚗  Тээвэр' },
  { value: 'shopping', label: '🛍️  Дэлгүүр' },
  { value: 'health', label: '💊  Эрүүл мэнд' },
  { value: 'education', label: '📚  Боловсрол' },
  { value: 'utilities', label: '💡  Коммунал' },
  { value: 'salary', label: '💰  Цалин' },
  { value: 'freelance', label: '💻  Фриланс' },
  { value: 'investment', label: '📈  Хөрөнгө оруулалт' },
  { value: 'other', label: '📂  Бусад' },
];

const DEFAULT_ACCOUNTS = [
  { value: 'khaan', label: '🏦  Хаан банк — **** 4521' },
  { value: 'tdb', label: '🏦  ХХБанк — **** 8832' },
  { value: 'golomt', label: '🏦  Голомт банк — **** 1107' },
  { value: 'state', label: '🏦  Төрийн банк — **** 3349' },
  { value: 'cash', label: '💵  Бэлэн мөнгө' },
];

function ModeToggle({ mode, onChange }: { mode: EntryMode; onChange: (m: EntryMode) => void }) {
  return (
    <div className="relative flex rounded-xl border border-white/[0.1] bg-black/40 p-1">
      <div
        className={cn(
          'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white/[0.12] transition-all duration-300 ease-out',
          mode === 'manual' ? 'left-1' : 'left-[calc(50%+2px)]',
        )}
      />
      {(['manual', 'file'] as const).map(m => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={cn(
            'relative z-10 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-[13px] font-bold transition-colors',
            mode === m ? 'text-white' : 'text-white/45 hover:text-white/75',
          )}
        >
          <span className="material-symbols-outlined shrink-0 text-[18px]">
            {m === 'manual' ? 'edit_note' : 'upload_file'}
          </span>
          <span className="truncate">{m === 'manual' ? 'Гараар' : 'Файл'}</span>
        </button>
      ))}
    </div>
  );
}

function TypeToggle({ type, onChange }: { type: 'expense' | 'income'; onChange: (t: 'expense' | 'income') => void }) {
  return (
    <div className="relative flex rounded-xl border border-white/[0.1] bg-black/40 p-1">
      <div
        className={cn(
          'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out',
          type === 'expense'
            ? 'left-1 bg-rose-500/25 shadow-[inset_0_0_12px_rgba(244,63,94,0.12)]'
            : 'left-[calc(50%+2px)] bg-emerald-500/25 shadow-[inset_0_0_12px_rgba(52,211,153,0.12)]',
        )}
      />
      {(['expense', 'income'] as const).map(tKey => {
        const active = type === tKey;
        return (
          <button
            key={tKey}
            type="button"
            onClick={() => onChange(tKey)}
            className={cn(
              'relative z-10 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-[13px] font-bold transition-colors',
              tKey === 'expense'
                ? active
                  ? 'text-rose-200'
                  : 'text-white/45 hover:text-white/75'
                : active
                  ? 'text-emerald-200'
                  : 'text-white/45 hover:text-white/75',
            )}
          >
            <span className="material-symbols-outlined shrink-0 text-[18px]">
              {tKey === 'expense' ? 'trending_down' : 'trending_up'}
            </span>
            {tKey === 'expense' ? 'Зарлага' : 'Орлого'}
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/40">{children}</p>
  );
}

const triggerCls =
  'flex h-11 w-full items-center rounded-xl border border-white/[0.1] bg-black/35 pl-9 pr-3 text-left text-[13px] text-white outline-none transition-all data-[placeholder]:text-white/40 focus:border-amber-500/45 focus:ring-2 focus:ring-amber-500/15 hover:border-white/20 [&>span]:line-clamp-1';

const inputCls =
  'w-full rounded-xl border border-white/[0.1] bg-black/35 px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/35 outline-none transition-all focus:border-amber-500/45 focus:ring-2 focus:ring-amber-500/15 hover:border-white/20';

function FileDropZone({ file, onFile }: { file: File | null; onFile: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  const ext = file?.name.split('.').pop()?.toLowerCase() ?? '';
  const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
  const iconMap: Record<string, string> = {
    pdf: 'picture_as_pdf',
    csv: 'table_chart',
    xlsx: 'table_chart',
    xls: 'table_chart',
  };
  const fileIcon = isImage ? 'image' : iconMap[ext] ?? 'description';

  return (
    <div
      onDragOver={e => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'group relative flex min-h-[10rem] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200',
        dragging
          ? 'scale-[1.01] border-amber-400/55 bg-amber-500/10'
          : file
            ? 'border-emerald-500/45 bg-emerald-500/[0.06]'
            : 'border-white/[0.14] bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      {file ? (
        <div className="flex flex-col items-center gap-3 px-5 py-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/35 bg-emerald-500/15">
            <span className="material-symbols-outlined text-2xl text-emerald-400">{fileIcon}</span>
          </div>
          <div className="max-w-full">
            <p className="break-words text-[13px] font-bold text-white">{file.name}</p>
            <p className="mt-1 text-[12px] text-white/50">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onFile(null);
            }}
            className="text-[12px] font-bold text-amber-400/90 underline-offset-2 hover:text-amber-300 hover:underline"
          >
            Файл солих
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-5 py-7 text-center">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl border transition-all',
              dragging
                ? 'border-amber-400/50 bg-amber-500/15'
                : 'border-white/[0.12] bg-white/[0.05] group-hover:border-white/22',
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined text-2xl',
                dragging ? 'text-amber-400' : 'text-white/50 group-hover:text-white/65',
              )}
            >
              upload_file
            </span>
          </div>
          <p className="text-[13px] font-semibold text-white/80">
            {dragging ? 'Энд тавина уу' : 'Дарж сонгох эсвэл чирж оруулах'}
          </p>
          <p className="text-[12px] text-white/45">PDF · CSV · Excel · Зураг</p>
        </div>
      )}
    </div>
  );
}

const selectContentProps = {
  position: 'popper' as const,
  sideOffset: 6,
  collisionPadding: 12,
  className:
    'z-[200] max-h-[min(320px,70vh)] rounded-xl border border-white/[0.12] bg-[#12101c] p-0 text-white shadow-2xl shadow-black/50',
};

export function AddTransactionModal({
  isOpen,
  onClose,
  onAdd,
  accounts,
  categories,
}: AddTransactionModalProps) {
  const [mode, setMode] = useState<EntryMode>('manual');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [account, setAccount] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const reset = useCallback(() => {
    setMode('manual');
    setType('expense');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(undefined);
    setAccount(undefined);
    setDescription('');
    setFile(null);
  }, []);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const catList =
    categories?.length > 0 ? categories.map(c => ({ value: c, label: c })) : DEFAULT_CATEGORIES;

  const accList =
    accounts?.length > 0 ? accounts.map(a => ({ value: a, label: a })) : DEFAULT_ACCOUNTS;

  const canSubmit =
    mode === 'manual'
      ? !!amount?.trim() && !!category && !!account
      : !!file;

  const handleSubmit = () => {
    if (mode === 'manual') {
      onAdd({
        date,
        category,
        account,
        description,
        amount: parseFloat(amount),
        type,
        status: 'completed',
      });
    } else {
      onAdd({ file, type: 'file_import' });
    }
    reset();
    onClose();
  };

  const accentGlow = type === 'income' ? 'rgba(52,211,153,0.4)' : 'rgba(244,63,94,0.35)';

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) handleClose(); }}>
      <DialogContent
        onOpenAutoFocus={e => e.preventDefault()}
        className={cn(
          'flex max-h-[min(92dvh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh]',
          'w-[calc(100vw-1.25rem)] max-w-[440px] translate-x-[-50%] translate-y-[-50%]',
          'rounded-2xl border border-white/[0.1] bg-[#15131f]',
          'shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_64px_rgba(0,0,0,0.55)]',
          'max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:max-h-[88dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-3xl',
          'max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom',
        )}
      >
        <DialogTitle className="sr-only">Гүйлгээ нэмэх</DialogTitle>

        <div className="relative shrink-0 border-b border-white/[0.06] px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
          <div
            className="pointer-events-none absolute -top-12 left-1/2 h-28 w-56 -translate-x-1/2 rounded-full opacity-50 blur-3xl"
            style={{ background: `radial-gradient(circle, ${accentGlow}, transparent 72%)` }}
          />
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06]">
              <span className="material-symbols-outlined text-[20px] text-amber-400/90">add_card</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold tracking-tight text-white sm:text-[17px]">Гүйлгээ нэмэх</h2>
              <p className="mt-0.5 text-[12px] text-white/45">Данс, ангилал сонгоно уу</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] transition-colors hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-[18px] text-white/55">close</span>
            </button>
          </div>

          <div className="relative z-10 mt-4">
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}
        >
          {mode === 'manual' ? (
            <div className="space-y-4 pb-2">
              <TypeToggle type={type} onChange={setType} />

              <div>
                <FieldLabel>Дүн (₮)</FieldLabel>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl font-black text-white/30">
                    ₮
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    className={cn(
                      'w-full rounded-xl border bg-black/35 py-3 pl-9 pr-3 text-2xl font-black tabular-nums text-white outline-none placeholder:text-white/25 sm:text-3xl',
                      type === 'expense'
                        ? 'border-rose-500/30 focus:border-rose-500/55 focus:ring-2 focus:ring-rose-500/15'
                        : 'border-emerald-500/30 focus:border-emerald-500/55 focus:ring-2 focus:ring-emerald-500/15',
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>Огноо</FieldLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 material-symbols-outlined text-[18px] text-white/40">
                      calendar_today
                    </span>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className={cn(inputCls, 'h-11 pl-10')}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Ангилал</FieldLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-[11px] z-[1] material-symbols-outlined text-[18px] text-white/40">
                      label
                    </span>
                    <Select value={category} onValueChange={v => setCategory(v)}>
                      <SelectTrigger className={triggerCls} aria-label="Ангилал сонгох">
                        <SelectValue placeholder="Сонгох…" />
                      </SelectTrigger>
                      <SelectContent {...selectContentProps}>
                        {catList.map(cat => (
                          <SelectItem
                            key={cat.value}
                            value={cat.value}
                            className="cursor-pointer py-2.5 pl-8 pr-3 text-[13px] text-white/85 focus:bg-white/10 focus:text-white"
                          >
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel>Данс</FieldLabel>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-[11px] z-[1] material-symbols-outlined text-[18px] text-white/40">
                    account_balance_wallet
                  </span>
                  <Select value={account} onValueChange={v => setAccount(v)}>
                    <SelectTrigger className={triggerCls} aria-label="Данс сонгох">
                      <SelectValue placeholder="Данс сонгох…" />
                    </SelectTrigger>
                    <SelectContent {...selectContentProps}>
                      {accList.map(acc => (
                        <SelectItem
                          key={acc.value}
                          value={acc.value}
                          className="cursor-pointer py-2.5 pl-8 pr-3 text-[13px] text-white/85 focus:bg-white/10 focus:text-white"
                        >
                          {acc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <FieldLabel>
                  Тэмдэглэл <span className="font-medium normal-case tracking-normal text-white/30">(сонголттой)</span>
                </FieldLabel>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Нэмэлт мэдээлэл…"
                  rows={2}
                  className={cn(inputCls, 'min-h-[4.5rem] resize-none')}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              <FileDropZone file={file} onFile={setFile} />

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
                  Дэмжих формат
                </p>
                <ul className="mt-2 space-y-2 text-[12px] text-white/55">
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-[16px] text-white/40">picture_as_pdf</span>
                    <span><strong className="text-white/75">PDF</strong> — хуулга, баримт</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-[16px] text-white/40">table_chart</span>
                    <span><strong className="text-white/75">CSV / Excel</strong> — задаргаа</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-[16px] text-white/40">image</span>
                    <span><strong className="text-white/75">Зураг</strong> — чек</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/[0.06] bg-black/30 px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3.5 sm:px-5">
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="flex h-11 min-h-11 flex-1 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-[13px] font-bold text-white/60 transition-colors hover:border-white/18 hover:text-white/85"
            >
              Цуцлах
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'flex h-11 min-h-11 flex-[1.4] items-center justify-center gap-2 rounded-xl border text-[13px] font-bold transition-all',
                canSubmit
                  ? mode === 'file'
                    ? 'border-violet-500/40 bg-violet-500/20 text-violet-100 hover:bg-violet-500/28'
                    : type === 'income'
                      ? 'border-emerald-500/45 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/28'
                      : 'border-rose-500/45 bg-rose-500/20 text-rose-100 hover:bg-rose-500/28'
                  : 'cursor-not-allowed border-white/[0.06] bg-white/[0.03] text-white/30',
              )}
            >
              <span className="material-symbols-outlined text-[18px]">
                {mode === 'file' ? 'upload' : 'check'}
              </span>
              {mode === 'file' ? 'Илгээх' : 'Хадгалах'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
