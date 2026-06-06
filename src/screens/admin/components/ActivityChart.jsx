// src/screens/admin/components/ActivityChart.jsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function ActivityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#475569" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          tickMargin={10}
        />
        <YAxis 
          stroke="#475569" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(value) => Math.round(value)}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px', color: '#f1f5f9' }}
          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
        />
        <Area 
          type="monotone" 
          dataKey="users" 
          name="Yangi foydalanuvchilar" 
          stroke="#818cf8" 
          strokeWidth={3} 
          fillOpacity={1} 
          fill="url(#colorUsers)" 
          activeDot={{ r: 6, strokeWidth: 0, fill: '#818cf8' }}
        />
        <Area 
          type="monotone" 
          dataKey="tasks" 
          name="Yangi topshiriqlar" 
          stroke="#34d399" 
          strokeWidth={3} 
          fillOpacity={1} 
          fill="url(#colorTasks)" 
          activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
