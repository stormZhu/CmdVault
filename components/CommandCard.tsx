import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Edit, Trash2, Check, Terminal } from 'lucide-react';
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

  // Compute final command based on user input
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
          <p className="text-sm text-slate-400 line-clamp-2 h-10">{command.description}</p>
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
      <div className="bg-slate-950 p-4 relative group/code">
        <div className="absolute top-2 right-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        
        <div className="font-mono text-sm text-blue-300 break-all pr-16 min-h-[48px] flex items-center">
          <span className="text-slate-600 mr-2 select-none">$</span>
          {finalCommand.split(/(\{\{.*?\}\})/).map((part, i) => {
            if (part.startsWith('{{') && part.endsWith('}}')) {
               // This logic is for when variables are NOT filled yet in the raw view, 
               // but replaceVariables handles the "visual" substitution. 
               // We actually render the finalCommand in the view, so we don't see {{}} unless it's not replaced.
               // However, replaceVariables keeps {{key}} if not found in map.
               const key = part.slice(2, -2).trim();
               if (!variables[key]) {
                 return <span key={i} className="text-yellow-500 font-bold bg-yellow-500/10 px-1 rounded mx-0.5">{part}</span>
               }
               return <span key={i}>{variables[key]}</span>
            }
             // For the finalCommand string, replaceVariables returns the string with values.
             // We just render the text. 
             // To highlight inserted variables, we would need more complex diffing. 
             // For simplicity, we just render the text.
             return null;
          })}
          {finalCommand}
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