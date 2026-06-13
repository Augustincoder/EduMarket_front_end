import { useEffect } from 'react';
import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { TextInput } from '../../../components/forms/TextInput';
import { TextArea } from '../../../components/forms/TextArea';
import { NLPWarning, useNLPCheck } from '../../../components/forms/NLPWarning';
import { useCategoryStore } from '../../../store/categoryStore';
import { CategoryMetaForms } from './CategoryMetaForms';

export function Step1Details() {
  const { category, title, description, errors, updateField, setNlpSeverity } = useCreateTaskStore();
  const nlpSeverity = useNLPCheck(title + ' ' + description);
  const categoryStore = useCategoryStore(s => s.categories) || [];

  // Sync NLP severity into the store so later steps (review/submit) can use it.
  useEffect(() => {
    setNlpSeverity?.(nlpSeverity);
  }, [nlpSeverity, setNlpSeverity]);

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
      
      <div className="bg-edu-primary/5 rounded-xl p-4 border border-edu-primary/20 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-edu-primary/10 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none" />
        <p className="text-sm text-edu-primary font-bold mb-2 flex items-center gap-2 relative">
          <span className="text-lg">💡</span> 
          Yaxshi tavsif qanday bo'ladi?
        </p>
        <ul className="text-[13px] text-edu-text/80 space-y-1.5 font-medium ml-7 list-[circle] marker:text-edu-primary/50 relative">
          <li>Fan nomi va asosiy mavzusi</li>
          <li>Kutilayotgan hajm (sahifa yoki so'z)</li>
          <li>Format va standartlar (masalan: GOST, APA)</li>
          <li>Antiplagiat talabi (agar zarur bo'lsa)</li>
        </ul>
      </div>
    </div>
  );
}
