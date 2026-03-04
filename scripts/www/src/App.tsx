import React, { useState } from 'react';
import Dock from './components/Dock';
import TabDevice from './components/TabDevice';
import TabView from './components/TabView';
import TabChat from './components/TabChat';
import TabDiscover from './components/TabDiscover';
import TabMine from './components/TabMine';
import { TabId } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>(TabId.DEVICE);

  const renderContent = () => {
    switch (activeTab) {
      case TabId.DEVICE:
        return <TabDevice />;
      case TabId.VIEW:
        return <TabView />;
      case TabId.CHAT:
        return <TabChat />;
      case TabId.DISCOVER:
        return <TabDiscover />;
      case TabId.MINE:
        return <TabMine />;
      default:
        return <TabDevice />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 overflow-hidden font-sans text-slate-800 flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        {renderContent()}
      </div>
      <Dock activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Global CSS Animation Styles */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
        }
         @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 4s linear infinite;
        }
        @keyframes micro-shake {
            0% { transform: translate(0, 0); }
            25% { transform: translate(1px, 1px); }
            50% { transform: translate(-1px, 0); }
            75% { transform: translate(0, -1px); }
            100% { transform: translate(0, 0); }
        }
        .animate-micro-shake {
            animation: micro-shake 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;