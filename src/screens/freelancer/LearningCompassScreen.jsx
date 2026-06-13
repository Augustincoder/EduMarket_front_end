import { Brain, Compass, TrendingUp, AlertTriangle, BookOpen, Star, ChevronRight, Activity } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { useLearningCompass } from '../../hooks/useLearningCompass';
import { Button } from '../../components/ui/Button';

export default function LearningCompassScreen() {
  const { data: compass, isLoading, error } = useLearningCompass();

  if (isLoading) {
    return (
      <PageLayout title="AI Learning Compass" showBack>
        <div className="p-4 flex flex-col items-center justify-center h-64 opacity-50">
          <Brain className="w-12 h-12 text-edu-primary animate-pulse mb-4" />
          <p className="text-sm font-bold text-edu-muted">Sun'iy intellekt tahlil qilmoqda...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !compass) {
    return (
      <PageLayout title="AI Learning Compass" showBack>
        <div className="p-4">
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-medium">
            Ma'lumotlarni yuklashda xatolik yuz berdi.
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="AI Learning Compass" showBack bgClass="bg-edu-bg dark:bg-black">
      <div className="p-4 space-y-6 pb-safe">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-edu-primary/10 to-transparent p-6 rounded-xl border border-edu-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Compass className="w-24 h-24 text-edu-primary" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-edu-text mb-2">Sizning AI Kompasingiz</h1>
            <p className="text-sm text-edu-muted leading-relaxed font-medium">
              Platformadagi mikrobajarishlar va so'rovlar asosida sizning kuchli va zaif tomonlaringizni hamda bozor talablarini tahlil qilamiz.
            </p>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid gap-4">
          
          {/* Weak Skills (Needs Improvement) */}
          <Card className="border-0 shadow-ios overflow-hidden">
            <div className="bg-red-500/10 p-3 flex items-center gap-2 border-b border-red-500/10">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Zaif nuqtalar</span>
            </div>
            <CardContent className="p-4">
              {compass.weakSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {compass.weakSkills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-edu-muted font-medium">Ajoyib! Reytingi past bo'lgan yo'nalishlar yo'q.</p>
              )}
            </CardContent>
          </Card>

          {/* Strong Skills */}
          <Card className="border-0 shadow-ios overflow-hidden">
            <div className="bg-green-500/10 p-3 flex items-center gap-2 border-b border-green-500/10">
              <Star className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Kuchli tomonlaringiz</span>
            </div>
            <CardContent className="p-4">
              {compass.strongSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {compass.strongSkills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded-xl border border-green-100">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-edu-muted font-medium">Hali yetarli statistika to'planmadi.</p>
              )}
            </CardContent>
          </Card>

          {/* Market Demand Gaps */}
          <Card className="border-0 shadow-ios overflow-hidden">
            <div className="bg-edu-primary/10 p-3 flex items-center justify-between border-b border-edu-primary/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-edu-primary" />
                <span className="text-xs font-bold text-edu-primary uppercase tracking-wider">Bozor talabi (Gaps)</span>
              </div>
              <Activity className="w-4 h-4 text-edu-primary animate-pulse" />
            </div>
            <CardContent className="p-4 space-y-3">
              <p className="text-[11px] text-edu-muted font-medium mb-1">
                Ayni paytda mijozlar tomonidan eng ko'p izlanayotgan, ammo freelancerlar kam bo'lgan yo'nalishlar:
              </p>
              {compass.demandGaps?.length > 0 ? (
                <div className="space-y-2">
                  {compass.demandGaps.map((gap, i) => (
                    <div key={i} className="flex items-center justify-between bg-edu-surface rounded-xl p-3 border border-edu-border/30">
                      <span className="text-sm font-bold text-edu-text">{gap.category}</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${gap.demandLevel === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {gap.demandLevel === 'HIGH' ? 'YUQORI TALAB' : 'O\'RTACHA TALAB'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-edu-muted font-medium">Bozor muvozanatda.</p>
              )}
            </CardContent>
          </Card>

          {/* Suggested Courses */}
          {compass.suggestedCourses?.length > 0 && (
            <div className="pt-4">
               <h3 className="text-xs font-bold text-edu-muted uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                 <BookOpen className="w-4 h-4" /> 
                 Tavsiya etilgan kurslar
               </h3>
               <div className="space-y-3">
                 {compass.suggestedCourses.map((course, idx) => (
                   <div key={idx} className="bg-edu-surface rounded-2xl p-4 shadow-sm border border-edu-border active:scale-[0.98] transition-all cursor-pointer">
                     <h4 className="text-sm font-bold text-edu-text leading-tight mb-1">{course.title}</h4>
                     <p className="text-[11px] text-edu-muted font-medium line-clamp-2 leading-relaxed mb-3">
                       {course.description}
                     </p>
                     <Button size="sm" variant="outline" fullWidth className="text-[11px] h-8">
                       Kursni ko'rish <ChevronRight className="w-3 h-3 ml-1" />
                     </Button>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
}
