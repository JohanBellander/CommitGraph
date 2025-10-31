import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as dotenv from 'dotenv';
import { Config } from './types';

// Load .env file
dotenv.config();

export function loadConfig(): Config {
  const configPaths = [
    path.join(process.cwd(), '.ghstatsrc.json'),
    path.join(os.homedir(), '.ghstatsrc.json'),
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(configContent) as Config;
      } catch (error) {
        console.warn(`Warning: Could not parse config file ${configPath}`);
      }
    }
  }

  return {};
}

export function getGitHubToken(cliToken?: string): string | null {
  if (cliToken) {
    return cliToken;
  }

  return process.env.GITHUB_TOKEN || null;
}

export function validateConfig(config: Config): void {
  // Validate output format
  if (config.defaultOutput && !['graph', 'json', 'csv', 'summary'].includes(config.defaultOutput)) {
    throw new Error(`Invalid output format: ${config.defaultOutput}`);
  }
}
