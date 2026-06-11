import { useRef } from 'react';
import toast from 'react-hot-toast';
import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { TextInput } from '../../../components/forms/TextInput';
import { TextArea } from '../../../components/forms/TextArea';
import { NLPWarning, useNLPCheck } from '../../../components/forms/NLPWarning';
import { useCategoryStore } from '../../../store/categoryStore';
import { CategoryMetaForms } from './CategoryMetaForms';

export function Step1Details() {
  const { category, title, description, errors, updateField, setNlpSeverity } = useCreateTaskStore();
  const nlpSeverity = useNLPCheck(title + ' ' + description);
  const categoryStore = useCategoryStore(s => s.categories);

  const catInfo = categoryStore.find(c => c.value === category) || { label: 'Vazifa', emoji: '📌', formType: 'GENERAL' };
  const catLabel = catInfo.label;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-edu-text">{catLabel} tafsiloti</h2>
        <span className="text-2xl">{catInfo.emoji}</span>
      </div>

      <TextInput
        label="Sarlavha *"
        placeholder={`Masalan: Iqtisodiyot asoslaridan ${catLabel.toLowerCase()}...`}
        value={title}
        onValueChange={(val) => updateField('title', val)}
        maxLength={200}
        currentLength={title.length}
        error={errors.title?.[0]}
      />
      
      <TextArea
        label="Batafsil tavsif *"
        placeholder="Vazifa haqida barcha kerakli ma'lumotlarni yozing..."
        value={description}
        onValueChange={(val) => updateField('description', val)}
        maxLength={2000}
        minRows={6}
        error={errors.description?.[0]}
      />
      
      <CategoryMetaForms />

      <NLPWarning text={title + ' ' + description} />
      
      <div className="bg-edu-primary/5 rounded-2xl p-4 border border-edu-primary/10">
        <p className="text-sm text-edu-primary font-semibold mb-2">💡 Yaxshi tavsif nimalarni o'z ichiga oladi?</p>
        <ul className="text-xs text-edu-muted space-y-1 list-disc list-inside">
          <li>Fan nomi va mavzusi</li>
          <li>Hajmi (sahifa yoki so'z soni)</li>
          <li>Format talablari (GOST, APA, va hk)</li>
          <li>Antiplagiatura talabi (agar bo'lsa)</li>
        </ul>
      </div>
    </div>
  );
}
