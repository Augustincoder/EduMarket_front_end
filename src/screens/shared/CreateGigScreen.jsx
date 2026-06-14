import { ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';

import { useCreateGigForm } from './CreateGig/hooks/useCreateGigForm';
import { AccessDeniedView } from './CreateGig/components/AccessDeniedView';
import { GigStepperHeader } from './CreateGig/components/GigStepperHeader';
import { GigStep1Details } from './CreateGig/components/GigStep1Details';
import { GigStep2Pricing } from './CreateGig/components/GigStep2Pricing';

export default function CreateGigScreen() {
  const {
    navigate,
    step,
    setStep,
    isVip,
    completedTasks,
    hasAccess,
    form: { register, handleSubmit, formState: { errors } },
    titleVal,
    descVal,
    priceVal,
    handleNextStep,
    onSubmit,
    isPending,
  } = useCreateGigForm();

  return (
    <PageLayout
      header={
        <Header
          title={hasAccess ? `Xizmat yaratish — ${step}-bosqich` : "Kirish taqiqlangan"}
          leftAction={
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => {
                if (hasAccess && step === 2) {
                  setStep(1);
                } else {
                  navigate('/gigs');
                }
              }}
              className="rounded-xl hover:bg-edu-border/40 text-edu-text"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          }
        />
      }
    >
      <div className="flex flex-col gap-6 p-4 pb-nav animate-fade-in">
        
        {!hasAccess ? (
          <AccessDeniedView 
            isVip={isVip} 
            completedTasks={completedTasks} 
            navigate={navigate} 
          />
        ) : (
          <div className="flex flex-col gap-5 animate-fade-up">
            <GigStepperHeader step={step} />

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {step === 1 && (
                <GigStep1Details
                  register={register}
                  errors={errors}
                  titleVal={titleVal}
                  descVal={descVal}
                  handleNextStep={handleNextStep}
                />
              )}

              {step === 2 && (
                <GigStep2Pricing
                  register={register}
                  errors={errors}
                  priceVal={priceVal}
                  setStep={setStep}
                  isPending={isPending}
                />
              )}
            </form>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
