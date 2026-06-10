import { TextInput } from '../../../components/forms/TextInput';
import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

export const CategoryMetaForms = () => {
  const { category, meta, updateMeta } = useCreateTaskStore();

  if (category === 'KURS_ISHI' || category === 'REFERAT' || category === 'MUSTAQIL_ISH') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="Sahifa soni"
          type="number"
          placeholder="Masalan: 15"
          value={meta.pageCount || ''}
          onValueChange={(val) => updateMeta('pageCount', val)}
        />
        <TextInput
          label="Antiplagiatura (%)"
          type="number"
          placeholder="Masalan: 70"
          value={meta.plagiarismPercent || ''}
          onValueChange={(val) => updateMeta('plagiarismPercent', val)}
        />
      </div>
    );
  }

  if (category === 'TARJIMA') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-edu-text">Qaysi tildan</label>
            <LanguageSelect 
              value={meta.sourceLang} 
              onChange={(val) => updateMeta('sourceLang', val)} 
              placeholder="Tilni tanlang" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-edu-text">Qaysi tilga</label>
            <LanguageSelect 
              value={meta.targetLang} 
              onChange={(val) => updateMeta('targetLang', val)} 
              placeholder="Tilni tanlang" 
            />
          </div>
        </div>
        <TextInput
          label="So'zlar soni"
          type="number"
          placeholder="Kalkulyatsiya uchun kerak"
          value={meta.wordCount || ''}
          onValueChange={(val) => updateMeta('wordCount', val)}
        />
      </div>
    );
  }

  if (category === 'DASTURLASH' || category === 'LABORATORIYA') {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-edu-text">Dasturlash tili</label>
        <ProgrammingLangSelect 
          value={meta.programmingLang} 
          onChange={(val) => updateMeta('programmingLang', val)} 
        />
      </div>
    );
  }

  return null;
};

// Reusable Select Components using Radix UI
const LANGUAGES = ['O\'zbek (Lotin)', 'O\'zbek (Kirill)', 'Rus', 'Ingliz', 'Nemis', 'Fransuz'];
const PROG_LANGS = ['Python', 'JavaScript / TypeScript', 'Java', 'C++', 'C#', 'PHP', 'Boshqa'];

const CustomSelect = ({ value, onChange, options, placeholder }) => (
  <Select.Root value={value || ''} onValueChange={onChange}>
    <Select.Trigger className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-black/20 border border-edu-border hover:border-edu-primary/50 focus:border-edu-primary focus:ring-2 focus:ring-edu-primary/20 rounded-xl outline-none transition-all text-sm font-medium text-edu-text">
      <Select.Value placeholder={<span className="text-edu-muted">{placeholder}</span>} />
      <Select.Icon>
        <ChevronDown size={18} className="text-edu-muted" />
      </Select.Icon>
    </Select.Trigger>
    
    <Select.Portal>
      <Select.Content className="z-[100] overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-edu-border">
        <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-edu-text cursor-default">
          <ChevronDown size={14} className="rotate-180" />
        </Select.ScrollUpButton>
        <Select.Viewport className="p-1">
          {options.map((opt) => (
            <Select.Item 
              key={opt} 
              value={opt}
              className="relative flex items-center px-8 py-2.5 text-sm font-medium text-edu-text rounded-lg select-none outline-none data-[highlighted]:bg-edu-primary/10 data-[highlighted]:text-edu-primary cursor-pointer transition-colors"
            >
              <Select.ItemText>{opt}</Select.ItemText>
              <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                <Check size={16} className="text-edu-primary" />
              </Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Viewport>
        <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-edu-text cursor-default">
          <ChevronDown size={14} />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

const LanguageSelect = ({ value, onChange, placeholder }) => (
  <CustomSelect value={value} onChange={onChange} options={LANGUAGES} placeholder={placeholder} />
);

const ProgrammingLangSelect = ({ value, onChange }) => (
  <CustomSelect value={value} onChange={onChange} options={PROG_LANGS} placeholder="Tilni tanlang" />
);
