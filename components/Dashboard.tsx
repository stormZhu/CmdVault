import React, { useMemo } from 'react';
import { CopyLog } from '../types';
import { BarChart3, Terminal, Copy } from 'lucide-react';

interface DashboardProps {
  logs: CopyLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({ logs }) => {
  const stats = useMemo(() => {
    // 1. Top Templates (aggregated by commandId)
    const templateCounts: Record<string, { count: number; title: string; template: string }> = {};
    
    // 2. Top Specific Commands (aggregated by exact filled string)
    const instanceCounts: Record<string, { count: number; text: string; originalTitle: string }> = {};

    logs.forEach(log => {
      // Aggregate Templates
      if (!templateCounts[log.commandId]) {
        templateCounts[log.commandId] = {
          count: 0,
          title: log.title,
          template: log.template
        };
      }
      templateCounts[log.commandId].count += 1;

      // Aggregate Instances
      // Use the filled command string as key
      if (!instanceCounts[log.filledCommand]) {
        instanceCounts[log.filledCommand] = {
          count: 0,
          text: log.filledCommand,
          originalTitle: log.title
        };
      }
      instanceCounts[log.filledCommand].count += 1;
    });

    return {
      topTemplates: Object.values(templateCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10
      topInstances: Object.values(instanceCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10
    };
  }, [logs]);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Copies</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{logs.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400">
            <Copy size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Specific Commands */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Terminal className="text-amber-500" size={20} />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Top Copied Commands</h3>
            <span className="text-xs text-slate-400 ml-auto">(Specific usage)</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            {stats.topInstances.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Command</th>
                    <th className="px-5 py-3 text-right">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.topInstances.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="font-mono text-sm text-slate-800 dark:text-slate-200 break-all">
                          {item.text}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.originalTitle}</div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {item.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic">
                No copy history yet. Start using your commands!
              </div>
            )}
          </div>
        </div>

        {/* Top Templates */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <BarChart3 className="text-purple-500" size={20} />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Most Popular Templates</h3>
            <span className="text-xs text-slate-400 ml-auto">(By Template ID)</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            {stats.topTemplates.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Template</th>
                    <th className="px-5 py-3 text-right">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.topTemplates.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">{item.title}</div>
                        <code className="text-xs text-slate-500 dark:text-slate-500 font-mono break-all line-clamp-2">
                          {item.template}
                        </code>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          {item.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic">
                No history available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};