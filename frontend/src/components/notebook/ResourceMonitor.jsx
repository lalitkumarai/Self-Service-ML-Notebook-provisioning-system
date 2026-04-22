import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Database, Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

const ResourceMonitor = ({ isConnected }) => {
  const [data, setData] = useState([]);
  const [currentUsage, setCurrentUsage] = useState({ cpu: 0, memory: 0 });

  useEffect(() => {
    if (!isConnected) return;

    // Simulate real-time metrics
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      // Random fluctuations
      const newCpu = Math.max(5, Math.min(95, currentUsage.cpu + (Math.random() - 0.5) * 20));
      const newMem = Math.max(10, Math.min(80, currentUsage.memory + (Math.random() - 0.5) * 5));

      setCurrentUsage({ cpu: newCpu, memory: newMem });

      setData(prev => {
        const newData = [...prev, { time: timeStr, cpu: newCpu, memory: newMem }];
        if (newData.length > 20) newData.shift(); // Keep last 20 points
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected, currentUsage]);

  if (!isConnected) return null;

  return (
    <div className="bg-white border-l border-gray-200 w-64 flex-shrink-0 flex flex-col h-full hidden lg:flex">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-primary-600" />
          System Resources
        </h3>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto">
        {/* CPU Widget */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center text-gray-600">
              <Cpu className="w-4 h-4 mr-2" /> CPU
            </span>
            <span className="font-mono font-medium text-gray-900">{currentUsage.cpu.toFixed(1)}%</span>
          </div>
          <div className="h-16 w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <YAxis domain={[0, 100]} hide />
                <Area 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#4f46e5" 
                  fill="#e0e7ff" 
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Widget */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center text-gray-600">
              <Database className="w-4 h-4 mr-2" /> Memory
            </span>
            <span className="font-mono font-medium text-gray-900">{currentUsage.memory.toFixed(1)}%</span>
          </div>
          <div className="h-16 w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <YAxis domain={[0, 100]} hide />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#10b981" 
                  fill="#d1fae5" 
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
          <p className="font-medium mb-1">Instance Type: Standard</p>
          <p>4 vCPU, 16GB RAM</p>
          <p className="mt-1 opacity-75">Region: us-east-1</p>
        </div>
      </div>
    </div>
  );
};

export default ResourceMonitor;
