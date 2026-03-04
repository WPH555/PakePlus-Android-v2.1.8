import React from 'react';
import { TabId } from '../types';
import { Plane, Eye, Zap, Compass, User } from 'lucide-react';

interface DockProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const Dock: React.FC<DockProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: TabId.DEVICE, label: '设备', icon: Plane },
    { id: TabId.VIEW, label: '画面', icon: Eye },
    { id: TabId.CHAT, label: '智擎', icon: Zap },
    { id: TabId.DISCOVER, label: '发现', icon: Compass },
    { id: TabId.MINE, label: '我的', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-dock pb-6 pt-3 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center transition-all duration-300 ${
                isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Dock;