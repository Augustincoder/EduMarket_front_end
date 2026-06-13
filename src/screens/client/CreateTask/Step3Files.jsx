import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { FileUpload } from '../../../components/forms/FileUpload';

export function Step3Files() {
  const { files, updateField } = useCreateTaskStore();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-xl font-bold text-edu-text">Qo'shimcha materiallar</h2>
        <p className="text-sm text-edu-muted">Vazifa uchun kerakli namunalar yoki materiallarni yuklang</p>
      </div>

      <div className="bg-edu-primary/5 p-4 rounded-2xl border border-edu-primary/10">
        <p className="text-[13px] text-edu-primary font-medium flex items-start gap-2">
          <span>💡</span> 
          <span>Statistikaga ko'ra, fayl va namuna biriktirilgan vazifalar 3 marta ko'proq taklif oladi.</span>
        </p>
      </div>

      <FileUpload
        maxFiles={5}
        maxSizeMB={50}
        value={files}
        onChange={(newFiles) => updateField('files', newFiles)}
      />
    </div>
  );
}
