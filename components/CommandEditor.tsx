import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Save } from 'lucide-react';
import { Command, CommandFormData } from '../types';
import { generateCommandFromDescription } from '../services/geminiService';

interface CommandEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CommandFormData) => void;
  initialData?: Command;
}

const DEFAULT_FORM: CommandFormData = {
  title: '',
  template: '',
  description: '',
  category: 'General',
  tags: []
};

export const CommandEditor: React.FC<CommandEditorProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<CommandFormData>(DEFAULT_FORM);
  const [tagInput, setTagInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ? { ...initialData } : DEFAULT_FORM);
      setTagInput('');
      setAiPrompt('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateCommandFromDescription(aiPrompt);
      setFormData(generated);
    } catch (err) {
      alert("Failed to generate command. Please check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Command' : 'New Command'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* AI Generation Section */}
          {!initialData && (
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2 text-blue-400 font-medium">
                <Sparkles size={16} />
                <span>AI Auto-Fill</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Describe what you want (e.g., 'Compress video to 720p using ffmpeg')"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                />
                <button
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : 'Generate'}
                </button>
              </div>
            </div>
          )}

          <form id="commandForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
              <input
                required
                type="text"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Git Commit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Template <span className="text-xs text-slate-500">(Use {'{{variable}}'} for placeholders)</span>
              </label>
              <textarea
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                value={formData.template}
                onChange={e => setFormData({ ...formData, template: e.target.value })}
                placeholder="git commit -m &quot;{{message}}&quot;"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="General"
                  list="categories"
                />
                <datalist id="categories">
                  <option value="Git" />
                  <option value="Docker" />
                  <option value="Kubernetes" />
                  <option value="System" />
                  <option value="Network" />
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 p-2 bg-slate-950 border border-slate-700 rounded-lg min-h-[42px]">
                  {formData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-white focus:outline-none text-sm min-w-[60px]"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <textarea
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px]"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe what this command does..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="commandForm"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            Save Command
          </button>
        </div>
      </div>
    </div>
  );
};