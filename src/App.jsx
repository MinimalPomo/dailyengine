import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Zap, 
  Coffee, 
  BookOpen, 
  Dumbbell, 
  Moon, 
  AlertCircle,
  Bell,
  BellOff,
  BarChart3,
  X,
  History
} from 'lucide-react';

const App = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const lastNotifiedTask = useRef(null);

  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('routine_completed_tasks');
    const lastReset = localStorage.getItem('routine_last_reset');
    const today = new Date().toDateString();
    if (lastReset !== today) return [];
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('routine_history');
    return saved ? JSON.parse(saved) : {};
  });

  const schedules = {
    college: [
      { id: 'c1', time: '06:00', end: '06:10', label: 'Wake up', type: 'energy', icon: <Zap size={18}/> },
      { id: 'c2', time: '06:10', end: '06:40', label: 'Jog / exercise', type: 'health', icon: <Dumbbell size={18}/> },
      { id: 'c3', time: '06:40', end: '07:10', label: 'Fresh up', type: 'prep', icon: <Coffee size={18}/> },
      { id: 'c4', time: '07:10', end: '07:50', label: 'Study / revise', type: 'focus', icon: <BookOpen size={18}/> },
      { id: 'c5', time: '08:00', end: '08:30', label: 'Breakfast (PG mess)', type: 'prep', icon: <Coffee size={18}/> },
      { id: 'c6', time: '08:30', end: '15:00', label: 'College (with commute)', type: 'focus', icon: <BookOpen size={18}/> },
      { id: 'c7', time: '15:00', end: '15:30', label: 'Snack + relax (short nap)', type: 'rest', icon: <Moon size={18}/> },
      { id: 'c8', time: '15:30', end: '17:30', label: 'Study / assignments', type: 'focus', icon: <BookOpen size={18}/> },
      { id: 'c9', time: '17:30', end: '18:30', label: 'Gym / walk / sports', type: 'health', icon: <Dumbbell size={18}/> },
      { id: 'c10', time: '18:30', end: '19:30', label: 'Skill building', type: 'focus', icon: <Zap size={18}/> },
      { id: 'c11', time: '19:30', end: '20:00', label: 'Free phone/reels (strict cap)', type: 'warn', icon: <AlertCircle size={18}/> },
      { id: 'c12', time: '20:00', end: '20:30', label: 'Dinner (PG mess)', type: 'prep', icon: <Coffee size={18}/> },
      { id: 'c13', time: '20:30', end: '21:30', label: 'Deep work / revision', type: 'focus', icon: <BookOpen size={18}/> },
      { id: 'c14', time: '21:30', end: '22:00', label: 'Chill (phone, music, chat)', type: 'rest', icon: <Coffee size={18}/> },
      { id: 'c15', time: '22:00', end: '22:30', label: 'Wind down', type: 'rest', icon: <Moon size={18}/> },
      { id: 'c16', time: '22:30', end: '06:00', label: 'Sleep', type: 'rest', icon: <Moon size={18}/> },
    ],
    offDay: [
      { id: 'o1', time: '06:00', end: '06:10', label: 'Wake up', type: 'energy', icon: <Zap size={18}/> },
      { id: 'o2', time: '06:10', end: '06:50', label: 'Jog / exercise (longer)', type: 'health', icon: <Dumbbell size={18}/> },
      { id: 'o3', time: '07:00', end: '07:50', label: 'Focus study', type: 'focus', icon: <BookOpen size={18}/> },
      { id: 'o4', time: '08:00', end: '08:30', label: 'Breakfast (PG mess)', type: 'prep', icon: <Coffee size={18}/> },
      { id: 'o5', time: '08:30', end: '11:30', label: 'Deep work block', type: 'focus', icon: <Zap size={18}/> },
      { id: 'o6', time: '11:30', end: '12:00', label: 'Chill break', type: 'rest', icon: <Coffee size={18}/> },
      { id: 'o7', time: '12:00', end: '13:30', label: 'Productive hobby', type: 'focus', icon: <Zap size={18}/> },
      { id: 'o8', time: '13:30', end: '14:00', label: 'Lunch', type: 'prep', icon: <Coffee size={18}/> },
      { id: 'o9', time: '14:00', end: '15:00', label: 'Nap / light reading', type: 'rest', icon: <Moon size={18}/> },
      { id: 'o10', time: '15:00', end: '17:30', label: 'Study / revision', type: 'focus', icon: <BookOpen size={18}/> },
      { id: 'o11', time: '17:30', end: '18:30', label: 'Sports / gym / walk', type: 'health', icon: <Dumbbell size={18}/> },
      { id: 'o12', time: '18:30', end: '19:30', label: 'Side project / skill', type: 'focus', icon: <Zap size={18}/> },
      { id: 'o13', time: '19:30', end: '20:00', label: 'Chill / reels (timer)', type: 'warn', icon: <AlertCircle size={18}/> },
      { id: 'o14', time: '20:00', end: '20:30', label: 'Dinner', type: 'prep', icon: <Coffee size={18}/> },
      { id: 'o15', time: '20:30', end: '22:00', label: 'Week review / prep', type: 'focus', icon: <BookOpen size={18}/> },
      { id: 'o16', time: '22:00', end: '22:30', label: 'Wind down', type: 'rest', icon: <Moon size={18}/> },
      { id: 'o17', time: '22:30', end: '06:00', label: 'Sleep', type: 'rest', icon: <Moon size={18}/> },
    ]
  };

  const dayOfWeek = currentTime.getDay();
  const isOffDay = dayOfWeek === 0 || dayOfWeek === 1;
  const activeSchedule = isOffDay ? schedules.offDay : schedules.college;

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  const currentTask = useMemo(() => {
    const nowStr = currentTime.getHours().toString().padStart(2, '0') + ':' + 
                   currentTime.getMinutes().toString().padStart(2, '0');
    return activeSchedule.find(item => nowStr >= item.time && nowStr < item.end) || activeSchedule[0];
  }, [currentTime, activeSchedule]);

  useEffect(() => {
    if (notificationsEnabled && currentTask && lastNotifiedTask.current !== currentTask.id) {
      new Notification(`New Task: ${currentTask.label}`, {
        body: `Time: ${currentTask.time} - ${currentTask.end}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/3593/3593504.png'
      });
      lastNotifiedTask.current = currentTask.id;
    }
  }, [currentTask, notificationsEnabled]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    localStorage.setItem('routine_completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('routine_last_reset', todayStr);

    const completionRate = activeSchedule.length > 0 
      ? Math.round((completedTasks.length / activeSchedule.length) * 100)
      : 0;

    setHistory(prev => {
      const updated = { ...prev, [todayStr]: completionRate };
      localStorage.setItem('routine_history', JSON.stringify(updated));
      return updated;
    });
  }, [completedTasks, activeSchedule.length]);

  const toggleTask = (id) => {
    setCompletedTasks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const progress = Math.round((completedTasks.length / activeSchedule.length) * 100);

  const analyticsData = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toDateString();
      const value = history[str] !== undefined ? history[str] : 0;
      dates.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        value: value,
        isToday: str === new Date().toDateString()
      });
    }
    return dates;
  }, [history]);

  const streakCount = useMemo(() => {
    let count = 0;
    const historyKeys = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
    for (let key of historyKeys) {
      if (history[key] >= 80) count++;
      else {
        if (key === new Date().toDateString()) continue;
        break;
      }
    }
    return count;
  }, [history]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans p-2 md:p-8">
      <div className="max-w-2xl mx-auto border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] overflow-hidden relative">
        
        {/* Analytics Overlay */}
        {showAnalytics && (
          <div className="absolute inset-0 z-50 bg-white border-b-2 border-zinc-900 flex flex-col animate-in slide-in-from-top duration-300">
            <div className="p-6 bg-zinc-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2 text-amber-400"><BarChart3 size={20}/><h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Performance Lab</h2></div>
              <button onClick={() => setShowAnalytics(false)} className="bg-white text-zinc-900 p-1 border-2 border-zinc-900"><X size={20} /></button>
            </div>
            <div className="p-6 flex-grow overflow-y-auto space-y-6">
              <div className="border-2 border-zinc-900 p-6 bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
                <h3 className="text-xs font-black uppercase mb-8 flex items-center gap-2 text-zinc-500"><History size={14} /> 7-Day Completion Rate</h3>
                <div className="h-48 flex items-end justify-between gap-1 md:gap-2 px-1">
                  {analyticsData.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="absolute -top-6 bg-zinc-900 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono z-10">{day.value}%</div>
                      <div className={`w-full border-2 border-zinc-900 transition-all duration-700 ${day.isToday ? 'bg-amber-400' : 'bg-zinc-300'}`} style={{ height: `${Math.max(day.value, 5)}%` }} />
                      <span className={`text-[9px] md:text-[10px] font-black uppercase mt-2 ${day.isToday ? 'text-zinc-900' : 'text-zinc-400'}`}>{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-zinc-900 p-4 bg-emerald-50"><p className="text-[10px] font-black uppercase text-emerald-700 text-center">Streak</p><p className="text-3xl font-black italic text-center">{streakCount} Days</p></div>
                <div className="border-2 border-zinc-900 p-4 bg-amber-50"><p className="text-[10px] font-black uppercase text-amber-700 text-center">Weekly Avg</p><p className="text-3xl font-black italic text-center">{Math.round(analyticsData.reduce((acc, curr) => acc + curr.value, 0) / 7)}%</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-zinc-900 text-white p-6 border-b-2 border-zinc-900">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Daily Engine</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded text-[10px] font-mono border border-white/20">
                  <Calendar size={12} className="text-amber-400" />
                  <span>{isOffDay ? 'OFF-DAY' : 'COLLEGE'}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={requestNotificationPermission} className={`p-1.5 rounded border ${notificationsEnabled ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-zinc-500 border-white/10 bg-white/5'}`}>{notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}</button>
                  <button onClick={() => setShowAnalytics(true)} className="p-1.5 rounded border border-amber-400/30 text-amber-400 bg-amber-400/10"><BarChart3 size={14} /></button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-mono font-black tracking-tight">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
              <div className="text-[10px] font-bold opacity-60 uppercase">{currentTime.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest"><span>Day Completion</span><span>{progress}%</span></div>
            <div className="w-full bg-zinc-800 h-4 border-2 border-white overflow-hidden"><div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          </div>
        </header>

        {/* Current Priority */}
        <div className="p-5 bg-amber-50 border-b-2 border-zinc-900 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" /><span className="text-[10px] font-black uppercase text-zinc-600 tracking-wider">Current Priority</span></div>
            <h2 className="text-xl font-black uppercase italic leading-none">{currentTask.label}</h2>
            <p className="font-mono text-xs mt-1 font-bold">{currentTask.time} — {currentTask.end}</p>
          </div>
          <div className="bg-zinc-900 text-white p-3 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">{currentTask.icon}</div>
        </div>

        {/* Timeline Grid Layout - Corrected for alignment */}
        <div className="p-0">
          {activeSchedule.map((item) => {
            const isCompleted = completedTasks.includes(item.id);
            const isCurrent = currentTask.id === item.id;
            return (
              <div key={item.id} onClick={() => toggleTask(item.id)} className={`grid grid-cols-[75px_1fr] border-b-2 border-zinc-900 last:border-b-0 cursor-pointer transition-colors ${isCurrent ? 'bg-zinc-100' : isCompleted ? 'bg-zinc-50' : 'bg-white hover:bg-zinc-50'}`}>
                <div className={`p-3 font-mono text-[10px] font-black border-r-2 border-zinc-900 flex flex-col justify-center items-center gap-1 ${isCurrent ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>
                  <span>{item.time}</span>
                  <div className={`w-full h-[1px] ${isCurrent ? 'bg-white/20' : 'bg-zinc-200'}`} />
                  <span>{item.end}</span>
                </div>
                <div className={`p-4 flex items-center gap-3 overflow-hidden ${isCompleted ? 'opacity-40 grayscale' : ''}`}>
                  <div className={`shrink-0 p-2 border-2 border-zinc-900 bg-white ${isCurrent ? 'shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]' : ''}`}>{item.icon}</div>
                  <div className="min-w-0 flex-grow"><h3 className={`font-black uppercase text-xs truncate ${isCurrent ? 'text-zinc-900' : 'text-zinc-700'} ${isCompleted ? 'line-through' : ''}`}>{item.label}</h3><p className="text-[9px] font-mono font-bold text-zinc-400 tracking-tighter">{item.type.toUpperCase()} BLOCK</p></div>
                  <div className={`shrink-0 w-6 h-6 border-2 border-zinc-900 flex items-center justify-center transition-all ${isCompleted ? 'bg-zinc-900' : 'bg-white'}`}>{isCompleted && <CheckCircle2 size={14} className="text-white" />}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto mt-6 flex justify-between items-center px-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">DISCIPLINE IS FREEDOM</p>
        <button onClick={() => { if(window.confirm('Factory Reset?')) { setCompletedTasks([]); setHistory({}); localStorage.clear(); } }} className="text-[10px] font-black uppercase tracking-tighter border-b-2 border-zinc-900">Factory Reset</button>
      </div>
    </div>
  );
};

export default App;
                
