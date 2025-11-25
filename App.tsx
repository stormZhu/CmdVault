import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Terminal, 
  Command as CommandIcon, 
  Menu, 
  Github, 
  Hash,
  Filter,
  Sun,
  Moon
} from 'lucide-react';
import { Command, CommandFormData } from './types';
import { CommandCard } from './components/CommandCard';
import { CommandEditor } from './components/CommandEditor';

// --- MOCK DATA FOR FIRST LOAD ---
const MOCK_COMMANDS: Command[] = [
  {
    id: '1',
    title: 'Git Commit with Message',
    template: 'git commit -m "{{message}}"',
    description: 'Commit staged changes with a descriptive message.',
    category: 'Git',
    tags: ['git', 'version-control'],
    createdAt: Date.now()
  },
  {
    id: '2',
    title: 'Find Large Files',
    template: 'find {{path}} -type f -size +{{size}}',
    description: 'Search for files larger than a specific size in a directory.',
    category: 'System',
    tags: ['linux', 'find', 'storage'],
    createdAt: Date.now()
  },
  {
    id: '3',
    title: 'Docker Run detached',
    template: 'docker run -d --name {{container_name}} -p {{host_port}}:{{container_port}} {{image}}',
    description: 'Run a docker container in the background with port mapping.',
    category: 'Docker',
    tags: ['docker', 'container', 'deploy'],
    createdAt: Date.now()
  }
];

type Theme = 'light' | 'dark';

export default function App() {
  // --- THEME STATE ---
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('cmdvault_theme') as Theme;
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Apply theme class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cmdvault_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- APP STATE ---
  const [commands, setCommands] = useState<Command[]>(() => {
    const saved = localStorage.getItem('cmdvault_commands');
    return saved ? JSON.parse(saved) : MOCK_COMMANDS;
  });
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cmdvault_commands', JSON.stringify(commands));
  }, [commands]);

  // Derived state
  const uniqueCategories = useMemo(() => {
    const cats = new Set(commands.map(c => c.category));
    return Array.from(cats).sort();
  }, [commands]);

  const categories = useMemo(() => {
    return ['All', ...uniqueCategories];
  }, [uniqueCategories]);

  const filteredCommands = useMemo(() => {
    return commands.filter(cmd => {
      const matchesSearch = 
        cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || cmd.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [commands, searchQuery, selectedCategory]);

  // Handlers
  const handleSaveCommand = (data: CommandFormData) => {
    if (editingCommand) {
      setCommands(prev => prev.map(c => c.id === editingCommand.id ? { ...data, id: c.id, createdAt: c.createdAt } : c));
    } else {
      const newCommand: Command = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      };
      setCommands(prev => [newCommand, ...prev]);
    }
  };

  const handleDeleteCommand = (id: string) => {
    setCommands(prev => prev.filter(c => c.id !== id));
  };

  const openNewCommand = () => {
    setEditingCommand(undefined);
    setIsEditorOpen(true);
  };

  const openEditCommand = (cmd: Command) => {
    setEditingCommand(cmd);
    setIsEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-bold text-xl">
          <Terminal size={24} />
          <span>CmdVault</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme} 
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 dark:text-slate-400">
            <Menu />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="hidden md:flex items-center gap-2 text-blue-600 dark:text-blue-500 font-bold text-2xl mb-8">
            <Terminal size={28} />
            <span>CmdVault</span>
          </div>

          <button 
            onClick={openNewCommand}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 mb-6"
          >
            <Plus size={20} />
            New Command
          </button>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Categories</h3>
            <nav className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {cat === 'All' ? <Hash size={16} /> : <CommandIcon size={16} />}
                    <span>{cat}</span>
                  </div>
                  {cat !== 'All' && (
                     <span className="text-xs bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-500 font-medium">
                       {commands.filter(c => c.category === cat).length}
                     </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto flex items-center justify-between">
            <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm px-2">
              <Github size={18} />
              <span>GitHub</span>
            </a>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 transition-colors duration-300">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {selectedCategory === 'All' ? 'All Commands' : selectedCategory}
            </h1>
            <p className="text-slate-500 text-sm">
              {filteredCommands.length} command{filteredCommands.length !== 1 && 's'} found
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search commands, tags, descriptions..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Command Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          {filteredCommands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {filteredCommands.map(cmd => (
                <CommandCard 
                  key={cmd.id} 
                  command={cmd} 
                  onEdit={openEditCommand}
                  onDelete={handleDeleteCommand}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 pb-20">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-800">
                <Filter size={32} className="opacity-50 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No commands found</h3>
              <p className="max-w-xs text-center mt-2 text-slate-500 dark:text-slate-500">
                Try adjusting your search terms or create a new command to get started.
              </p>
              <button 
                onClick={openNewCommand}
                className="mt-6 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium flex items-center gap-2"
              >
                <Plus size={18} />
                Create New Command
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <CommandEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveCommand}
        initialData={editingCommand}
        availableCategories={uniqueCategories}
      />
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}