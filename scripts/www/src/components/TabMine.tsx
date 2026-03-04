import React, { useState, useEffect } from 'react';
import { 
  Award, BatteryCharging, Wind, ShieldCheck, 
  FileText, Download, Upload, Map as MapIcon, 
  ChevronRight, AlertCircle, RefreshCw, 
  Zap, Anchor, Disc, HardDrive, Cpu, CreditCard,
  Cloud, Settings, BookOpen, X, Check, Globe, 
  Bell, Moon, Wifi, Smartphone, Lock
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Types for Modals
type ModalType = 'NONE' | 'LOGS' | 'MAPS' | 'MANUALS' | 'FIRMWARE' | 'SETTINGS';

const TabMine: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [healthScore, setHealthScore] = useState(98);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeDevice, setActiveDevice] = useState<'DRONE' | 'PLATFORM' | 'SUB'>('DRONE');
  
  // Interactive States
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncTime, setSyncTime] = useState('10分钟前');

  // Mock Data for Workload Chart
  const WORKLOAD_DATA = [
    { day: 'Mon', hours: 2.5, type: 'UAV' },
    { day: 'Tue', hours: 4.2, type: 'SUB' },
    { day: 'Wed', hours: 1.8, type: 'UAV' },
    { day: 'Thu', hours: 5.5, type: 'MIX' },
    { day: 'Fri', hours: 3.2, type: 'UAV' },
    { day: 'Sat', hours: 6.0, type: 'SUB' },
    { day: 'Sun', hours: 0.0, type: 'NONE' },
  ];

  const startDiagnosis = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate a diagnostic scan process
    const interval = setInterval(() => {
        setScanProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setIsScanning(false);
                setHealthScore(Math.floor(Math.random() * (100 - 95) + 95)); // Random high score
                return 100;
            }
            return prev + 2;
        });
    }, 30);
  };

  const handleCloudSync = () => {
      if(isSyncing) return;
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          setSyncTime('刚刚');
      }, 2000);
  };

  // --- Modal Content Renderers ---

  const renderModalContent = () => {
      switch(activeModal) {
          case 'LOGS':
              return (
                  <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">任务飞行日志</h3>
                      {[
                          { name: 'Mission_20250112_A.csv', size: '2.4 MB', date: '今日 14:20' },
                          { name: 'Mission_20250111_C.csv', size: '1.8 MB', date: '昨日 09:15' },
                          { name: 'System_Dump_Log.txt', size: '45 KB', date: '昨日 08:30' },
                      ].map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                      <FileText size={18} />
                                  </div>
                                  <div>
                                      <div className="font-bold text-sm text-slate-700">{file.name}</div>
                                      <div className="text-[10px] text-slate-400">{file.date} · {file.size}</div>
                                  </div>
                              </div>
                              <button className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                                  <Download size={16} />
                              </button>
                          </div>
                      ))}
                      <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm mt-4">
                          打包导出全部
                      </button>
                  </div>
              );
          case 'MAPS':
              return (
                  <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">离线海图管理</h3>
                      <div className="bg-slate-100 rounded-xl p-4 mb-4">
                           <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                               <span>存储空间</span>
                               <span>2.4GB / 32GB</span>
                           </div>
                           <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                               <div className="bg-emerald-500 h-full w-[15%] rounded-full"></div>
                           </div>
                      </div>
                      <div className="space-y-3">
                          <MapItem name="南海北部海域 - 详细图" size="1.2 GB" active />
                          <MapItem name="维多利亚港 - 高精" size="450 MB" active />
                          <MapItem name="渤海湾区域" size="800 MB" active={false} />
                      </div>
                  </div>
              );
          case 'MANUALS':
              return (
                  <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">操作手册 & 指南</h3>
                      <div className="grid grid-cols-2 gap-3">
                          {['快速入门', '飞行安全规范', '潜航器维护', '母船应急预案', '故障代码表', 'API 开发文档'].map((item, i) => (
                              <button key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-left hover:bg-blue-50 hover:border-blue-100 transition-colors">
                                  <BookOpen size={20} className="text-slate-400 mb-2" />
                                  <div className="font-bold text-slate-700 text-sm">{item}</div>
                                  <div className="text-[10px] text-slate-400">PDF · v2.0</div>
                              </button>
                          ))}
                      </div>
                  </div>
              );
          case 'FIRMWARE':
              return (
                  <div className="text-center py-6">
                       <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Cpu size={32} className="text-slate-700" />
                       </div>
                       <h3 className="text-xl font-black text-slate-800">当前固件 v2.4.0</h3>
                       <p className="text-sm text-slate-400 mb-8">这是最新的稳定版本</p>
                       
                       <div className="space-y-3 text-left max-w-xs mx-auto mb-8">
                           <div className="flex items-center space-x-2 text-xs text-slate-600">
                               <Check size={14} className="text-green-500" />
                               <span>飞控系统: Normal</span>
                           </div>
                           <div className="flex items-center space-x-2 text-xs text-slate-600">
                               <Check size={14} className="text-green-500" />
                               <span>视觉模块: Normal</span>
                           </div>
                           <div className="flex items-center space-x-2 text-xs text-slate-600">
                               <Check size={14} className="text-green-500" />
                               <span>通信链路: Optimal</span>
                           </div>
                       </div>
                       
                       <button className="px-8 py-3 bg-slate-200 text-slate-500 rounded-xl font-bold text-sm cursor-not-allowed">
                           暂无更新
                       </button>
                  </div>
              );
          case 'SETTINGS':
              return (
                  <div className="space-y-2">
                       <h3 className="text-lg font-bold text-slate-800 mb-4">系统设置</h3>
                       <SettingToggle icon={Bell} label="推送通知" active={true} />
                       <SettingToggle icon={Cloud} label="自动云备份" active={true} />
                       <SettingToggle icon={Wifi} label="仅 Wi-Fi 下载" active={false} />
                       <div className="h-px bg-slate-100 my-2"></div>
                       <SettingToggle icon={Moon} label="深色模式" active={false} />
                       <SettingToggle icon={Globe} label="单位 (公制)" active={true} />
                       <div className="h-px bg-slate-100 my-2"></div>
                       <SettingToggle icon={Smartphone} label="后台保持连接" active={true} />
                       <SettingToggle icon={Lock} label="生物识别解锁" active={true} />
                       
                       <div className="pt-4 mt-4">
                           <button className="w-full py-3 border border-red-200 text-red-500 rounded-xl font-bold text-sm bg-red-50">
                               退出登录
                           </button>
                       </div>
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div className="h-full px-5 pt-12 pb-24 overflow-y-auto bg-slate-50 scroll-smooth relative">
        
        {/* 1. 头部：数字化电子执照 (Digital License) */}
        <section className="mb-6 relative group cursor-pointer perspective">
            <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden transition-transform duration-500 transform group-hover:scale-[1.02]">
                {/* Holographic shine effect */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white opacity-10 blur-3xl rounded-full pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-700 border-2 border-slate-600 overflow-hidden shadow-inner relative">
                            <img src="https://picsum.photos/200/200" alt="Pilot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-wide">Captain Wang</h2>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[10px] font-mono bg-blue-600/30 border border-blue-500/50 text-blue-300 px-2 py-0.5 rounded">ID: AMX-8821</span>
                                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">L4 高级操作员</span>
                            </div>
                        </div>
                    </div>
                    <CreditCard className="text-slate-600 opacity-50" size={24} />
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-700/50 pt-4">
                    <div>
                        <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider">安全工时</div>
                        <div className="text-lg font-mono font-bold text-blue-400">482<span className="text-xs text-slate-500 ml-1">h</span></div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider">作业架次</div>
                        <div className="text-lg font-mono font-bold text-white">1,024</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider">资质有效期</div>
                        <div className="text-lg font-mono font-bold text-emerald-400">2026.12</div>
                    </div>
                </div>
            </div>
        </section>

        {/* 2. 智能维保中心 (Interactive Maintenance Center) */}
        <section className="mb-6">
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-slate-800 text-lg">设备健康与维保</h3>
                <button 
                    onClick={startDiagnosis}
                    disabled={isScanning}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isScanning 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-white text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50'
                    }`}
                >
                    <RefreshCw size={12} className={isScanning ? "animate-spin" : ""} />
                    <span>{isScanning ? `诊断中 ${scanProgress}%` : '一键体检'}</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                {/* Device Selector Tabs */}
                <div className="flex bg-slate-50 p-1 rounded-xl mb-6">
                    <button onClick={() => setActiveDevice('DRONE')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeDevice === 'DRONE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>无人机</button>
                    <button onClick={() => setActiveDevice('PLATFORM')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeDevice === 'PLATFORM' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>母船平台</button>
                    <button onClick={() => setActiveDevice('SUB')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeDevice === 'SUB' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>潜航器</button>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-6 px-2">
                    {/* Fixed SVG Circle Alignment with viewBox */}
                    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="none" />
                            <circle 
                                cx="32" cy="32" r="28" 
                                stroke={healthScore > 90 ? "#10b981" : "#f59e0b"} 
                                strokeWidth="6" 
                                fill="none" 
                                strokeDasharray={175} 
                                strokeDashoffset={175 - (scanProgress > 0 ? scanProgress : 100) / 100 * 175} 
                                strokeLinecap="round"
                                className="transition-all duration-300"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                             <ShieldCheck size={24} className={healthScore > 90 ? "text-emerald-500" : "text-amber-500"} />
                        </div>
                    </div>
                    <div className="flex-1 ml-4">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-slate-800 text-lg">
                                {isScanning ? '正在扫描硬件...' : (healthScore > 90 ? '系统运行状态极佳' : '建议关注保养项')}
                            </h4>
                        </div>
                        <p className="text-xs text-slate-400">
                            {isScanning ? '正在检测电机响应与传感器校准...' : `上次检测：${new Date().toLocaleTimeString()} · 一切就绪`}
                        </p>
                    </div>
                </div>

                {/* Detail Items - Changes based on active device */}
                <div className="space-y-3">
                    {activeDevice === 'DRONE' && (
                        <>
                            <MaintenanceItem icon={Zap} label="电机与电调" status="正常" sub="累计运行 42h" health={98} />
                            <MaintenanceItem icon={Wind} label="螺旋桨叶" status="良好" sub="建议 20h 后更换" health={85} />
                            <MaintenanceItem icon={BatteryCharging} label="电池组一致性" status="优秀" sub="压差 0.01V" health={99} />
                        </>
                    )}
                    {activeDevice === 'PLATFORM' && (
                        <>
                            <MaintenanceItem icon={Anchor} label="定点锚泊系统" status="正常" sub="液压与绞盘正常" health={100} />
                            <MaintenanceItem icon={Wind} label="气囊气密性" status="监测中" sub="压力值稳定" health={94} />
                            <MaintenanceItem icon={Cpu} label="六轴增稳云台" status="良好" sub="自动校准完成" health={92} />
                        </>
                    )}
                    {activeDevice === 'SUB' && (
                        <>
                            <MaintenanceItem icon={Disc} label="防水密封圈" status="老化注意" sub="建议润滑保养" health={78} color="text-amber-500" />
                            <MaintenanceItem icon={AlertCircle} label="深度传感器" status="需校准" sub="偏差 > 0.1m" health={60} color="text-amber-500" />
                            <MaintenanceItem icon={HardDrive} label="声呐成像模组" status="正常" sub="自检通过" health={98} />
                        </>
                    )}
                </div>
            </div>
        </section>
        
        {/* 3. 作业负荷分析 (Workload Analytics) */}
        <section className="mb-6">
            <h3 className="font-bold text-slate-800 text-lg mb-4 px-1">作业负荷分析</h3>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 h-64">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">本周总作业时长</p>
                        <p className="text-2xl font-black text-slate-800">23.2 <span className="text-sm font-bold text-slate-400">h</span></p>
                    </div>
                    <div className="text-right">
                         <div className="flex items-center space-x-1 text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded">
                             <TrendingUpIcon size={12} />
                             <span>+12%</span>
                         </div>
                    </div>
                </div>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={WORKLOAD_DATA}>
                            <defs>
                                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fill: '#94a3b8'}} 
                                interval="preserveStartEnd"
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="hours" 
                                stroke="#3b82f6" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorHours)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>

        {/* 4. 数据与资源 (Data Assets) - Interactive */}
        <section className="mb-8">
            <h3 className="font-bold text-slate-800 text-lg mb-4 px-1">资产与工具</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Mission Logs */}
                <ToolCard 
                    icon={FileText} 
                    color="bg-indigo-50 text-indigo-600" 
                    title="任务日志" 
                    desc="最近: 03-12" 
                    action="导出" 
                    onClick={() => setActiveModal('LOGS')}
                />
                {/* Offline Maps */}
                <ToolCard 
                    icon={MapIcon} 
                    color="bg-emerald-50 text-emerald-600" 
                    title="离线海图" 
                    desc="南海北部区域" 
                    action="管理" 
                    onClick={() => setActiveModal('MAPS')}
                />
                {/* Manuals */}
                <ToolCard 
                    icon={BookOpen} 
                    color="bg-amber-50 text-amber-600" 
                    title="操作手册" 
                    desc="v2.0 维护指南" 
                    action="查看" 
                    onClick={() => setActiveModal('MANUALS')}
                />
                 {/* Firmware */}
                 <ToolCard 
                    icon={Cpu} 
                    color="bg-slate-100 text-slate-600" 
                    title="固件版本" 
                    desc="v2.4.0 Stable" 
                    action="更新" 
                    onClick={() => setActiveModal('FIRMWARE')}
                />
            </div>

            {/* Cloud Sync & Settings - Interactive */}
            <div className="space-y-3">
                <button 
                    onClick={handleCloudSync}
                    className="w-full bg-slate-900 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg active:scale-[0.99] transition-transform"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg relative">
                            <Cloud size={20} />
                            {isSyncing && <div className="absolute inset-0 rounded-lg bg-white/20 animate-ping"></div>}
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-sm">{isSyncing ? '正在同步数据...' : '云端数据同步'}</div>
                            <div className="text-[10px] text-slate-400">
                                {isSyncing ? '上传任务飞行记录中' : `上次同步: ${syncTime} · 状态正常`}
                            </div>
                        </div>
                    </div>
                    {isSyncing ? (
                        <RefreshCw size={16} className="animate-spin text-blue-400" />
                    ) : (
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
                    )}
                </button>

                <button 
                    onClick={() => setActiveModal('SETTINGS')}
                    className="w-full bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between shadow-sm active:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                            <Settings size={20} />
                        </div>
                        <div className="font-bold text-slate-700 text-sm">系统设置</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                </button>
            </div>
        </section>

        {/* Footer Info */}
        <div className="text-center pb-6 opacity-30">
            <div className="w-8 h-8 bg-slate-300 rounded-full mx-auto mb-2" />
            <p className="text-[10px] font-mono">AeroMarinX Operation System</p>
            <p className="text-[10px] font-mono">Serial No. AMX-PRO-2025-001</p>
        </div>

        {/* --- MODAL OVERLAY --- */}
        {activeModal !== 'NONE' && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
                <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 shadow-2xl transform transition-transform animate-slide-up relative z-10 max-h-[85vh] overflow-y-auto">
                    <button 
                        onClick={() => setActiveModal('NONE')}
                        className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                    
                    {renderModalContent()}
                </div>
            </div>
        )}

        <style>{`
            @keyframes slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .animate-slide-up {
                animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
        `}</style>
    </div>
  );
};

// --- Sub Components ---

const TrendingUpIcon = ({size}: {size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const ToolCard: React.FC<{
    icon: any, color: string, title: string, desc: string, action: string, onClick: () => void 
}> = ({ icon: Icon, color, title, desc, action, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-left hover:shadow-md transition-all group flex flex-col justify-between h-32"
    >
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <div>
            <div className="font-bold text-slate-800 text-sm">{title}</div>
            <div className="text-[10px] text-slate-400 mb-2">{desc}</div>
        </div>
        <div className="flex items-center space-x-1 text-[10px] font-bold opacity-60 group-hover:opacity-100 transition-opacity">
            <span>{action}</span>
            <ChevronRight size={10} />
        </div>
    </button>
);

const MapItem: React.FC<{name: string, size: string, active: boolean}> = ({name, size, active}) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                <MapIcon size={18} />
            </div>
            <div>
                <div className="font-bold text-sm text-slate-700">{name}</div>
                <div className="text-[10px] text-slate-400">{size}</div>
            </div>
        </div>
        <button className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${active ? 'bg-white text-emerald-600 border-emerald-100 shadow-sm' : 'bg-transparent text-slate-400 border-transparent'}`}>
            {active ? '已下载' : '下载'}
        </button>
    </div>
);

const SettingToggle: React.FC<{icon: any, label: string, active: boolean}> = ({icon: Icon, label, active}) => {
    const [isOn, setIsOn] = useState(active);
    return (
        <div 
            onClick={() => setIsOn(!isOn)}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
        >
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isOn ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon size={18} />
                </div>
                <span className="font-bold text-sm text-slate-700">{label}</span>
            </div>
            <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isOn ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
        </div>
    );
};

const MaintenanceItem: React.FC<{
    icon: any, 
    label: string, 
    status: string, 
    sub: string, 
    health: number,
    color?: string 
}> = ({ icon: Icon, label, status, sub, health, color }) => (
    <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100/50">
        <div className={`p-2 rounded-lg bg-white shadow-sm mr-3 ${color || 'text-slate-600'}`}>
            <Icon size={16} />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <span className={`text-xs font-bold ${health < 80 ? 'text-amber-500' : 'text-emerald-500'}`}>{status}</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${health < 80 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                    style={{width: `${health}%`}}
                ></div>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
                <span>{sub}</span>
                <span>{health}%</span>
            </div>
        </div>
    </div>
);

export default TabMine;