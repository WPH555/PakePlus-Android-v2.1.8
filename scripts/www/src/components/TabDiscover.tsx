import React, { useState, useEffect, useRef } from 'react';
import { DiscoveryFeature } from '../types';
import { CHECKLIST_ITEMS, MORSE_CODE_MAP } from '../constants';
import { 
  Compass, Lightbulb, ClipboardCheck, CloudRain, Radio, 
  ChevronLeft, Check, Camera, FileText, 
  MapPin, Shield, Activity, Download, Trash2, 
  Upload, Zap, Anchor, Disc, Play,
  CheckCircle2, Navigation, StopCircle
} from 'lucide-react';
import L from 'leaflet';

// AR Background Image
const IMG_AR_BG = "https://youke3.picui.cn/s1/2026/01/11/69637978a4060.jpg";

const TabDiscover: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<DiscoveryFeature>(DiscoveryFeature.NONE);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Helper to show toast
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Toast Component Overlay
  const ToastOverlay = () => (
      toastMsg ? (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] animate-fade-in">
            <div className="bg-black/80 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/10">
                <CheckCircle2 className="text-emerald-500" size={24} />
                <span className="font-bold text-sm">{toastMsg}</span>
            </div>
        </div>
      ) : null
  );

  if (activeFeature !== DiscoveryFeature.NONE) {
    return (
        <div className="h-full bg-slate-50 flex flex-col pt-10 pb-20 relative z-50">
            {/* Render Toast if active inside sub-feature */}
            <ToastOverlay />

            <div className="px-4 py-3 flex items-center border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <button onClick={() => setActiveFeature(DiscoveryFeature.NONE)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-slate-600" />
                </button>
                <span className="font-bold text-lg ml-2 text-slate-800 tracking-tight">
                    {activeFeature === DiscoveryFeature.AR_FINDER && "AR 寻机定位"}
                    {activeFeature === DiscoveryFeature.LIGHT_EMITTER && "灯语通讯"}
                    {activeFeature === DiscoveryFeature.CHECKLIST && "飞行前检查单"}
                    {activeFeature === DiscoveryFeature.SEA_PROPHET && "AI 海况预言家"}
                    {activeFeature === DiscoveryFeature.RESCUE_RADAR && "智能雷达搜寻"}
                    {activeFeature === 'SYSTEM_LOGS' as any && "系统运行日志"}
                    {activeFeature === 'CUSTOM_ROUTE' as any && "自定义航线规划"}
                    {activeFeature === 'SENTRY_MODE' as any && "哨兵安防模式"}
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
                {activeFeature === DiscoveryFeature.AR_FINDER && <ARFinder />}
                {activeFeature === DiscoveryFeature.LIGHT_EMITTER && <LightEmitter />}
                {activeFeature === DiscoveryFeature.CHECKLIST && <Checklist onShowToast={showToast} />}
                {activeFeature === DiscoveryFeature.SEA_PROPHET && <SeaProphet />}
                {activeFeature === DiscoveryFeature.RESCUE_RADAR && <RescueRadar />}
                
                {/* Extensions */}
                {activeFeature === 'SYSTEM_LOGS' as any && <SystemLogs onShowToast={showToast} />}
                {activeFeature === 'CUSTOM_ROUTE' as any && <CustomRoute onShowToast={showToast} />}
                {activeFeature === 'SENTRY_MODE' as any && <SentryMode />}
            </div>
        </div>
    );
  }

  return (
    <div className="h-full px-5 pt-12 pb-24 overflow-y-auto bg-slate-50 relative">
        <ToastOverlay />

        <div className="flex justify-between items-end mb-6">
             <h2 className="text-2xl font-black text-slate-800">发现</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            {/* Core Tools - Uniform Layout */}
            <FeatureCard 
                title="AR 寻机定位" 
                icon={Compass} 
                color="bg-indigo-600" 
                onClick={() => setActiveFeature(DiscoveryFeature.AR_FINDER)} 
                desc="视觉增强定位"
            />
            
            <FeatureCard 
                title="AI 海况预言家" 
                icon={CloudRain} 
                color="bg-sky-500" 
                onClick={() => setActiveFeature(DiscoveryFeature.SEA_PROPHET)} 
                desc="图像识别分析"
            />
            <FeatureCard 
                title="智能雷达" 
                icon={Radio} 
                color="bg-red-500" 
                onClick={() => setActiveFeature(DiscoveryFeature.RESCUE_RADAR)} 
                desc="多维信号扫描"
            />

            <FeatureCard 
                title="自定义航线" 
                icon={MapPin} 
                color="bg-emerald-500" 
                onClick={() => setActiveFeature('CUSTOM_ROUTE' as any)} 
                desc="地图规划飞行"
            />

            <FeatureCard 
                title="哨兵模式" 
                icon={Shield} 
                color="bg-slate-800" 
                onClick={() => setActiveFeature('SENTRY_MODE' as any)} 
                desc="电子围栏安防"
            />

            <FeatureCard 
                title="飞行前检查" 
                icon={ClipboardCheck} 
                color="bg-teal-500" 
                onClick={() => setActiveFeature(DiscoveryFeature.CHECKLIST)} 
                desc="待检查清单"
            />
            <FeatureCard 
                title="灯语通讯" 
                icon={Lightbulb} 
                color="bg-amber-500" 
                onClick={() => setActiveFeature(DiscoveryFeature.LIGHT_EMITTER)} 
                desc="光通讯模块"
            />
            
             <FeatureCard 
                title="系统日志" 
                icon={FileText} 
                color="bg-slate-500" 
                onClick={() => setActiveFeature('SYSTEM_LOGS' as any)} 
                desc="运行数据导出"
            />
        </div>
    </div>
  );
};

