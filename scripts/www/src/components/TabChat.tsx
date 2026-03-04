import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Mic, MicOff } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatRequest } from '../services/aiService';

const PRESET_ACTIONS = [
  { text: "全系统健康自检", sub: "电池 / 传感器 / 气囊" },
  { text: "评估当前海况", sub: "风浪 / 适合降落?" },
  { text: "生成巡逻报告", sub: "今日作业总结" },
  { text: "启动自动返航", sub: "回落母船平台" },
];

const TabChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '您好！我是海空智擎 AI 助手。全天候为您监控海空协同作业状态，请问有什么可以帮您？' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Speech Recognition Ref
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isListening]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'zh-CN';
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(prev => prev + transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }
  }, []);

  const toggleVoiceInput = () => {
      if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
      } else {
          if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
          } else {
              // Fallback simulation for browsers without support
              setIsListening(true);
              setTimeout(() => {
                  setInputValue("查询当前海域的风浪情况");
                  setIsListening(false);
              }, 1500);
          }
      }
  };

  const handleSend = async (textOverride?: string) => {
    const contentToSend = textOverride || inputValue;
    if (!contentToSend.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: contentToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
        const systemMsg: ChatMessage = {
             role: "system",
             content: `You are the AI assistant for the AeroMarinX system (海空智擎). 
             Your name is simply "海空智擎助手" or "AI助手". NEVER mention "MiMo", "Gemini", or "Model".
             
             Formatting Instructions:
             - Use '###' for section headers (e.g. ### 状态报告).
             - Use '**' for bold key data (e.g. **24°C**).
             - Use '- ' for lists.
             - Keep responses concise, professional, and structured.
             - Output raw text with these markdown symbols, do not use HTML.`
        };
        
        const apiMessages = [systemMsg, ...messages, userMsg];
        const aiResponseContent = await sendChatRequest(apiMessages);
        
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponseContent }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: "连接智擎服务失败，请检查网络设置。" }]);
    } finally {
        setIsLoading(false);
    }
  };

  // --- Lightweight Markdown Renderer ---
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
        <div className="space-y-1">
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={idx} className="h-1" />;

                // Parse Bold **text**
                const parseBold = (text: string) => {
                    const parts = text.split(/(\*\*.*?\*\*)/g);
                    return parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    });
                };

                // Heading 3 (###)
                if (trimmed.startsWith('###')) {
                    return (
                        <h3 key={idx} className="text-sm font-bold mt-2 mb-1 block opacity-90">
                            {parseBold(trimmed.replace(/^###\s*/, ''))}
                        </h3>
                    );
                }
                
                // Heading 2 or 1 (## / #) - Treat as Heading 3 for consistency
                if (trimmed.startsWith('#')) {
                    return (
                        <h3 key={idx} className="text-sm font-bold mt-2 mb-1 block opacity-90">
                            {parseBold(trimmed.replace(/^#+\s*/, ''))}
                        </h3>
                    );
                }

                // List Items (- or *)
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return (
                        <div key={idx} className="flex items-start space-x-2 pl-1">
                            <span className="text-[8px] mt-[7px] opacity-60">●</span>
                            <div className="flex-1 leading-relaxed">
                                {parseBold(trimmed.substring(2))}
                            </div>
                        </div>
                    );
                }

                // Numbered Lists (1. )
                if (/^\d+\.\s/.test(trimmed)) {
                    return (
                        <div key={idx} className="flex items-start space-x-2 pl-1">
                             <span className="font-mono text-xs font-bold opacity-60 mt-[2px]">{trimmed.match(/^\d+\./)?.[0]}</span>
                             <div className="flex-1 leading-relaxed">
                                {parseBold(trimmed.replace(/^\d+\.\s/, ''))}
                            </div>
                        </div>
                    );
                }

                // Standard Paragraph
                return (
                    <div key={idx} className="min-h-[1.5em] leading-relaxed break-words">
                        {parseBold(line)}
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="px-6 pt-12 pb-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
         <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <Sparkles size={20} fill="currentColor" className="text-white" />
            </div>
            <div>
                <h2 className="font-extrabold text-slate-800 text-lg leading-tight">智擎助手</h2>
                <div className="flex items-center space-x-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">AI 引擎运行中</span>
                </div>
            </div>
         </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth z-10 pb-32">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-white ${msg.role === 'user' ? 'bg-slate-200' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
                        {msg.role === 'user' ? <User size={16} className="text-slate-600"/> : <Bot size={18} className="text-blue-600"/>}
                    </div>
                    
                    {/* Bubble */}
                    <div className={`px-5 py-3.5 shadow-sm text-sm ${
                        msg.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-blue-500/20' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm'
                    }`}>
                        {renderMessageContent(msg.content)}
                    </div>
                </div>
            </div>
        ))}

        {isLoading && (
            <div className="flex justify-start animate-fade-in">
                 <div className="flex flex-row items-end gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-50 to-white flex items-center justify-center border border-white shadow-sm">
                         <Bot size={18} className="text-blue-600"/>
                    </div>
                    <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex space-x-1.5 items-center">
                        <span className="text-xs text-slate-400 font-medium mr-2">思考中</span>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                 </div>
            </div>
        )}
        
        {/* Voice Listening Overlay in Chat */}
        {isListening && (
            <div className="flex justify-end animate-fade-in">
                 <div className="bg-red-50 text-red-500 px-4 py-3 rounded-2xl rounded-tr-sm border border-red-100 shadow-sm flex items-center space-x-2">
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                     <span className="text-xs font-bold">正在聆听指令...</span>
                     <div className="flex items-center space-x-0.5 h-4">
                         {[1,2,3,4,3,2].map((h, i) => (
                             <div key={i} className="w-0.5 bg-red-400 rounded-full animate-wave" style={{height: `${h*4}px`, animationDelay: `${i*0.1}s`}}></div>
                         ))}
                     </div>
                 </div>
            </div>
        )}

        {/* Preset Actions (Shown at bottom of chat if not loading) */}
        {!isLoading && !isListening && (
            <div className="grid grid-cols-2 gap-3 pt-4 px-2">
                {PRESET_ACTIONS.map((action, idx) => (
                    <button 
                        key={idx}
                        onClick={() => handleSend(action.text)}
                        className="flex flex-col items-start p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group"
                    >
                        <span className="font-bold text-slate-700 text-xs group-hover:text-blue-700 mb-0.5">{action.text}</span>
                        <span className="text-[10px] text-slate-400 pl-1">{action.sub}</span>
                    </button>
                ))}
            </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-[80px] left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-20">
        <div className="flex items-center bg-white rounded-full px-2 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100">
            
            {/* Voice Button */}
            <button 
                onClick={toggleVoiceInput}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 mr-2 ${
                    isListening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110 animate-pulse'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <div className="flex-1">
                <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isListening ? "请说话..." : "输入指令或询问..."}
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 h-10"
                    disabled={isListening}
                />
            </div>
            
            <button 
                onClick={() => handleSend()}
                disabled={isLoading || !inputValue.trim()}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all transform active:scale-95 ${
                    inputValue.trim() 
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-slate-100 text-slate-400'
                }`}
            >
                <Send size={18} className={inputValue.trim() ? "translate-x-0.5 translate-y-0.5" : ""} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default TabChat;