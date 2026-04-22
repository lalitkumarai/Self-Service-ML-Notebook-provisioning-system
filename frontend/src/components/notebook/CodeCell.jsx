import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Trash2, MoreVertical, Check, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const LiveTimer = ({ startTime }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(Date.now() - startTime);
        }, 100);
        return () => clearInterval(interval);
    }, [startTime]);

    return <span className="font-mono">{Math.floor(elapsed / 1000)}.{Math.floor((elapsed % 1000) / 100)}s</span>;
};

const CodeCell = ({ 
  cell, 
  isActive, 
  onFocus, 
  onChange, 
  onRun, 
  onDelete 
}) => {
  const statusColor = {
      pending: 'border-gray-300 bg-gray-50/50',
      running: 'border-primary-500 ring-1 ring-primary-500/20',
      completed: 'border-success-500',
      failed: 'border-error-500',
      idle: isActive ? "border-primary-500 shadow-md ring-1 ring-primary-500/20" : "border-gray-200 hover:border-gray-300"
  }[cell.status || 'idle'];

  return (
    <div 
        className={cn(
            "rounded-lg border bg-white transition-all duration-200 shadow-sm overflow-hidden group",
            statusColor
        )}
        onClick={onFocus}
    >
      {/* Cell Toolbar - Visible on hover or active */}
      <div className={cn(
          "flex items-center justify-between px-2 py-1 bg-gray-50 border-b border-gray-100",
          !isActive && "opacity-0 group-hover:opacity-100 transition-opacity"
      )}>
        <span className="text-xs font-mono text-gray-500 px-2">Python</span>
        <div className="flex items-center space-x-1">
             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-error-600" />
             </Button>
        </div>
      </div>

      <div className="flex">
        {/* Gutter / Run Button */}
        <div className="w-12 bg-gray-50 flex flex-col items-center pt-4 border-r border-gray-100 flex-shrink-0">
            <button 
                onClick={(e) => { e.stopPropagation(); onRun(); }}
                className={cn(
                    "p-1.5 rounded-md transition-colors",
                    cell.status === 'running' 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-secondary-500 hover:text-success-600 hover:bg-success-50"
                )}
                disabled={cell.status === 'running'}
            >
                {cell.status === 'running' && (
                    <div className="h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                )}
                {cell.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                {cell.status === 'completed' && <CheckCircle className="h-4 w-4 text-success-500" />}
                {cell.status === 'failed' && <AlertCircle className="h-4 w-4 text-error-500" />}
                {(!cell.status || cell.status === 'idle') && <Play className="h-4 w-4 fill-current" />}
            </button>
            {/* Execution Order / Status */}
            {cell.executionCount && (
                <span className="text-[10px] font-mono text-gray-400 mt-2">[{cell.executionCount}]</span>
            )}
            {/* Timer */}
            {cell.status === 'running' && cell.startTime && (
                <div className="mt-1 text-[10px] text-primary-600">
                    <LiveTimer startTime={cell.startTime} />
                </div>
            )}
            {cell.executionTime !== undefined && cell.status !== 'running' && (
                <span className="text-[10px] font-mono text-gray-400 mt-1">{cell.executionTime}ms</span>
            )}
        </div>

        {/* Editor & Output Area */}
        <div className="flex-1 min-w-0">
            {/* Editor */}
            <div className="py-2">
                <Editor
                    height="auto"
                    minHeight="80px"
                    defaultLanguage="python"
                    value={cell.content}
                    onChange={(value) => onChange(value || '')}
                    options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'off', // We have our own gutter
                        folding: false,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        padding: { top: 8, bottom: 8 },
                        renderLineHighlight: 'none',
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                    }}
                    onMount={(editor, monaco) => {
                        // Auto-resize height based on content
                        const updateHeight = () => {
                            const contentHeight = Math.min(1000, Math.max(80, editor.getContentHeight()));
                            editor.getDomNode().style.height = `${contentHeight}px`;
                            editor.layout();
                        };
                        editor.onDidContentSizeChange(updateHeight);
                        updateHeight();

                        // Keybinding for Shift+Enter to run cell
                        editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                            onRun();
                        });
                    }}
                    className="w-full"
                />
            </div>

            {/* Output */}
            <AnimatePresence>
                {cell.output && cell.output.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-100 bg-gray-50/50 p-4 font-mono text-sm overflow-x-auto"
                    >
                        {cell.output.map((out, idx) => (
                            <div key={idx}>
                                {out.type === 'image' ? (
                                    <img 
                                        src={`data:image/png;base64,${out.content}`} 
                                        alt="Output Plot" 
                                        className="max-w-full h-auto my-2 rounded border border-gray-200" 
                                    />
                                ) : (
                                    <div 
                                        className={cn(
                                            "whitespace-pre-wrap mb-1",
                                            out.type === 'stderr' ? "text-error-600 bg-error-50/50 p-1 rounded" : "text-gray-800"
                                        )}
                                    >
                                        {/* Handle simple carriage return by showing last segment if applicable */}
                                        {/* For a full terminal experience, we'd need xterm.js */}
                                        {/* Here we just split by \r and take the last part if present to simulate updates */}
                                        {out.content.includes('\r') 
                                            ? out.content.split('\r').pop() 
                                            : out.content
                                        }
                                    </div>
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CodeCell;