// --- Helper Components ---

const FeatureCard: React.FC<{title: string, icon: any, color: string, desc: string, onClick: () => void}> = ({ title, icon: Icon, color, desc, onClick }) => (
    <button 
        onClick={onClick} 
        className="bg-white p-5 rounded-3xl text-left transition-all duration-200 group border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1"
    >
        <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
            <Icon size={22} strokeWidth={2.5} />
        </div>
        <div>
            <h3 className="font-extrabold text-slate-700 text-sm mb-0.5">{title}</h3>
            <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
        </div>
    </button>
);

// --- Feature Implementations ---

const ARFinder = () => (
    <div className="relative h-full bg-black overflow-hidden flex flex-col">
        {/* Background Feed */}
        <div className="absolute inset-0 z-0">
             <img src={IMG_AR_BG} className="w-full h-full object-cover opacity-80" alt="AR Feed" referrerPolicy="no-referrer" />
        </div>
        
        {/* HUD Overlay */}
        <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
            {/* Top HUD */}
            <div className="flex justify-between items-start">
                 <div className="bg-black/40 backdrop-blur-md border border-white/20 p-2 rounded text-green-400 text-xs font-mono shadow-lg">
                     <div>纬度: 22.1452 N</div>
                     <div>经度: 114.2231 E</div>
                     <div>航向: 045° 东北</div>
                 </div>
                 <div className="flex space-x-1">
                     <div className="w-10 h-1 bg-green-500/80"></div>
                     <div className="w-1 h-1 bg-green-500/50"></div>
                     <div className="w-1 h-1 bg-green-500/30"></div>
                 </div>
            </div>

            {/* Center Target */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="relative w-48 h-48">
                    {/* Rotating Corners */}
                    <div className="absolute inset-0 border-2 border-green-500/50 rounded-lg animate-pulse"></div>
                    <div className="absolute -inset-2 border-t-2 border-l-2 border-green-400 w-6 h-6"></div>
                    <div className="absolute -inset-2 border-t-2 border-r-2 border-green-400 w-6 h-6 right-0"></div>
                    <div className="absolute -inset-2 border-b-2 border-l-2 border-green-400 w-6 h-6 bottom-0"></div>
                    <div className="absolute -inset-2 border-b-2 border-r-2 border-green-400 w-6 h-6 right-0 bottom-0"></div>
                    
                    {/* Distance Text */}
                    <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-green-900/80 text-green-400 px-3 py-1 rounded font-mono font-bold text-sm border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                        距离: 50米
                    </div>
                </div>
                <div className="mt-4 text-white text-xs font-bold tracking-widest animate-bounce">
                    ▼ 目标锁定
                </div>
            </div>

            {/* Bottom Compass Tape */}
            <div className="w-full h-12 bg-gradient-to-t from-black/80 to-transparent relative overflow-hidden border-t border-white/20">
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10 text-white/70 font-mono text-xs pt-2">
                    <span>西</span>
                    <span>西北</span>
                    <span className="text-green-400 font-bold text-lg -mt-2">北</span>
                    <span>东北</span>
                    <span>东</span>
                </div>
                <div className="absolute bottom-0 left-1/2 w-0.5 h-4 bg-green-500 transform -translate-x-1/2"></div>
            </div>
        </div>
    </div>
);

const LightEmitter = () => {
    const [text, setText] = useState('');
    const [mode, setMode] = useState<'OFF' | 'SOS' | 'STROBE' | 'STEADY'>('OFF');

    const toggleMode = (m: 'SOS' | 'STROBE' | 'STEADY') => {
        setMode(prev => prev === m ? 'OFF' : m);
    };

    return (
        <div className="p-6 space-y-8 bg-slate-900 min-h-full text-white">
            {/* Visualizer */}
            <div className="flex justify-center py-6">
                <div className={`w-48 h-48 rounded-full border-4 transition-all duration-200 flex items-center justify-center relative ${mode !== 'OFF' ? 'border-yellow-500 shadow-[0_0_60px_rgba(234,179,8,0.4)] bg-slate-800' : 'border-slate-700 bg-slate-900'}`}>
                     <Lightbulb size={64} className={`transition-all ${mode !== 'OFF' ? 'text-yellow-400' : 'text-slate-600'}`} />
                     {mode === 'SOS' && <div className="absolute inset-0 bg-yellow-500/10 rounded-full animate-ping"></div>}
                     {mode === 'STROBE' && <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" style={{animationDuration: '0.1s'}}></div>}
                </div>
            </div>
            
            {/* Tactical Controls */}
            <div className="grid grid-cols-3 gap-4">
                <button onClick={() => toggleMode('SOS')} className={`p-4 rounded-xl font-bold font-mono transition-all ${mode === 'SOS' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    SOS
                </button>
                <button onClick={() => toggleMode('STROBE')} className={`p-4 rounded-xl font-bold font-mono transition-all ${mode === 'STROBE' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    爆闪
                </button>
                <button onClick={() => toggleMode('STEADY')} className={`p-4 rounded-xl font-bold font-mono transition-all ${mode === 'STEADY' ? 'bg-white text-black shadow-lg' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    常亮
                </button>
            </div>

            {/* Morse Code Input */}
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
                <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">光语翻译输入 (A-Z)</label>
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        value={text}
                        onChange={(e) => setText(e.target.value.toUpperCase())}
                        placeholder="输入发送内容..."
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-xl p-3 text-white font-mono outline-none focus:border-yellow-500 transition-colors uppercase"
                    />
                    <button className="bg-yellow-500 text-black px-4 rounded-xl font-bold">
                        <Zap size={20} />
                    </button>
                </div>
                <div className="mt-4 min-h-[3rem] bg-black/30 rounded-lg p-3 font-mono text-yellow-500 tracking-widest break-all">
                    {text.split('').map(char => MORSE_CODE_MAP[char] ? `${MORSE_CODE_MAP[char]} ` : '').join('') || '... --- ...'}
                </div>
            </div>
        </div>
    );
};

interface ChecklistProps {
    onShowToast: (msg: string) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ onShowToast }) => {
    const [checked, setChecked] = useState<boolean[]>(new Array(CHECKLIST_ITEMS.length).fill(false));
    const allChecked = checked.every(Boolean);

    const toggle = (idx: number) => {
        const newChecked = [...checked];
        newChecked[idx] = !newChecked[idx];
        setChecked(newChecked);
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleConfirm = () => {
        onShowToast("检查通过，系统准许起飞！");
    };

    return (
        <div className="p-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                 <h3 className="text-xl font-black text-slate-800">待检查清单</h3>
                 <p className="text-xs text-slate-400 mt-1">AeroMarinX 飞行作业协议</p>
                 <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-teal-500 transition-all duration-500" 
                        style={{ width: `${(checked.filter(Boolean).length / checked.length) * 100}%` }}
                     ></div>
                 </div>
            </div>

            <div className="space-y-3">
                {CHECKLIST_ITEMS.map((item, idx) => (
                    <button 
                        key={idx}
                        onClick={() => toggle(idx)}
                        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-200 border ${checked[idx] ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white border-slate-100 text-slate-600'}`}
                    >
                        <span className="font-bold text-sm">{idx + 1}. {item}</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${checked[idx] ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            <Check size={14} />
                        </div>
                    </button>
                ))}
            </div>
            
            <button 
                onClick={handleConfirm}
                disabled={!allChecked}
                className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all transform ${allChecked ? 'bg-slate-900 text-white translate-y-0' : 'bg-slate-200 text-slate-400 translate-y-4 opacity-50'}`}
            >
                确认起飞
            </button>
        </div>
    );
};

const SeaProphet = () => {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImage(ev.target?.result as string);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setResult({
                score: Math.floor(Math.random() * (100 - 60) + 60),
                wind: (Math.random() * 10).toFixed(1),
                wave: (Math.random() * 2).toFixed(1),
                visibility: '良',
                conclusion: Math.random() > 0.5 ? '适合降落' : '建议观望'
            });
        }, 2500);
    };

    return (
        <div className="p-5 space-y-6">
             {/* Upload Area */}
             <div 
                onClick={() => fileInputRef.current?.click()}
                className={`h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden relative cursor-pointer transition-all ${image ? 'border-sky-500' : 'border-slate-300 bg-slate-50'}`}
            >
                {image ? (
                    <>
                        <img src={image} alt="Uploaded" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-sky-900/30 flex items-center justify-center">
                                <div className="absolute top-0 w-full h-1 bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,1)] animate-wave"></div>
                                <div className="text-white font-bold animate-pulse">AI 正在分析像素...</div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-slate-400">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Upload size={24} className="text-sky-500" />
                        </div>
                        <span className="text-sm font-bold text-slate-600">点击上传海况照片</span>
                        <p className="text-[10px] mt-1">支持 JPG / PNG</p>
                    </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            {/* Action Button */}
            {image && !result && !isAnalyzing && (
                <button onClick={handleAnalyze} className="w-full bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all">
                    开始 AI 分析
                </button>
            )}

            {/* Result Card */}
            {result && (
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-sky-100 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800">分析报告</h3>
                            <p className="text-xs text-slate-400">{new Date().toLocaleTimeString()}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-white font-bold text-sm ${result.score > 80 ? 'bg-green-500' : 'bg-orange-500'}`}>
                            {result.conclusion}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <div className="text-[10px] text-slate-400 mb-1">预估风速</div>
                            <div className="font-bold text-slate-800">{result.wind} m/s</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <div className="text-[10px] text-slate-400 mb-1">浪高</div>
                            <div className="font-bold text-slate-800">{result.wave} m</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <div className="text-[10px] text-slate-400 mb-1">置信度</div>
                            <div className="font-bold text-sky-600">{result.score}%</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const RescueRadar = () => {
    const [foundTargets, setFoundTargets] = useState<number>(0);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setFoundTargets(prev => prev + 1);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="p-5 h-full flex flex-col">
            <div className="relative aspect-square bg-slate-900 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center mx-auto w-full max-w-[350px]">
                {/* Grid */}
                <div className="absolute inset-0 rounded-full border border-green-500/20" style={{transform: 'scale(0.25)'}}></div>
                <div className="absolute inset-0 rounded-full border border-green-500/20" style={{transform: 'scale(0.5)'}}></div>
                <div className="absolute inset-0 rounded-full border border-green-500/20" style={{transform: 'scale(0.75)'}}></div>
                <div className="absolute inset-0 w-full h-[1px] bg-green-500/20 top-1/2"></div>
                <div className="absolute inset-0 h-full w-[1px] bg-green-500/20 left-1/2"></div>

                {/* Sweep */}
                <div className="absolute w-[50%] h-[50%] bg-gradient-to-br from-transparent via-green-500/30 to-green-500/80 top-0 right-0 origin-bottom-left animate-spin-slow rounded-tr-full" style={{filter: 'blur(2px)'}}></div>

                {/* Targets */}
                {foundTargets > 0 && (
                     <div className="absolute top-[30%] right-[30%] w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)] animate-ping"></div>
                )}
                 {foundTargets > 0 && (
                     <div className="absolute top-[30%] right-[30%] w-2 h-2 bg-red-500 rounded-full"></div>
                )}
            </div>

            <div className="mt-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1">
                <div className="flex items-center space-x-2 mb-4">
                    <Activity className="text-red-500 animate-pulse" size={20} />
                    <h3 className="font-bold text-slate-800">实时探测数据</h3>
                </div>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs text-slate-500">信号源</span>
                        <span className="text-sm font-mono font-bold text-slate-800">{foundTargets > 0 ? '已发现目标 (1)' : '正在扫描区域...'}</span>
                    </div>
                     <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs text-slate-500">方位</span>
                        <span className="text-sm font-mono font-bold text-slate-800">{foundTargets > 0 ? '东北 45°' : '--'}</span>
                    </div>
                     <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs text-slate-500">距离</span>
                        <span className="text-sm font-mono font-bold text-slate-800">{foundTargets > 0 ? '320 米' : '--'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface SystemLogsProps {
    onShowToast: (msg: string) => void;
}

const SystemLogs: React.FC<SystemLogsProps> = ({ onShowToast }) => {
    const logs = [
        { time: '14:20:05', type: 'INFO', msg: '系统初始化成功' },
        { time: '14:20:08', type: 'INFO', msg: 'GPS 信号锁定 (14 颗卫星)' },
        { time: '14:21:15', type: 'WARN', msg: '检测到阵风: 5.2m/s' },
        { time: '14:22:30', type: 'INFO', msg: '无人机起飞序列启动' },
        { time: '14:22:35', type: 'INFO', msg: '已到达目标高度 50m' },
        { time: '14:25:10', type: 'INFO', msg: '图传链路稳定: 1080p/60fps' },
        { time: '14:28:45', type: 'INFO', msg: '剩余电量 80%' },
    ];

    const handleExport = () => {
        onShowToast("系统日志已成功导出至本地存储");
    };

    return (
        <div className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-700">运行日志</h3>
                 <button onClick={handleExport} className="flex items-center space-x-1 text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg">
                    <Download size={12} />
                    <span>导出 CSV</span>
                 </button>
            </div>
            <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-xs space-y-2 shadow-inner">
                {logs.map((log, i) => (
                    <div key={i} className="flex space-x-2 border-b border-slate-800 pb-1 last:border-0">
                        <span className="text-slate-500">{log.time}</span>
                        <span className={`${log.type === 'WARN' ? 'text-yellow-500' : 'text-green-500'} font-bold`}>[{log.type}]</span>
                        <span className="text-slate-300">{log.msg}</span>
                    </div>
                ))}
                <div className="text-green-500 animate-pulse">_</div>
            </div>
        </div>
    );
};

interface CustomRouteProps {
    onShowToast?: (msg: string) => void;
}

const CustomRoute: React.FC<CustomRouteProps> = ({ onShowToast }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInst = useRef<L.Map | null>(null);
    const routeLayer = useRef<L.Polyline | null>(null);
    const [waypoints, setWaypoints] = useState<L.LatLng[]>([]);
    const [selectedSystem, setSelectedSystem] = useState('DRONE');

    useEffect(() => {
        if (!mapRef.current || mapInst.current) return;

        // Initialize immediately, simpler robust approach
        const map = L.map(mapRef.current, {
            zoomControl: false, 
            attributionControl: false
        }).setView([22.29, 114.16], 14);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd'
        }).addTo(map);
        
        map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            const newPoint = L.latLng(lat, lng);
            
            setWaypoints(prev => {
                const updated = [...prev, newPoint];
                return updated;
            });
            
            L.circleMarker(newPoint, { radius: 6, color: '#3b82f6', fillColor: '#fff', fillOpacity: 1, weight: 3 }).addTo(map);
        });

        mapInst.current = map;

        // Critical fix: Force map size calculation after render to ensure tiles show
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
        
        return () => { 
            if (mapInst.current) {
                mapInst.current.remove(); 
                mapInst.current = null; 
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInst.current) return;
        if (routeLayer.current) routeLayer.current.remove();
        
        if (waypoints.length > 1) {
            routeLayer.current = L.polyline(waypoints, { color: '#3b82f6', weight: 4, dashArray: '10, 10' }).addTo(mapInst.current);
        }
    }, [waypoints]);

    const handleClear = () => {
        if(mapInst.current) {
            mapInst.current.eachLayer((layer: L.Layer) => {
                if (layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
                    layer.remove();
                }
            });
        }
        setWaypoints([]);
    };

    const handleExecute = () => {
        if(waypoints.length < 2) return;
        if(onShowToast) onShowToast(`指令已发送: ${selectedSystem === 'DRONE' ? '无人机' : selectedSystem === 'PLATFORM' ? '母船' : '潜航器'} 开始执行航线`);
    };

    const handleLocateMe = () => {
        if(onShowToast) onShowToast("定位成功: 北纬 22.29° 东经 114.16°");
        mapInst.current?.flyTo([22.29, 114.16], 15);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Map Container Area */}
            <div className="h-[55vh] relative bg-slate-200 w-full overflow-hidden">
                <div ref={mapRef} className="h-full w-full z-0" />
                
                {/* Map Tools Overlay */}
                <div className="absolute top-4 right-4 z-[400] flex flex-col space-y-2">
                    <button onClick={handleLocateMe} className="bg-white p-3 rounded-xl shadow-lg text-blue-600 hover:bg-blue-50 transition-colors">
                        <Navigation size={20} />
                    </button>
                    <button onClick={handleClear} className="bg-white p-3 rounded-xl shadow-lg text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
            
            {/* Control Panel */}
            <div className="flex-1 bg-white p-6 rounded-t-3xl -mt-6 z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] relative">
                {/* Drag Handle Indicator */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>

                <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-800 text-lg">执行系统</h3>
                     <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">{waypoints.length} 个航点</span>
                </div>
                
                <div className="flex space-x-3 mb-6">
                    <button 
                        onClick={() => setSelectedSystem('DRONE')}
                        className={`flex-1 py-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${selectedSystem === 'DRONE' ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'border-slate-100 text-slate-400'}`}
                    >
                        <Zap size={22} className="mb-1.5" />
                        <span className="text-xs font-bold">无人机</span>
                    </button>
                    <button 
                        onClick={() => setSelectedSystem('PLATFORM')}
                        className={`flex-1 py-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${selectedSystem === 'PLATFORM' ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-sm' : 'border-slate-100 text-slate-400'}`}
                    >
                        <Anchor size={22} className="mb-1.5" />
                        <span className="text-xs font-bold">母船</span>
                    </button>
                    <button 
                        onClick={() => setSelectedSystem('SUB')}
                        className={`flex-1 py-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${selectedSystem === 'SUB' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'border-slate-100 text-slate-400'}`}
                    >
                        <Disc size={22} className="mb-1.5" />
                        <span className="text-xs font-bold">潜航器</span>
                    </button>
                </div>
                
                <button 
                    onClick={handleExecute}
                    disabled={waypoints.length < 2}
                    className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.98] ${waypoints.length < 2 ? 'bg-slate-200 text-slate-400 shadow-none' : 'bg-slate-900 text-white shadow-slate-300'}`}
                >
                    {waypoints.length < 2 ? '请在地图绘制航线' : '确认并开始任务'}
                </button>
            </div>
        </div>
    );
};

const SentryMode = () => {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="p-5 h-full flex flex-col">
            <div className="bg-slate-900 rounded-3xl p-6 text-white mb-6 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Shield size={24} className="text-emerald-400" />
                            <h3 className="text-xl font-bold">哨兵安防</h3>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 max-w-[80%]">
                        基于视觉识别与电子围栏的自动巡逻模式。发现异常目标将自动报警并回传影像。
                    </p>
                    <button 
                        onClick={() => setIsActive(!isActive)}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${isActive ? 'bg-red-500 text-white' : 'bg-white text-slate-900'}`}
                    >
                        {isActive ? '撤销布防' : '启动警戒'}
                    </button>
                </div>
                
                {/* Background Radar Effect */}
                <div className="absolute top-1/2 right-[-20px] transform -translate-y-1/2 opacity-10">
                    <Radio size={150} />
                </div>
            </div>

            {/* Status Feed */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">监控日志</h4>
                {isActive ? (
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 mt-1.5 bg-emerald-500 rounded-full"></div>
                            <div>
                                <p className="text-xs font-bold text-slate-700">区域扫描正常</p>
                                <p className="text-[10px] text-slate-400">14:32:05 - 无异常发现</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 mt-1.5 bg-emerald-500 rounded-full"></div>
                            <div>
                                <p className="text-xs font-bold text-slate-700">无人机电量自检</p>
                                <p className="text-[10px] text-slate-400">14:30:00 - 电量 85% 充足</p>
                            </div>
                        </div>
                         {/* Simulation of threat */}
                         <div className="flex items-start space-x-3 animate-pulse">
                            <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full"></div>
                            <div>
                                <p className="text-xs font-bold text-red-500">发现可疑目标</p>
                                <p className="text-[10px] text-red-400">14:35:12 - 距离围栏 10米</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <Shield size={48} className="mb-2 opacity-50" />
                        <span className="text-xs">系统待命中</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabDiscover;