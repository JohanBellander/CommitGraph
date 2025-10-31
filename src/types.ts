export interface Config {
  defaultDays?: number;
  defaultOutput?: 'graph' | 'json' | 'csv' | 'summary';
  excludeRepos?: string[];
  includeRepos?: string[];
  branch?: string;
  colorScheme?: {
    additions?: string;
    deletions?: string;
    neutral?: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface CommitStats {
  additions: number;
  deletions: number;
  net: number;
  commits: number;
}

export interface DailyStats {
  date: string;
  additions: number;
  deletions: number;
  net: number;
  commits: number;
}

export interface RepositoryStats {
  name: string;
  additions: number;
  deletions: number;
  commits: number;
}

export interface ProcessedStats {
  user: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    total_additions: number;
    total_deletions: number;
    net_change: number;
    active_days: number;
    avg_lines_per_day: number;
  };
  daily_stats: DailyStats[];
  repositories: RepositoryStats[];
}
