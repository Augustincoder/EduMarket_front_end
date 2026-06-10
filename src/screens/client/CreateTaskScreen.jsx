import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

import { PageLayout } from '../../components/layout/PageLayout';
import { Header } from '../../components/layout/Header';
import { ProgressStepper } from '../../components/ui/ProgressStepper';
import { SectionErrorBoundary } from '../../components/ui/SectionErrorBoundary';

import { useCreateTaskStore } from '../../store/useCreateTaskStore';
import { useCreateTask } from '../../hooks/useTasks';
import { useMainButton } from '../../hooks/useMainButton';
import { hapticSuccess, hapticLight, hapticError } from '../../lib/telegram';
import { trackEvent } from '../../lib/observability';

import { Step0Category } from './CreateTask/Step0Category';
import { Step1Details } from './CreateTask/Step1Details';
import { Step2Budget } from './CreateTask/Step2Budget';
import { Step3Files } from './CreateTask/Step3Files';
import { Step4Targeting } from './CreateTask/Step4Targeting';
import { Step5Review } from './CreateTask/Step5Review';

const STEPS = ['Tur', 'Tafsilot', 'Narx', 'Fayllar', 'Kimga', 'Tasdiq'];

const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function CreateTaskScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const createTask = useCreateTask();
  
  const { 
    step, nextStep, prevStep, resetStore,
    category, title, description, priceMin, priceMax, deadline, 
    files, targeting, isUrgent, nlpSeverity, setErrors, updateField, meta 
  } = useCreateTaskStore();

  const targetFreelancerId = new URLSearchParams(location.search).get('freelancerId');

  useEffect(() => {
    resetStore();
    if (location.state?.category) updateField('category', location.state.category);
    if (targetFreelancerId) updateField('targetFreelancerId', targetFreelancerId);
  }, [location, resetStore, updateField, targetFreelancerId]);

  const validateStep = () => {
    let errs = {};
    if (step === 1) {
      if (!title || title.trim().length < 10) errs.title = ['Kamida 10 ta belgi shart'];
      if (!description || description.trim().length < 20) errs.description = ['Kamida 20 ta belgi shart'];
      if (nlpSeverity === 'block') {
        hapticError();
        return false;
      }
    }
    if (step === 2) {
      if (!priceMin) errs.priceMin = ['Majburiy'];
      if (!priceMax) errs.priceMax = ['Majburiy'];
      if (!deadline) errs.deadline = ['Muddat tanlang'];
      if (Number(priceMin) >= Number(priceMax) && priceMin && priceMax) errs.priceMin = ["Max dan kichik bo'lishi shart"];
    }
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      hapticError();
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      hapticLight();
      nextStep();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    const payload = {
      category,
      title,
      description,
      priceMin: Math.floor(Number(priceMin)),
      priceMax: Math.floor(Number(priceMax)),
      isUrgent,
      deadline: new Date(deadline).toISOString(),
      attachmentFileIds: files.map((f) => f.fileId || f.id),
      targetType: targeting,
      targetFreelancerId,
      metadata: meta,
    };

    try {
      const res = await createTask.mutateAsync(payload);
      hapticSuccess();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success("Vazifangiz muvaffaqiyatli e'lon qilindi!");
      
      trackEvent('Task Created', { category, isUrgent, priceMin, target: targeting });
      
      if (targetFreelancerId) {
        navigator.clipboard.writeText(`${window.location.origin}/tasks/${res.data?.data?.id || ''}`);
        toast.success("Vazifa havolasi nusxalandi!");
      }
      navigate('/tasks', { replace: true });
    } catch (error) {
      hapticError();
      if (error.serverErrors) {
        setErrors(error.serverErrors);
        toast.error("Ma'lumotlarda xatolik bor");
      } else {
        toast.error("Tizimda xatolik yuz berdi");
      }
    }
  };

  // Setup Telegram Main Button
  let mainBtnText = '';
  let mainBtnClick = handleNext;
  let isVisible = true;

  if (step === 0) {
    isVisible = false; // user clicks on category card to advance
  } else if (step === 5) {
    mainBtnText = "🚀 E'LON QILISH";
    mainBtnClick = handleSubmit;
  } else {
    mainBtnText = "DAVOM ETISH →";
  }

  if (step === 1 && nlpSeverity === 'block') isVisible = false;

  useMainButton({
    text: mainBtnText,
    onClick: mainBtnClick,
    isVisible,
    isLoading: createTask.isPending,
  }, [step, nlpSeverity, createTask.isPending, handleNext, handleSubmit]);

  const handleBack = () => {
    if (step > 0) {
      hapticLight();
      prevStep();
    } else {
      navigate(-1);
    }
  };

  return (
    <PageLayout showNav={false} className="bg-edu-bg overflow-hidden">
      <Header 
        title={step === 0 ? "Yangi vazifa" : "Topshiriq yaratish"} 
        onBack={handleBack} 
        className="!border-none" 
      />

      <div className="px-6 pt-2 pb-24 h-full flex flex-col">
        {step > 0 && (
          <div className="mb-6">
            <ProgressStepper steps={STEPS} current={step} />
          </div>
        )}

        <div className="flex-1 relative">
          <SectionErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="absolute inset-0 overflow-y-auto pb-10"
              >
                {step === 0 && <Step0Category />}
                {step === 1 && <Step1Details />}
                {step === 2 && <Step2Budget />}
                {step === 3 && <Step3Files />}
                {step === 4 && <Step4Targeting />}
                {step === 5 && <Step5Review />}
              </motion.div>
            </AnimatePresence>
          </SectionErrorBoundary>
        </div>
      </div>
    </PageLayout>
  );
}
