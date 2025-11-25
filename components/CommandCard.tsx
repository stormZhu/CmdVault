import React, { useState, useMemo } from 'react';
import { Copy, Edit, Trash2, Check } from 'lucide-react';
import { Command, extractVariables, replaceVariables } from '../types';

interface CommandCardProps {
  command: Command;
  onEdit: (command: Command) => void;
  onDelete: (id: string) => void;
}

export const CommandCard: React.FC<CommandCardProps> = ({ command, onEdit, onDelete }) => {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  
  // Extract placeholders from the template
  const placeholders = useMemo(() => extractVariables(command.template), [command.template]);

  // Compute final command based on user input for clipboard
  const finalCommand = useMemo(() => {
    return replaceVariables(command.template, variables);
  }, [command.template, variables]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-300 flex flex-col shadow-sm group">
      {/* Card Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-800/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-slate-100">{command.title}</h3>
            <span className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              {command.category}
            </span>
          </div>
          <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">{command.description}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(command)} 
            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(command.id)} 
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="bg-slate-950 relative group/code">
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white shadow-lg'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        
        <div className="font-mono text-sm break-all p-4 pt-5 pr-20 min-h-[80px] leading-relaxed">
          <span className="text-slate-500 mr-2 select-none">$</span>
          {command.template.split(/(\{\{.*?\}\})/).map((part, i) => {
            if (part.startsWith('{{') && part.endsWith('}}')) {
               const key = part.slice(2, -2).trim();
               const value = variables[key];
               
               if (value) {
                 return (
                   <span key={i} className="text-green-400 font-semibold border-b border-dotted border-green-400/50">
                     {value}
                   </span>
                 );
               }
               
               return (
                 <span key={i} className="text-amber-400 bg-amber-400/10 px-1 rounded mx-0.5 border border-amber-400/20">
                   {part}
                 </span>
               );
            }
             return <span key={i} className="text-blue-300">{part}</span>;
          })}
        </div>
      </div>

      {/* Variable Inputs */}
      {placeholders.length > 0 && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3 flex-1">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Variables</div>
          {placeholders.map(key => (
            <div key={key} className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-mono w-1/3 truncate text-right" title={key}>
                {key}:
              </label>
              <input
                type="text"
                placeholder={`Value for ${key}`}
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                value={variables[key] || ''}
                onChange={(e) => handleVariableChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer Tags */}
      {command.tags.length > 0 && (
        <div className="px-4 py-3 bg-slate-800/20 border-t border-slate-800/50 flex flex-wrap gap-2 mt-auto">
          {command.tags.map(tag => (
            <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/50">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
