import React, { useState, useEffect } from 'react';
import { FlightMode, PlatformMode } from '../types';
import { 
  Battery, Wifi, Navigation, ArrowUpCircle, Anchor, Wind, Thermometer, 
  Database, Signal, Zap, Activity, 
  RotateCw, ShieldCheck, Waves, Globe, Ship, Play, Pause, Disc, Lightbulb, Droplets,
  FastForward, Camera, Scan, CheckCircle, ArrowDownCircle, RefreshCw, Download, Trash2, StopCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Navigation Modes (Now for Platform/Mother Ship)
enum NavMode {
  FULL_SPEED = 'FULL_SPEED',
  CRUISE = 'CRUISE',
  ANCHOR = 'ANCHOR'
}

// Mock History Data for Charts
const WEATHER_HISTORY = [
  { time: '60m', wind: 2.1, temp: 23.1, humidity: 60 },
  { time: '50m', wind: 2.4, temp: 23.3, humidity: 61 },
  { time: '40m', wind: 2.8, temp: 23.5, humidity: 63 },
  { time: '30m', wind: 3.5, temp: 23.8, humidity: 62 },
  { time: '20m', wind: 3.2, temp: 24.0, humidity: 64 },
  { time: '10m', wind: 3.6, temp: 24.1, humidity: 65 },
  { time: '现在', wind: 3.5, temp: 24.2, humidity: 65 },
];

const TabDevice: React.FC = () => {
  const [activeControl, setActiveControl] = useState<'drone' | 'platform' | 'submarine'>('drone');
  
  // Extended Status State
  const [status, setStatus] = useState({
    dockBattery: 85,
    droneBattery: 92,
    subBattery: 78,
    flightTime: 124, // Dock total runtime
    isConnected: true,
    gpsSignal: '强',
    satelliteCount: 14,
    compassStatus: '正常',
    pressureStatus: '正常'
  });

  const [flightMode, setFlightMode] = useState<FlightMode>(FlightMode.STANDBY); // Used for Drone Cruise
  const [isCruising, setIsCruising] = useState(false); // Drone Smart Cruise
  
  const [platformMode, setPlatformMode] = useState<PlatformMode>(PlatformMode.LOCKED);
  const [navMode, setNavMode] = useState<NavMode>(NavMode.ANCHOR); // Platform Navigation Mode
  const [inflationLevel, setInflationLevel] = useState(80); // 0-100

  // Joint Operation State
  const [isLandingSequence, setIsLandingSequence] = useState(false);
  const [landingStep, setLandingStep] = useState(0); // 0: Idle, 1: Platform Stabilizing, 2: Drone Approach, 3: Landed

  // Submarine State
  const [subLight, setSubLight] = useState(false);
  const [subData, setSubData] = useState({
    depth: 45.2,
    temp: 12.4,
    pressure: 4.2
  });
  
  // Submarine Logging State
  const [isSubRecording, setIsSubRecording] = useState(false);
  const [subLogs, setSubLogs] = useState<Array<{time: string, depth: number, temp: number, pressure: number}>>([]);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);

  // Weather Station State
  const [weather, setWeather] = useState({ wind: 3.5, temp: 24.2, humidity: 65 });
  const [selectedWeatherMetric, setSelectedWeatherMetric] = useState<'wind' | 'temp' | 'humidity'>('wind');

  const [suppressionRate, setSuppressionRate] = useState(95);

  // Battery Ring Constants
  const sizeLg = 160;
  const strokeLg = 12;
  const radiusLg = (sizeLg - strokeLg) / 2;
  const circumLg = 2 * Math.PI * radiusLg;
  
  const sizeSm = 60;
  const strokeSm = 6;
  const radiusSm = (sizeSm - strokeSm) / 2;
  const circumSm = 2 * Math.PI * radiusSm;

  // Simulation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Basic Status updates
      setStatus(prev => ({
        ...prev,
        dockBattery: Math.max(0, prev.dockBattery - (Math.random() * 0.02)),
        droneBattery: Math.max(0, prev.droneBattery - (Math.random() * 0.05)),
        subBattery: Math.max(0, prev.subBattery - (Math.random() * 0.04)),
        satelliteCount: Math.floor(14 + Math.random() * 3)
      }));
      setWeather(prev => ({
        wind: parseFloat((3.5 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        temp: parseFloat((24.0 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        humidity: Math.floor(65 + (Math.random() * 2 - 1))
      }));
      setSuppressionRate(prev => Math.min(99.9, Math.max(90, 95 + (Math.random() * 1 - 0.5))));
      
      // Submarine Data Simulation
      setSubData(prev => {
          const newDepth = parseFloat((prev.depth + (Math.random() * 0.2 - 0.1)).toFixed(1));
          const newTemp = parseFloat((prev.temp + (Math.random() * 0.1 - 0.05)).toFixed(1));
          const newPressure = parseFloat((newDepth * 0.1 + 0.1).toFixed(2)); // Rough estimation
          return { depth: newDepth, temp: newTemp, pressure: newPressure };
      });

      // Joint Operation Simulation
      if (isLandingSequence) {
          setLandingStep(prev => {
              if (prev < 100) return prev + 1;
              setIsLandingSequence(false);
              setPlatformMode(PlatformMode.STABILIZING); // Ensure stabilized
              return 0;
          });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isLandingSequence]);

  // Logging Effect
  useEffect(() => {
      let logInterval: any;
      if (isSubRecording) {
          logInterval = setInterval(() => {
              const now = new Date();
              const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
              setSubLogs(prev => [...prev, {
                  time: timeStr,
                  depth: subData.depth,
                  temp: subData.temp,
                  pressure: subData.pressure
              }]);
          }, 1000);
      }
      return () => clearInterval(logInterval);
  }, [isSubRecording, subData]);

  const startJointLanding = () => {
      if (isLandingSequence) return;
      setIsLandingSequence(true);
      setLandingStep(1);
      setPlatformMode(PlatformMode.STABILIZING); // Auto stabilize platform
      setActiveControl('platform'); // Switch view to platform to see stabilization
  };

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 1500);
  };

  const handleInspect = () => {
    setIsInspecting(!isInspecting);
  };

  const exportSubLogs = () => {
      if (subLogs.length === 0) return;
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + "Time,Depth(m),Temp(C),Pressure(MPa)\n"
          + subLogs.map(row => `${row.time},${row.depth},${row.temp},${row.pressure}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Submarine_Data_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const clearSubLogs = () => {
      setSubLogs([]);
  };

  const renderBatteryRing = (pct: number, size: number, stroke: number, radius: number, circum: number, color: string, label: string, icon: any) => {
    const offset = circum - (pct / 100) * circum;
    const Icon = icon;
    return (
      <div className="flex flex-col items-center justify-center relative">
        <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 overflow-visible">
                <circle cx={size/2} cy={size/2} r={radius} stroke="#f1f5f9" strokeWidth={stroke} fill="none" strokeLinecap="round" />
                <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={circum} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                {size > 100 ? (
                     <div className="flex flex-col items-center">
                        <span className="text-4xl font-extrabold tracking-tighter">{pct.toFixed(0)}<span className="text-lg text-slate-400">%</span></span>
                        <Icon size={16} className="text-slate-400 mt-1" />
                     </div>
                ) : (
                     <Icon size={18} className={pct > 20 ? "text-slate-600" : "text-red-500"} />
                )}
            </div>
        </div>
        {size < 100 && <span className="text-[10px] font-bold text-slate-500 mt-1">{pct.toFixed(0)}%</span>}
      </div>
    );
  };

  // Helper to render weather chart configuration
  const getWeatherConfig = () => {
      switch(selectedWeatherMetric) {
          case 'wind': return { color: '#06b6d4', label: '风速', unit: 'm/s' };
          case 'temp': return { color: '#f97316', label: '外温', unit: '°C' };
          case 'humidity': return { color: '#3b82f6', label: '湿度', unit: '%' };
      }
  };
  const weatherConfig = getWeatherConfig();

  return (
    <div className="flex flex-col h-full px-5 pt-12 pb-32 overflow-y-auto space-y-6 scroll-smooth bg-slate-50">
      
      {/* =========================================================================
          SECTION 1: 顶部核心设备状态板块 (AirPods Style Power Management)
          ========================================================================= */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex-shrink-0 relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">
             <Wifi size={14} strokeWidth={3} />
             <span className="text-xs font-bold tracking-wide">已连接 · AeroMarinX</span>
          </div>
          <div className="flex items-center space-x-2">
             <div className="flex items-center space-x-1 px-2 py-1 bg-slate-50 rounded-lg">
                <Globe size={12} className="text-slate-400"/>
                <span className="text-[10px] font-bold text-slate-600">{status.satelliteCount} 颗</span>
             </div>
             <div className="p-2 bg-slate-50 rounded-full text-slate-400">
                <Battery size={20} />
             </div>
          </div>
        </div>

        {/* BATTERY CLUSTER */}
        <div className="flex items-center justify-center space-x-8 mb-6 relative z-10">
            {/* Main Dock Battery */}
            <div className="flex flex-col items-center">
                {renderBatteryRing(status.dockBattery, sizeLg, strokeLg, radiusLg, circumLg, '#10b981', '母船', Anchor)}
                <span className="text-xs font-bold text-slate-400 mt-2 bg-slate-100 px-2 py-0.5 rounded">母船 / 充电仓</span>
            </div>
            
            {/* Sub-Devices Batteries */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3 bg-slate-50 p-2 pr-4 rounded-2xl border border-slate-100">
                    {renderBatteryRing(status.droneBattery, sizeSm, strokeSm, radiusSm, circumSm, '#3b82f6', '无人机', Zap)}
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">无人机</span>
                        <span className="text-[10px] text-slate-400">待命</span>
                    </div>
                </div>
                <div className="flex items-center space-x-3 bg-slate-50 p-2 pr-4 rounded-2xl border border-slate-100">
                    {renderBatteryRing(status.subBattery, sizeSm, strokeSm, radiusSm, circumSm, '#6366f1', '潜航器', Disc)}
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">潜航器</span>
                        <span className="text-[10px] text-slate-400">充电中</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 relative z-10">
            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Navigation size={18} className="text-blue-500 mb-1" />
                <span className="text-[10px] text-slate-400 font-medium">GPS 信号</span>
                <span className="text-xs font-bold text-slate-700">{status.gpsSignal}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Anchor size={18} className="text-purple-500 mb-1" />
                <span className="text-[10px] text-slate-400 font-medium">视觉定位</span>
                <span className="text-xs font-bold text-slate-700">正常</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Activity size={18} className="text-orange-500 mb-1" />
                <span className="text-[10px] text-slate-400 font-medium">IMU 状态</span>
                <span className="text-xs font-bold text-slate-700">良好</span>
            </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION NEW: 海空协同任务卡片 (Joint Operation)
          ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group min-h-[160px] flex flex-col justify-between">
          {/* Background FX */}
          <div className="absolute right-0 top-0 w-48 h-full bg-blue-500/10 transform skew-x-12 pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 backdrop-blur-sm">
                      <RefreshCw size={20} className={isLandingSequence ? "animate-spin" : ""} />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg tracking-wide">海空协同稳降</h3>
                      <p className="text-[10px] text-slate-400 font-medium">AeroMarinX Joint Recovery</p>
                  </div>
              </div>
              <div className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-bold border border-white/5 backdrop-blur-md">
                  {isLandingSequence ? 'SEQUENCE ACTIVE' : 'SYSTEM READY'}
              </div>
          </div>
          
          {isLandingSequence ? (
              <div className="space-y-4 relative z-10 animate-fade-in w-full">
                  <div className="flex justify-between text-xs text-blue-200 font-medium">
                      <span>任务进度</span>
                      <span className="font-mono">{landingStep}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 h-2.5 rounded-full overflow-hidden backdrop-blur-sm">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${landingStep}%` }}></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-medium pt-1">
                       <div className={`transition-colors duration-300 ${landingStep > 5 ? 'text-green-400' : 'text-slate-500'}`}>1. 平台增稳</div>
                       <div className={`transition-colors duration-300 ${landingStep > 40 ? 'text-green-400' : 'text-slate-500'}`}>2. 视觉对准</div>
                       <div className={`transition-colors duration-300 ${landingStep > 80 ? 'text-green-400' : 'text-slate-500'}`}>3. 自动降落</div>
                  </div>
              </div>
          ) : (
              <div className="flex items-center gap-4 relative z-10 pt-2">
                  <button 
                      onClick={startJointLanding}
                      className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/50 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 border border-blue-500/50"
                  >
                      <ArrowDownCircle size={18} />
                      <span>一键协同回收</span>
                  </button>
                  <div className="flex-1 flex flex-col justify-center space-y-1 text-[10px] text-slate-400 leading-tight border-l border-white/10 pl-4">
                      <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <span>六轴增稳</span>
                      </div>
                      <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <span>视觉定位</span>
                      </div>
                      <div className="flex items-center space-x-1">
                           <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                           <span>精准降落</span>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* =========================================================================
          SECTION 2: 系统切换开关 (3 Tabs)
          ========================================================================= */}
      <div className="bg-slate-200 p-1.5 rounded-2xl flex relative shadow-inner flex-shrink-0">
        <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(33.33%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out 
            ${activeControl === 'drone' ? 'left-1.5' : activeControl === 'platform' ? 'left-[calc(33.33%+2px)]' : 'left-[calc(66.66%+0px)]'}`}
        />
        <button 
            onClick={() => setActiveControl('drone')}
            className={`flex-1 py-3 text-sm font-bold z-10 text-center transition-colors flex items-center justify-center space-x-1 ${activeControl === 'drone' ? 'text-slate-800' : 'text-slate-500'}`}
        >
            <Zap size={16} />
            <span>飞行系统</span>
        </button>
        <button 
            onClick={() => setActiveControl('platform')}
            className={`flex-1 py-3 text-sm font-bold z-10 text-center transition-colors flex items-center justify-center space-x-1 ${activeControl === 'platform' ? 'text-slate-800' : 'text-slate-500'}`}
        >
            <Anchor size={16} />
            <span>海上平台</span>
        </button>
        <button 
            onClick={() => setActiveControl('submarine')}
            className={`flex-1 py-3 text-sm font-bold z-10 text-center transition-colors flex items-center justify-center space-x-1 ${activeControl === 'submarine' ? 'text-slate-800' : 'text-slate-500'}`}
        >
            <Disc size={16} />
            <span>深潜系统</span>
        </button>
      </div>

      {/* =========================================================================
          SECTION 3: 详细数据功能区
          ========================================================================= */}
      <div className="flex-1 space-y-5 pb-8">
        
        {/* === DRONE VIEW === */}
        {activeControl === 'drone' && (
            <div className="space-y-5 animate-fade-in">
                {/* 飞行 - 基础数据 */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center space-x-2 text-slate-400 mb-2">
                            <Zap size={14} />
                            <span className="text-xs font-bold">总电压</span>
                        </div>
                        <div className="text-xl font-extrabold text-slate-800">22.4 V</div>
                        <div className="text-[10px] text-slate-400 mt-1">单芯压差 0.02V</div>
                     </div>
                     <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center space-x-2 text-slate-400 mb-2">
                            <Signal size={14} />
                            <span className="text-xs font-bold">图传链路</span>
                        </div>
                        <div className="text-xl font-extrabold text-slate-800">HD 1080p</div>
                        <div className="text-[10px] text-slate-400 mt-1">延迟 28ms</div>
                     </div>
                </div>

                {/* 飞行 - 智能巡航 */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                             <Navigation size={18} className="text-blue-600"/> 
                             <span className="font-bold text-slate-700">智能巡航</span>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${isCruising ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                            {isCruising ? 'Patrolling' : 'Manual'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        基于视觉识别的每日海上安全自动巡逻模式。启动后将按照预设航线飞行并自动避障。
                    </p>
                    <button 
                        onClick={() => setIsCruising(!isCruising)}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm flex items-center justify-center space-x-2 ${
                            isCruising 
                            ? 'bg-blue-600 text-white shadow-blue-200' 
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {isCruising ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        <span>{isCruising ? '暂停巡航任务' : '启动一键巡航'}</span>
                    </button>
                </div>

                {/* 飞行 - 动力健康 */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                            <RotateCw size={16} />
                        </div>
                        <h3 className="font-bold text-slate-700">动力系统健康度</h3>
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-2 font-medium">
                            <span className="text-slate-500">桨叶/电机寿命</span>
                            <span className="text-slate-800">12h / 50h</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[24%] rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl">
                        <span className="text-xs text-slate-500 font-bold">电池最大容量</span>
                        <span className="text-sm font-extrabold text-emerald-500">98%</span>
                    </div>
                </div>
            </div>
        )}

        {/* === PLATFORM VIEW === */}
        {activeControl === 'platform' && (
            <div className="space-y-5 animate-fade-in">
                 {/* 1. 平台 - 航行模式控制 (New Top Card) */}
                 <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-2 mb-4">
                         <Ship size={18} className="text-indigo-600"/> 
                         <span className="font-bold text-slate-700">航行模式控制</span>
                    </div>
                    <div className="flex bg-slate-100 p-1.5 rounded-xl">
                        <button 
                            onClick={() => setNavMode(NavMode.FULL_SPEED)}
                            className={`flex-1 py-3 rounded-lg flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${navMode === NavMode.FULL_SPEED ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FastForward size={20} />
                            <span className="text-[10px] font-bold">全速前进</span>
                        </button>
                        <button 
                            onClick={() => setNavMode(NavMode.CRUISE)}
                            className={`flex-1 py-3 rounded-lg flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${navMode === NavMode.CRUISE ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Play size={20} />
                            <span className="text-[10px] font-bold">智能巡航</span>
                        </button>
                        <button 
                            onClick={() => setNavMode(NavMode.ANCHOR)}
                            className={`flex-1 py-3 rounded-lg flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${navMode === NavMode.ANCHOR ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Anchor size={20} />
                            <span className="text-[10px] font-bold">定点锚泊</span>
                        </button>
                    </div>
                 </div>

                 {/* 2. 平台 - 增稳系统 */}
                 <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                                <Activity size={16} />
                            </div>
                            <h3 className="text-slate-700 font-bold">六自由度增稳</h3>
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded border ${platformMode === PlatformMode.STABILIZING ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {platformMode === PlatformMode.STABILIZING ? 'ACTIVE' : 'LOCKED'}
                        </div>
                    </div>
                    
                    <div className="h-32 bg-slate-50 rounded-2xl mb-5 relative overflow-hidden border border-slate-100 flex items-center justify-center">
                        <div className="absolute inset-x-0 bottom-0 h-16 opacity-30">
                             <div className="w-full h-full bg-indigo-400 rounded-t-[100%] animate-wave transform translate-y-4"></div>
                        </div>
                        <div className={`transition-transform duration-700 ease-spring transform ${platformMode === PlatformMode.STABILIZING ? 'translate-y-0 rotate-0' : 'translate-y-2 rotate-3'}`}>
                             <div className="w-24 h-2 bg-slate-800 rounded-full shadow-xl"></div>
                             <div className="w-8 h-8 bg-yellow-400 mx-auto -mt-5 rounded-full border-4 border-slate-800 shadow-sm z-10 relative"></div>
                        </div>
                        <div className="absolute top-3 left-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">晃动抑制率</span>
                            <div className="text-2xl font-black text-slate-800 tabular-nums">{platformMode === PlatformMode.STABILIZING ? suppressionRate.toFixed(1) : '0.0'}%</div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setPlatformMode(prev => prev === PlatformMode.LOCKED ? PlatformMode.STABILIZING : PlatformMode.LOCKED)}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors shadow-sm ${
                            platformMode === PlatformMode.STABILIZING
                            ? 'bg-indigo-600 text-white shadow-indigo-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                    >
                        {platformMode === PlatformMode.STABILIZING ? '增稳已激活 (点击解锁)' : '锁定机械结构'}
                    </button>
                 </div>

                 {/* 3. 平台 - 浮力控制 */}
                 <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center space-x-2">
                            <ArrowUpCircle size={18} className="text-emerald-500"/> 
                            <span className="font-bold text-slate-700">浮力气囊系统</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">AUTO</span>
                    </div>
                    
                    <div className="relative h-12 bg-slate-100 rounded-2xl p-1.5 flex items-center mb-5">
                        <div 
                            className="absolute left-1.5 top-1.5 bottom-1.5 bg-emerald-500 rounded-xl opacity-20 transition-all duration-300"
                            style={{ width: `${inflationLevel}%` }}
                        />
                        <div 
                            className="absolute h-9 w-9 bg-white rounded-xl shadow border border-slate-200 flex items-center justify-center text-emerald-600 transition-all duration-300 z-10"
                            style={{ left: `calc(${inflationLevel}% - 24px)` }}
                        >
                            <Wind size={16} />
                        </div>
                         <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={inflationLevel}
                            onChange={(e) => setInflationLevel(parseInt(e.target.value))}
                            className="w-full h-full opacity-0 cursor-pointer absolute z-20"
                         />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex items-center space-x-1 mb-1">
                                <ShieldCheck size={12} className="text-slate-400"/>
                                <span className="text-[10px] text-slate-500 font-bold">气密性</span>
                            </div>
                            <div className="text-sm font-black text-slate-700">100%</div>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex items-center space-x-1 mb-1">
                                <Thermometer size={12} className="text-slate-400"/>
                                <span className="text-[10px] text-slate-500 font-bold">水温</span>
                            </div>
                            <div className="text-sm font-black text-slate-700">18.5°C</div>
                         </div>
                    </div>
                 </div>
            </div>
        )}

        {/* === SUBMARINE VIEW === */}
        {activeControl === 'submarine' && (
            <div className="space-y-5 animate-fade-in">
                {/* 1. Deep Dive Dashboard (Updated: Removed Mode Switcher) */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden h-48 flex flex-col justify-between">
                    {/* Bubbles bg effect */}
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                         <Droplets size={120} />
                    </div>
                    
                    <div className="flex justify-between items-start relative z-10">
                         <div>
                            <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider">当前深度</span>
                            <div className="text-5xl font-black mt-1 tabular-nums">{subData.depth.toFixed(1)}<span className="text-lg font-bold text-indigo-400 ml-1">m</span></div>
                         </div>
                         <div className="text-right">
                             <div className="flex items-center justify-end space-x-1 text-indigo-300 mb-1">
                                <Thermometer size={14} />
                                <span className="text-xs font-bold">水温</span>
                             </div>
                             <div className="text-xl font-bold">{subData.temp.toFixed(1)}°C</div>
                             <div className="flex items-center justify-end space-x-1 text-indigo-300 mt-2 mb-1">
                                <Activity size={14} />
                                <span className="text-xs font-bold">压强</span>
                             </div>
                             <div className="text-xl font-bold">{subData.pressure.toFixed(1)} MPa</div>
                         </div>
                    </div>
                    
                    {/* Status Text at bottom */}
                    <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold bg-white/5 backdrop-blur px-3 py-2 rounded-lg w-fit">
                        <Activity size={14} className="animate-pulse" />
                        <span>深潜探测作业进行中</span>
                    </div>
                </div>

                {/* 2. Water Quality & Recording & Export (New & Improved) */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Database size={18} className="text-cyan-500" />
                            <h3 className="font-bold text-slate-700">数据记录与导出</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                           <span className="text-[10px] text-slate-400 font-bold">{subLogs.length} 条记录</span>
                           <button onClick={clearSubLogs} disabled={subLogs.length === 0} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg">
                               <Trash2 size={14} />
                           </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button 
                            onClick={() => setIsSubRecording(!isSubRecording)}
                            className={`py-3.5 rounded-2xl font-bold text-xs transition-all flex flex-col items-center justify-center space-y-1 ${
                                isSubRecording 
                                ? 'bg-red-50 border border-red-100 text-red-600' 
                                : 'bg-slate-50 border border-slate-100 text-slate-700'
                            }`}
                        >
                            {isSubRecording ? (
                                <>
                                    <StopCircle size={20} className="animate-pulse" />
                                    <span>停止记录</span>
                                </>
                            ) : (
                                <>
                                    <Play size={20} />
                                    <span>开始实时记录</span>
                                </>
                            )}
                        </button>
                        <button 
                            onClick={exportSubLogs}
                            disabled={subLogs.length === 0}
                            className={`py-3.5 rounded-2xl font-bold text-xs transition-all flex flex-col items-center justify-center space-y-1 ${
                                subLogs.length > 0 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <Download size={20} />
                            <span>导出 CSV</span>
                        </button>
                    </div>

                    {/* Mini Log Preview */}
                    <div className="bg-slate-50 rounded-xl p-3 h-24 overflow-y-auto text-[10px] font-mono text-slate-500 border border-slate-100">
                        {subLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-50">
                                <span>暂无数据记录</span>
                            </div>
                        ) : (
                            subLogs.slice().reverse().map((log, idx) => (
                                <div key={idx} className="flex justify-between py-0.5 border-b border-slate-200 last:border-0">
                                    <span>[{log.time}]</span>
                                    <span>D:{log.depth}m T:{log.temp}C</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. Searchlight Toggle */}
                <button 
                    onClick={() => setSubLight(!subLight)}
                    className={`w-full p-5 rounded-3xl shadow-sm border transition-all duration-300 flex items-center justify-between group ${
                        subLight 
                        ? 'bg-yellow-400 border-yellow-500 text-slate-900 shadow-yellow-200' 
                        : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${subLight ? 'bg-white/30' : 'bg-slate-100'}`}>
                            <Lightbulb size={24} className={subLight ? 'text-slate-900' : 'text-slate-400'} fill={subLight ? "currentColor" : "none"} />
                        </div>
                        <div className="text-left">
                            <h3 className={`font-bold ${subLight ? 'text-slate-900' : 'text-slate-700'}`}>一键探照</h3>
                            <p className={`text-xs ${subLight ? 'text-slate-800/70' : 'text-slate-400'}`}>深海补光灯阵列</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${subLight ? 'bg-slate-900' : 'bg-slate-200'}`}>
                         <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${subLight ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </button>

                {/* 4. One-key Photo (New) */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                         <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <Camera size={20} />
                         </div>
                         <div>
                            <h3 className="font-bold text-slate-700">海底影像采集</h3>
                            <p className="text-xs text-slate-400">调用主摄 4K HDR</p>
                         </div>
                     </div>
                     <button 
                        onClick={handleCapture}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${isCapturing ? 'bg-blue-100 text-blue-600' : 'bg-slate-900 text-white shadow-lg shadow-slate-200'}`}
                     >
                        {isCapturing ? '拍摄中...' : '拍摄当前画面'}
                     </button>
                </div>

                {/* 5. AI Inspection (New) */}
                <div className="bg-slate-900 p-5 rounded-3xl shadow-lg relative overflow-hidden group">
                     {/* Decorative background */}
                     <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-900/50 to-transparent"></div>
                     <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12">
                        <Scan size={80} className="text-white" />
                     </div>

                     <div className="flex items-center space-x-2 mb-3 relative z-10">
                         <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                            <Scan size={18} />
                         </div>
                         <h3 className="font-bold text-white">智能运维检测</h3>
                     </div>
                     <p className="text-xs text-slate-400 mb-5 relative z-10 leading-relaxed max-w-[80%]">
                        利用潜艇视觉给水面的海上平台进行自动AI识别检修维护。
                     </p>
                     
                     <button 
                        onClick={handleInspect}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 relative z-10 ${
                            isInspecting 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 border border-blue-500' 
                            : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                        }`}
                     >
                        {isInspecting ? (
                            <>
                                <div className="w-2 h-2 bg-white rounded-full animate-ping mr-2"></div>
                                <span>正在全自动体检...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} />
                                <span>启动水下巡检</span>
                            </>
                        )}
                     </button>
                </div>
            </div>
        )}

        {/* 4. 微气象站 (Bottom Feature - Chart Version) */}
        <div className="bg-white px-5 py-5 rounded-3xl mt-2 border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Waves size={16} className="text-cyan-500" />
                    <h3 className="text-sm font-bold text-slate-700">微气象站</h3>
                </div>
                <span className="text-[10px] text-slate-400">过去 1 小时</span>
             </div>

             {/* Metric Selectors */}
             <div className="flex space-x-2 mb-4">
                 {[
                     { id: 'wind', label: '风速', value: weather.wind, unit: 'm/s', icon: Wind },
                     { id: 'temp', label: '外温', value: weather.temp, unit: '°C', icon: Thermometer },
                     { id: 'humidity', label: '湿度', value: weather.humidity, unit: '%' , icon: Droplets },
                 ].map((metric) => (
                    <button
                        key={metric.id}
                        onClick={() => setSelectedWeatherMetric(metric.id as any)}
                        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                            selectedWeatherMetric === metric.id 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                        }`}
                    >
                        <span className="text-[10px] opacity-70 mb-1">{metric.label}</span>
                        <div className="flex items-baseline">
                             <span className="text-sm font-bold">{metric.value}</span>
                             <span className="text-[9px] ml-0.5 opacity-70">{metric.unit}</span>
                        </div>
                    </button>
                 ))}
             </div>

             {/* Recharts Chart */}
             <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={WEATHER_HISTORY}>
                        <defs>
                            <linearGradient id="weatherGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={weatherConfig.color} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={weatherConfig.color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="time" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 9, fill: '#94a3b8'}} 
                            interval="preserveStartEnd"
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
                            labelStyle={{ display: 'none' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey={selectedWeatherMetric} 
                            stroke={weatherConfig.color} 
                            strokeWidth={2} 
                            fill="url(#weatherGradient)" 
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>
    </div>
  );
};

export default TabDevice;