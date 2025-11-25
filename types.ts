export interface Command {
  id: string;
  title: string;
  template: string; // The command with {{placeholders}}
  description: string;
  category: string;
  tags: string[];
  createdAt: number;
}

export type CommandFormData = Omit<Command, 'id' | 'createdAt'>;

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface CopyLog {
  id: string;
  commandId: string;
  template: string;
  title: string;
  filledCommand: string; // The actual command copied with variables replaced
  timestamp: number;
}

// Helper to extract variables from a template string
// e.g. "git commit -m {{message}}" -> ["message"]
export const extractVariables = (template: string): string[] => {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = new Set<string>();
  let match;
  while ((match = regex.exec(template)) !== null) {
    matches.add(match[1].trim());
  }
  return Array.from(matches);
};

export const replaceVariables = (template: string, values: Record<string, string>): string => {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    return values[key.trim()] || `{{${key}}}`;
  });
};