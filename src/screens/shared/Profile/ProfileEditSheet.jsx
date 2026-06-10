import { useState, useEffect } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { TextInput } from '../../../components/forms/TextInput';
import { TextArea } from '../../../components/forms/TextArea';
import { cn } from '../../../lib/utils';
import { hapticLight, hapticSuccess } from '../../../lib/telegram';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Dasturlash', 'Dizayn', 'Tarjima', 'SMM', 'Kopirayterlik',
  'Video montaj', 'Buxgalteriya', 'Huquqshunoslik', 'Repetitorlik'
];

export function ProfileEditSheet({ me, updateMe, isOpen, onClose }) {
  const [editTab, setEditTab] = useState('client');
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen && me) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditForm({
        fullname: me.fullname || '',
        bio: me.bio || '',
        skills: me.skills?.join(', ') || '',
        freelancerBio: me.freelancerBio || '',
        freelancerExperience: me.freelancerExperience !== null ? String(me.freelancerExperience) : '',
        freelancerCategories: me.freelancerCategories || [],
      });
      setErrors({});
      setEditTab('client');
    }
  }, [isOpen, me]);

  const toggleCategoryInEdit = (cat) => {
    hapticLight();
    const current = editForm.freelancerCategories || [];
    if (current.includes(cat)) {
      setEditForm({ ...editForm, freelancerCategories: current.filter(c => c !== cat) });
    } else {
      if (current.length >= 3) {
        toast.error("Maksimum 3 ta kategoriya tanlash mumkin");
        return;
      }
      setEditForm({ ...editForm, freelancerCategories: [...current, cat] });
    }
  };

  const handleEditSave = () => {
    setErrors({});
    const updateData = {
      fullname: editForm.fullname,
      bio: editForm.bio,
      skills: editForm.skills?.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (me?.isFreelancer) {
      updateData.freelancerBio = editForm.freelancerBio || null;
      updateData.freelancerExperience = editForm.freelancerExperience !== '' ? Number(editForm.freelancerExperience) : null;
      updateData.freelancerCategories = editForm.freelancerCategories || [];
    }

    updateMe.mutate(updateData, {
      onSuccess: () => {
        onClose();
        hapticSuccess();
      },
      onError: (e) => {
        if (e.serverErrors) {
          setErrors(e.serverErrors);
          toast.error('Iltimos, xatoliklarni to\'g\'irlang');
        }
      }
    });
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Profilni tahrirlash" fullHeight>
      <div className="space-y-4 py-2">
        {/* Tab Selection */}
        {me?.isFreelancer && (
          <div className="flex bg-edu-bg p-1 rounded-xl border border-edu-border/30 mb-2">
            <button
              type="button"
              onClick={() => { setEditTab('client'); }}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all press-scale",
                editTab === 'client' ? "bg-white text-edu-text shadow-sm" : "text-edu-muted"
              )}
            >
              Mijoz ma'lumotlari
            </button>
            <button
              type="button"
              onClick={() => { setEditTab('freelancer'); }}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all press-scale",
                editTab === 'freelancer' ? "bg-white text-edu-text shadow-sm" : "text-edu-muted"
              )}
            >
              Mutaxassis ma'lumotlari
            </button>
          </div>
        )}

        {/* Client Details fields */}
        {(editTab === 'client' || !me?.isFreelancer) && (
          <div className="space-y-4 animate-fade-in">
            <TextInput 
              label="Ismingiz" 
              value={editForm.fullname || ''} 
              onValueChange={(v) => { setEditForm(f => ({ ...f, fullname: v })); setErrors(e => ({ ...e, fullname: null })); }} 
              error={errors.fullname?.[0]} 
            />
            <TextArea 
              label="Bio" 
              value={editForm.bio || ''} 
              onValueChange={(v) => { setEditForm(f => ({ ...f, bio: v })); setErrors(e => ({ ...e, bio: null })); }} 
              maxLength={1000} 
              error={errors.bio?.[0]} 
            />
            <TextInput 
              label="Ko'nikmalar (vergul bilan)" 
              placeholder="Python, Node.js, Tarjima" 
              value={editForm.skills || ''} 
              onValueChange={(v) => { setEditForm(f => ({ ...f, skills: v })); setErrors(e => ({ ...e, skills: null })); }} 
              error={errors.skills?.[0]} 
            />
          </div>
        )}

        {/* Freelancer Details fields */}
        {editTab === 'freelancer' && me?.isFreelancer && (
          <div className="space-y-4 animate-fade-in">
            <TextArea 
              label="Mutaxassis tavsifi (Freelancer Bio)" 
              value={editForm.freelancerBio || ''} 
              onValueChange={(v) => { setEditForm(f => ({ ...f, freelancerBio: v })); setErrors(e => ({ ...e, freelancerBio: null })); }} 
              maxLength={1000} 
              error={errors.freelancerBio?.[0]} 
            />
            
            <TextInput 
              type="number"
              label="Tajribangiz (yil)" 
              value={editForm.freelancerExperience || ''} 
              onValueChange={(v) => { setEditForm(f => ({ ...f, freelancerExperience: v })); setErrors(e => ({ ...e, freelancerExperience: null })); }} 
              error={errors.freelancerExperience?.[0]} 
            />

            {/* Categories */}
            <div>
              <label className="block text-edu-muted text-sm font-medium mb-2">
                Mutaxassis yo'nalishlari (Maks 3 ta)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => {
                  const isSelected = editForm.freelancerCategories?.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleCategoryInEdit(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                          : 'bg-edu-surface text-edu-muted border-edu-border/30 hover:bg-edu-bg'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              {errors.freelancerCategories && (
                <span className="text-red-500 text-xs mt-1 block">
                  {errors.freelancerCategories?.[0]}
                </span>
              )}
            </div>
          </div>
        )}

        <Button fullWidth size="lg" variant="primary" isLoading={updateMe.isPending} onClick={handleEditSave} className="mt-2">
          Saqlash
        </Button>
      </div>
    </BottomSheet>
  );
}
