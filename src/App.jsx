import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Zap, 
  Coffee, 
  BookOpen, 
  Dumbbell, 
  Moon, 
  AlertCircle,
  Bell,
  BellOff
} from 'lucide-react';

const App = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const lastNotifiedTask = useRef(null);

  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('routine_completed_tasks');
    const lastReset = localStorage.getItem('routine_last_reset');
    const today = new Date().toDateString();
    
    if (lastReset !== today) return [];
    return saved ? JSON.parse(saved) : [];
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

  // Notification Logic
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

  // Trigger Notification when currentTask changes
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
    localStorage.setItem('routine_completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('routine_last_reset', new Date().toDateString());
  }, [completedTasks]);

  const toggleTask = (id) => {
    setCompletedTasks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const progress = Math.round((completedTasks.length / activeSchedule.length) * 100);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] overflow-hidden">
        
        {/* Header Section */}
        <header className="bg-zinc-900 text-white p-6 border-b-2 border-zinc-900">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Daily Engine</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded text-xs font-mono">
                  <Calendar size={14} className="text-amber-400" />
                  <span>{isOffDay ? 'STATUS: OFF-DAY' : 'STATUS: COLLEGE'}</span>
                </div>
                <button 
                  onClick={requestNotificationPermission}
                  className={`p-1 rounded transition-colors ${notificationsEnabled ? 'text-emerald-400 bg-emerald-400/10' : 'text-zinc-500 bg-white/5'}`}
                  title={notificationsEnabled ? "Notifications Active" : "Enable Notifications"}
                >
                  {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-mono font-black tracking-tight">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
              <div className="text-[10px] font-bold opacity-60 uppercase">{currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
              <span>Day Completion</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-6 border-2 border-white overflow-hidden">
              <div 
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        {/* Current Active Task */}
        <div className="p-6 bg-amber-50 border-b-2 border-zinc-900 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
              <span className="text-xs font-black uppercase text-zinc-600 tracking-wider">Current Priority</span>
            </div>
            <h2 className="text-2xl font-black uppercase italic leading-none">{currentTask.label}</h2>
            <p className="font-mono text-sm mt-1 font-bold">{currentTask.time} — {currentTask.end}</p>
          </div>
          <div className="bg-zinc-900 text-white p-3 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            {currentTask.icon}
          </div>
        </div>

        {/* Timeline */}
        <div className="p-0">
          {activeSchedule.map((item) => {
            const isCompleted = completedTasks.includes(item.id);
            const isCurrent = currentTask.id === item.id;
            
            return (
              <div 
                key={item.id}
                onClick={() => toggleTask(item.id)}
                className={`group flex border-b-2 border-zinc-900 last:border-b-0 cursor-pointer transition-colors ${
                  isCurrent ? 'bg-zinc-100' : isCompleted ? 'bg-zinc-50' : 'bg-white hover:bg-zinc-50'
                }`}
              >
                <div className={`w-20 p-4 font-mono text-xs font-black border-r-2 border-zinc-900 flex flex-col justify-center items-center ${isCurrent ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>
                  <span>{item.time}</span>
                  <div className={`w-0.5 h-4 my-1 ${isCurrent ? 'bg-white/20' : 'bg-zinc-200'}`} />
                  <span>{item.end.split(':')[0]}:{item.end.split(':')[1]}</span>
                </div>

                <div className={`flex-grow p-4 flex items-center gap-4 ${isCompleted ? 'opacity-40 grayscale' : ''}`}>
                  <div className={`p-2 border-2 border-zinc-900 bg-white ${isCurrent ? 'shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]' : ''}`}>
                    {item.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className={`font-black uppercase text-sm ${isCurrent ? 'text-zinc-900' : 'text-zinc-700'} ${isCompleted ? 'line-through' : ''}`}>
                      {item.label}
                    </h3>
                    <p className="text-[10px] font-mono font-bold text-zinc-400">{item.type.toUpperCase()} BLOCK</p>
                  </div>
                  
                  <div className={`w-6 h-6 border-2 border-zinc-900 flex items-center justify-center transition-all ${isCompleted ? 'bg-zinc-900' : 'bg-white'}`}>
                    {isCompleted && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 flex justify-between items-center px-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">DISCIPLINE IS FREEDOM</p>
        <button 
          onClick={() => {
            if(window.confirm('Reset daily tasks?')) setCompletedTasks([]);
          }}
          className="text-[10px] font-black uppercase tracking-tighter border-b-2 border-zinc-900 hover:text-zinc-500 hover:border-zinc-300"
        >
          Flush Data
        </button>
      </div>
    </div>
  );
};

export default App;
