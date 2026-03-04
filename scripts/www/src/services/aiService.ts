import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

export const sendChatRequest = async (messages: ChatMessage[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Extract system message if present
    const systemMessage = messages.find(m => m.role === 'system');
    
    // Filter conversation messages (user and assistant) and ensure there is content
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    if (conversationMessages.length === 0) {
      return "请告诉我您想了解什么？";
    }

    // The last message is the new user prompt
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    
    // Previous messages form the history
    const historyMessages = conversationMessages.slice(0, -1);
    
    const history = historyMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: history,
      config: {
        systemInstruction: systemMessage?.content,
      },
    });

    const response = await chat.sendMessage({ message: lastMessage.content });
    
    return response.text || "";
  } catch (error) {
    console.error("Chat Service Error:", error);
    return "抱歉，智擎暂时无法连接网络，请检查网络设置或稍后再试。";
  }
};