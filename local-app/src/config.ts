import path from 'node:path';

export type AppConfig = {
  appName: string;
  dataDir: string;
  workspaceRoot: string;
  maxHistoryMessages: number;
};

export function loadConfig(): AppConfig {
  const cwd = process.cwd();
  return {
    appName: 'Claude-Like Local Runtime',
    dataDir: path.resolve(cwd, 'local-app/data'),
    workspaceRoot: cwd,
    maxHistoryMessages: 200
  };
}
