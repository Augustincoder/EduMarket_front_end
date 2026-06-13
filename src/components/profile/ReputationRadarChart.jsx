import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

export function ReputationRadarChart({ dna }) {
  if (!dna) return null;

  // Data format for recharts
  const data = [
    { subject: 'Sifat (Qabul)', A: dna.revisionRate || 0, fullMark: 100 },
    { subject: 'Mas\'uliyat (Vaqt)', A: dna.deadlineAccuracy || 0, fullMark: 100 },
    { subject: 'Tezlik (Javob)', A: dna.responseSpeed || 0, fullMark: 100 },
    { subject: 'Sodiqlik (Qayta)', A: dna.repeatClients || 0, fullMark: 100 },
    { subject: 'Ishonch (Tugatish)', A: dna.completionRate || 0, fullMark: 100 },
  ];

  return (
    <div className="bg-edu-surface p-5 rounded-xl border border-edu-border/30 shadow-ios relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] bg-edu-primary/20 blur-[40px] rounded-full pointer-events-none" />

      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-bold text-edu-text flex items-center gap-2">
            🧬 Reputation DNA
          </h3>
          <p className="text-xs text-edu-muted">Algoritmik ishonch pasporti</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-edu-primary to-edu-accent">
            {dna.totalScore ? dna.totalScore.toFixed(1) : '0.0'}
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-edu-muted">Jami Ball</p>
        </div>
      </div>

      <motion.div 
        className="w-full h-[220px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#3A3A3C" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#8E8E93', fontSize: 10, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #3A3A3C', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: '#0A84FF', fontWeight: 'bold' }}
              formatter={(value) => [`${value.toFixed(0)}%`, 'Ko\'rsatkich']}
            />
            <Radar
              name="DNA"
              dataKey="A"
              stroke="#0A84FF"
              strokeWidth={2}
              fill="url(#colorUv)"
              fillOpacity={0.5}
            />
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#5E5CE6" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
