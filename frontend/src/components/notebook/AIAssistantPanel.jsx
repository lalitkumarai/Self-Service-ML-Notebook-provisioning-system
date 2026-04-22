import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Wand2, 
  Bug, 
  FileText, 
  Zap,
  Check
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const AIAssistantPanel = ({ isOpen, onClose, activeCellContent, onApplyCode }) => {
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', content: "Hi! I'm your AI coding assistant. I can help you explain, debug, or optimize your code." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(async () => {
      let responseContent = '';
      
      // Simple keyword matching for mock responses
      const lowerText = text.toLowerCase();
      if (lowerText.includes('explain')) {
        responseContent = `Here's an explanation of the code:\n\nThe code appears to be a Python script. Based on the context:\n\`\`\`python\n${activeCellContent || '# No code selected'}\n\`\`\`\nIt seems to be performing data processing.`;
      } else if (lowerText.includes('fix') || lowerText.includes('debug')) {
        responseContent = "I've analyzed the code. Here's a potential fix for the syntax error:\n```python\n# Fixed version\n" + (activeCellContent || 'print("Hello World")') + "\n```";
      } else if (lowerText.includes('doc')) {
        responseContent = "Here's the generated documentation:\n\n\"\"\"\nThis function processes the input data and returns the result.\n\nArgs:\n    data (list): Input data list\n\nReturns:\n    dict: Processed results\n\"\"\"";
      } else if (lowerText.includes('optimize')) {
        responseContent = "Here's an optimized version using list comprehension:\n```python\n# Optimized code\nresults = [x * 2 for x in data if x > 0]\n```";
      } else {
        responseContent = "I can help you with that. Could you provide more details about what you'd like to do with the current cell?";
      }

      // Simulate streaming effect
      const streamId = Date.now().toString() + '-ai';
      setMessages(prev => [...prev, { id: streamId, role: 'assistant', content: '' }]);
      
      const words = responseContent.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Delay between words
        setMessages(prev => prev.map(m => 
          m.id === streamId ? { ...m, content: m.content + (i === 0 ? '' : ' ') + words[i] } : m
        ));
      }
      
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action) => {
    let prompt = '';
    switch (action) {
      case 'explain': prompt = "Explain this code"; break;
      case 'fix': prompt = "Fix errors in this code"; break;
      case 'doc': prompt = "Generate documentation"; break;
      case 'optimize': prompt = "Optimize this code"; break;
      default: return;
    }
    handleSendMessage(prompt);
  };

  // Helper to extract code blocks for "Apply" functionality
  const extractCode = (content) => {
    const match = content.match(/```python\n([\s\S]*?)```/) || content.match(/```\n([\s\S]*?)```/);
    return match ? match[1] : null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 350, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-full border-l border-gray-200 bg-white flex flex-col shadow-xl z-20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              <h2 className="font-semibold text-gray-900">AI Assistant</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start space-x-2 max-w-[90%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse space-x-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  msg.role === 'assistant' ? "bg-primary-100 text-primary-600" : "bg-gray-200 text-gray-600"
                )}>
                  {msg.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className={cn(
                  "p-3 rounded-lg text-sm whitespace-pre-wrap",
                  msg.role === 'assistant' ? "bg-white border border-gray-200 shadow-sm" : "bg-primary-600 text-white"
                )}>
                  {msg.content}
                  {msg.role === 'assistant' && extractCode(msg.content) && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full h-7 text-xs"
                        onClick={() => onApplyCode(extractCode(msg.content))}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Apply to Cell
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center space-x-2">
                 <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-600" />
                 </div>
                 <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-t border-gray-100 grid grid-cols-2 gap-2 bg-white">
            <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => handleQuickAction('explain')}>
                <Wand2 className="h-3 w-3 mr-2 text-purple-500" /> Explain
            </Button>
            <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => handleQuickAction('fix')}>
                <Bug className="h-3 w-3 mr-2 text-red-500" /> Fix Bugs
            </Button>
            <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => handleQuickAction('doc')}>
                <FileText className="h-3 w-3 mr-2 text-blue-500" /> Gen Docs
            </Button>
            <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => handleQuickAction('optimize')}>
                <Zap className="h-3 w-3 mr-2 text-yellow-500" /> Optimize
            </Button>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Ask AI about your code..."
                className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isTyping}
              />
              <Button 
                size="icon" 
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIAssistantPanel;
