import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, AlertTriangle, Crosshair, 
  Navigation, ShieldAlert, ChevronUp, ChevronDown,
  Plane, Disc, Video, Target, Battery
} from 'lucide-react';
import L from 'leaflet';

// Types for View Mode
type MainMode = 'MAP' | 'CAMERA';
type CameraSource = 'AERIAL' | 'UNDERWATER';

// Default Location (Ocean near Hong Kong)
const DEFAULT_LAT = 22.29;
const DEFAULT_LNG = 114.16;

// ⚠️ 图像资源 / Image Resources
const IMG_DRONE = "https://free.picui.cn/free/2026/03/01/69a42a6c038a4.png"; 
const IMG_SUB = "https://free.picui.cn/free/2026/03/04/69a708c7bb8dd.png"; 

const TabView: React.FC = () => {
  // --- UI State ---
  const [mode, setMode] = useState<MainMode>('CAMERA');
  const [cameraSource, setCameraSource] = useState<CameraSource>('AERIAL');
  
  const [showNoFlyZone, setShowNoFlyZone] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [gimbalPitch, setGimbalPitch] = useState(0); 
  
  // --- Telemetry & Location State ---
  const [dronePos, setDronePos] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG]);
  const [platformPos, setPlatformPos] = useState<[number, number]>([DEFAULT_LAT - 0.002, DEFAULT_LNG - 0.002]);
  const [subPos, setSubPos] = useState<[number, number]>([DEFAULT_LAT + 0.001, DEFAULT_LNG + 0.001]);
  
  const [droneHeading, setDroneHeading] = useState(0);
  const [subHeading, setSubHeading] = useState(90);

  const [telemetry, setTelemetry] = useState({
    height: 120.5,
    distance: 450.2,
    hSpeed: 12.4,
    vSpeed: 1.2
  });

  // --- Map Refs ---
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const droneMarkerRef = useRef<L.Marker | null>(null);
  const platformMarkerRef = useRef<L.Marker | null>(null);
  const subMarkerRef = useRef<L.Marker | null>(null);
  const noFlyZoneLayerRef = useRef<L.LayerGroup | null>(null);

  // --- Telemetry Simulation ---
  useEffect(() => {
    const timer = setInterval(() => {
        const time = Date.now() / 1000;
        
        // Simulate Drone Movement (Fast circle)
        setDroneHeading(h => (h + 1) % 360);
        setDronePos([
            DEFAULT_LAT + Math.sin(time * 0.1) * 0.003,
            DEFAULT_LNG + Math.cos(time * 0.1) * 0.003
        ]);

        // Simulate Submarine Movement (Slow oval)
        setSubHeading(h => (h - 0.5) % 360);
        setSubPos([
            DEFAULT_LAT + 0.001 + Math.sin(time * 0.05) * 0.001,
            DEFAULT_LNG + 0.001 + Math.cos(time * 0.05) * 0.002
        ]);

        // Platform drifts very slightly
        setPlatformPos([
             DEFAULT_LAT - 0.002 + Math.sin(time * 0.02) * 0.0001,
             DEFAULT_LNG - 0.002 + Math.cos(time * 0.02) * 0.0001
        ]);

        // Update telemetry text numbers
        setTelemetry(prev => ({
            ...prev,
            height: prev.height + (Math.random() - 0.5),
            hSpeed: Math.max(0, prev.hSpeed + (Math.random() - 0.5)),
        }));

    }, 100);
    return () => clearInterval(timer);
  }, []);

  // --- Map Initialization & Marker Updates ---
  useEffect(() => {
    // Only initialize map if we are in MAP mode
    if (mode !== 'MAP' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false,
            dragging: true,
            scrollWheelZoom: true
        }).setView(dronePos, 15);

        // Dark theme map tiles for better contrast
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
        }).addTo(map);

        // 1. Drone Marker
        const droneIcon = L.divIcon({
            className: 'bg-transparent',
            html: `<div id="marker-drone" class="w-10 h-10 relative flex items-center justify-center transition-transform duration-100 ease-linear">
                    <svg viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2" style="filter: drop-shadow(0 0 10px rgba(59,130,246,0.5));">
                        <path d="M12 2L2 22L12 18L22 22L12 2Z" />
                    </svg>
                   </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        droneMarkerRef.current = L.marker(dronePos, { icon: droneIcon }).addTo(map);

        // 2. Platform Marker
        const platformIcon = L.divIcon({
            className: 'bg-transparent',
            html: `<div class="w-12 h-12 relative flex items-center justify-center">
                    <div class="absolute inset-0 bg-orange-500/20 rounded-full animate-ping"></div>
                    <div class="w-10 h-10 bg-orange-500 rounded-lg border-2 border-white shadow-lg flex items-center justify-center">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="5" r="3" />
                            <line x1="12" y1="22" x2="12" y2="8" />
                            <path d="M5 12H19" />
                            <path d="M5 12L12 22L19 12" />
                         </svg>
                    </div>
                   </div>`,
            iconSize: [48, 48],
            iconAnchor: [24, 24]
        });
        platformMarkerRef.current = L.marker(platformPos, { icon: platformIcon }).addTo(map);

        // 3. Submarine Marker
        const subIcon = L.divIcon({
            className: 'bg-transparent',
            html: `<div id="marker-sub" class="w-10 h-10 relative flex items-center justify-center transition-transform duration-300">
                    <div class="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="4"></circle>
                        </svg>
                    </div>
                   </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        subMarkerRef.current = L.marker(subPos, { icon: subIcon }).addTo(map);

        noFlyZoneLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
    } else {
        // Update positions
        if (droneMarkerRef.current) {
            droneMarkerRef.current.setLatLng(dronePos);
            const el = document.getElementById('marker-drone');
            if (el) el.style.transform = `rotate(${droneHeading}deg)`;
        }
        if (platformMarkerRef.current) platformMarkerRef.current.setLatLng(platformPos);
        if (subMarkerRef.current) {
            subMarkerRef.current.setLatLng(subPos);
             const el = document.getElementById('marker-sub');
            if (el) el.style.transform = `rotate(${subHeading}deg)`;
        }
    }

    // No Fly Zone Logic
    if (noFlyZoneLayerRef.current) {
        noFlyZoneLayerRef.current.clearLayers();
        if (showNoFlyZone) {
            const nfzCenter: [number, number] = [DEFAULT_LAT + 0.004, DEFAULT_LNG + 0.004];
            L.circle(nfzCenter, { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, radius: 300, weight: 2, dashArray: '8, 8' }).addTo(noFlyZoneLayerRef.current);
            const icon = L.divIcon({ className: 'bg-transparent', html: '<div class="text-red-500 font-bold text-xs bg-black/50 px-2 py-1 rounded whitespace-nowrap">🚫 禁飞区</div>' });
            L.marker(nfzCenter, { icon }).addTo(noFlyZoneLayerRef.current);
        }
    }
  }, [mode, dronePos, platformPos, subPos, showNoFlyZone]);

  // Cleanup map on unmount or mode switch
  useEffect(() => {
      return () => {
          if (mode !== 'MAP' && mapInstanceRef.current) {
              mapInstanceRef.current.remove();
              mapInstanceRef.current = null;
          }
      };
  }, [mode]);


  // --- Render Helpers ---

  const renderTopBar = () => (
      <div className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl flex space-x-1 border border-white/10 pointer-events-auto shadow-2xl">
              <button 
                  onClick={() => setMode('MAP')}
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all ${mode === 'MAP' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                  <MapIcon size={18} />
                  <span className="text-sm font-bold">地图</span>
              </button>
              <button 
                  onClick={() => setMode('CAMERA')}
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all ${mode === 'CAMERA' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                  <Video size={18} />
                  <span className="text-sm font-bold">图传</span>
              </button>
          </div>
      </div>
  );

  const renderCameraControls = () => {
      if (mode !== 'CAMERA') return null;
      
      return (
        <div className="absolute top-28 left-4 z-40 flex flex-col space-y-3 pointer-events-auto animate-fade-in">
             {/* Source Toggle */}
             <div className="bg-black/60 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-lg w-32">
                 <button 
                    onClick={() => setCameraSource('AERIAL')}
                    className={`w-full px-4 py-3 flex items-center space-x-3 transition-colors ${cameraSource === 'AERIAL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                 >
                     <Plane size={18} />
                     <span className="text-xs font-bold">无人机</span>
                 </button>
                 <div className="h-px bg-white/10 mx-2"></div>
                 <button 
                    onClick={() => setCameraSource('UNDERWATER')}
                    className={`w-full px-4 py-3 flex items-center space-x-3 transition-colors ${cameraSource === 'UNDERWATER' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                 >
                     <Disc size={18} />
                     <span className="text-xs font-bold">潜航器</span>
                 </button>
             </div>

             {/* Signal Stats */}
             <div className="bg-black/60 backdrop-blur rounded-2xl p-4 border border-white/10 space-y-2 w-32 shadow-lg">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">FPS</span>
                    <span className="font-mono font-bold text-emerald-400">60</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">延迟</span>
                    <span className="font-mono text-white">28ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">码率</span>
                    <span className="font-mono text-white">12Mb</span>
                </div>
             </div>
        </div>
      );
  };

  const renderMainContent = () => {
      if (mode === 'MAP') {
          return (
              <div className="w-full h-full relative bg-slate-900">
                   {/* Map Container */}
                   <div ref={mapContainerRef} className="w-full h-full z-0" />
              </div>
          );
      }

      // CAMERA MODE
      const imgUrl = cameraSource === 'AERIAL' ? IMG_DRONE : IMG_SUB;
      return (
        <div className="w-full h-full relative overflow-hidden bg-black">
            <img 
                key={cameraSource} // Force re-render on source change
                src={imgUrl} 
                className="w-full h-full object-cover opacity-90 animate-micro-shake scale-105" // scale-105 to prevent edges showing during shake
                alt="Live Feed" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x600?text=NO+SIGNAL";
                }}
            />
            
            {/* HUD Overlay - Center Crosshair */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                 <div className="relative opacity-60">
                     <Crosshair size={48} strokeWidth={1} className="text-white" />
                     <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                 </div>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
                <div className="absolute top-28 right-6 flex items-center space-x-2 bg-red-600/30 px-3 py-1.5 rounded-lg backdrop-blur border border-red-500/50 animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-md"></div>
                    <span className="text-xs text-white font-mono font-bold tracking-wider">REC 00:04:12</span>
                </div>
            )}

            {/* Bottom Left HUD Data */}
            {cameraSource === 'UNDERWATER' ? (
                    <div className="absolute bottom-32 left-6 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white min-w-[160px]">
                    <div className="flex items-center space-x-2 mb-3 text-indigo-300 border-b border-white/10 pb-2">
                        <Target size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">潜航遥测</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3">
                        <div>
                            <span className="text-[10px] text-slate-400 block">深度</span>
                            <span className="font-mono text-lg font-bold">45.2m</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 block">水温</span>
                            <span className="font-mono text-lg font-bold">12.4°C</span>
                        </div>
                        <div>
                             <span className="text-[10px] text-slate-400 block">压力</span>
                             <span className="font-mono text-lg font-bold">4.2MPa</span>
                        </div>
                    </div>
                    </div>
            ) : (
                <div className="absolute bottom-32 left-6 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white min-w-[160px]">
                    <div className="flex items-center space-x-2 mb-3 text-blue-300 border-b border-white/10 pb-2">
                        <Navigation size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">飞行遥测</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3">
                        <div>
                            <span className="text-[10px] text-slate-400 block">高度 (H)</span>
                            <span className="font-mono text-lg font-bold">{telemetry.height.toFixed(1)}m</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 block">距离 (D)</span>
                            <span className="font-mono text-lg font-bold">{telemetry.distance.toFixed(0)}m</span>
                        </div>
                        <div>
                             <span className="text-[10px] text-slate-400 block">水平速度</span>
                             <span className="font-mono text-lg font-bold">{telemetry.hSpeed.toFixed(1)}m/s</span>
                        </div>
                        <div>
                             <span className="text-[10px] text-slate-400 block">垂直速度</span>
                             <span className="font-mono text-lg font-bold">{telemetry.vSpeed.toFixed(1)}m/s</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  };

  return (
    <div className="relative h-full w-full bg-slate-900 overflow-hidden text-white select-none font-sans">
        
        {/* TOP: Mode Switcher */}
        {renderTopBar()}

        {/* MAIN CONTENT LAYER */}
        <div className="absolute inset-0 z-0">
             {renderMainContent()}
        </div>

        {/* LEFT: Camera Controls (Only in Camera Mode) */}
        {renderCameraControls()}

        {/* RIGHT CONTROLS (Common) */}
        <div className="absolute right-4 top-28 z-30 flex flex-col items-end space-y-4 pointer-events-auto">
             <div className="bg-black/60 backdrop-blur rounded-full px-4 py-2 border border-white/10 flex items-center space-x-2 shadow-lg">
                 <Battery size={16} className={cameraSource === 'AERIAL' ? "text-green-400" : "text-indigo-400"} />
                 <span className="text-xs font-bold font-mono">82%</span>
             </div>
             
             {/* Show No Fly Zone Button */}
             <button 
                onClick={() => setShowNoFlyZone(!showNoFlyZone)}
                className={`p-3.5 rounded-full transition-all duration-200 border shadow-lg ${showNoFlyZone ? 'bg-red-600 border-red-500 text-white' : 'bg-black/60 border-white/10 text-white hover:bg-white/20'}`}
             >
                <ShieldAlert size={20} />
             </button>

            {/* Record Button */}
            <button 
                onClick={() => setIsRecording(!isRecording)}
                className={`p-1 rounded-full transition-all border-2 shadow-lg ${isRecording ? 'border-red-500/50 bg-red-500/10' : 'border-white bg-transparent'}`}
            >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-600 scale-75 rounded-lg' : 'bg-red-500 scale-90'}`}>
                </div>
            </button>

             {/* Gimbal Control */}
            <div className="flex flex-col items-center bg-black/60 backdrop-blur rounded-full py-3 border border-white/10 w-12 shadow-lg">
                <ChevronUp size={20} className="text-slate-400 mb-3" />
                <div className="h-32 w-1.5 bg-white/20 rounded-full relative">
                     <div 
                        className="absolute w-3 h-3 bg-white rounded-full left-1/2 transform -translate-x-1/2 shadow-md border border-black/10"
                        style={{ top: `${(gimbalPitch + 90) / 110 * 85}%` }}
                     />
                </div>
                <ChevronDown size={20} className="text-slate-400 mt-3" />
            </div>
        </div>

        {/* Dynamic Warning Overlay */}
        {showNoFlyZone && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-5 py-2 rounded-full text-xs font-bold flex items-center shadow-xl animate-pulse z-40 pointer-events-none border border-red-400/50">
                <AlertTriangle size={16} className="mr-2" />
                警告：已显示附近禁飞区
            </div>
        )}

    </div>
  );
};

export default TabView;