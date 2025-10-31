import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { GitHubCommit } from './types';

export class GitHubClient {
  private client: AxiosInstance;
  private rateLimitRemaining: number = 5000;
  private rateLimitReset: number = 0;

  constructor(token: string) {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'gh-commit-stats/1.0.0',
      },
    });

    // Intercept responses to track rate limits
    this.client.interceptors.response.use(
      (response) => {
        const remaining = response.headers['x-ratelimit-remaining'];
        const reset = response.headers['x-ratelimit-reset'];
        if (remaining) this.rateLimitRemaining = parseInt(remaining, 10);
        if (reset) this.rateLimitReset = parseInt(reset, 10);
        return response;
      },
      async (error) => {
        if (error.response?.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
          const resetTime = parseInt(error.response.headers['x-ratelimit-reset'] || '0', 10);
          const waitSeconds = Math.max(60, resetTime - Math.floor(Date.now() / 1000));
          
          console.warn(`\nWarning: GitHub API rate limit reached`);
          console.warn(`Waiting ${waitSeconds} seconds before retry...`);
          
          await this.sleep(waitSeconds * 1000);
          return this.client.request(error.config);
        }
        throw error;
      }
    );
  }

  async validateToken(): Promise<{ valid: boolean; username?: string; error?: string }> {
    try {
      const response = await this.client.get('/user');
      return { valid: true, username: response.data.login };
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { valid: false, error: 'Invalid GitHub token' };
      }
      return { valid: false, error: error.message };
    }
  }

  async getUserRepositories(verbose: boolean = false): Promise<Array<{ name: string; full_name: string; private: boolean }>> {
    const repos: Array<{ name: string; full_name: string; private: boolean }> = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      try {
        const response: AxiosResponse = await this.client.get('/user/repos', {
          params: {
            page,
            per_page: perPage,
            sort: 'updated',
            direction: 'desc',
          },
        });

        if (response.data.length === 0) break;

        repos.push(...response.data.map((repo: any) => ({
          name: repo.name,
          full_name: repo.full_name,
          private: repo.private,
        })));

        if (verbose) {
          process.stdout.write(`\rFetched ${repos.length} repositories...`);
        }

        if (response.data.length < perPage) break;
        page++;
      } catch (error: any) {
        if (error.response?.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please wait and try again.');
        }
        throw error;
      }
    }

    if (verbose) {
      process.stdout.write(`\rFetched ${repos.length} repositories.\n`);
    }

    return repos;
  }

  async getCommitsForRepository(
    owner: string,
    repo: string,
    since: string,
    until: string,
    branch?: string
  ): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      try {
        const params: any = {
          since,
          until,
          page,
          per_page: perPage,
        };

        if (branch) {
          params.sha = branch;
        }

        const response: AxiosResponse = await this.client.get(
          `/repos/${owner}/${repo}/commits`,
          { params }
        );

        if (response.data.length === 0) break;

        // Fetch stats for each commit
        const commitPromises = response.data.map(async (commit: any) => {
          try {
            const commitResponse = await this.client.get(
              `/repos/${owner}/${repo}/commits/${commit.sha}`
            );
            return {
              sha: commit.sha,
              commit: commit.commit,
              stats: commitResponse.data.stats,
            } as GitHubCommit;
          } catch (error) {
            // If we can't get stats, return commit without stats
            return {
              sha: commit.sha,
              commit: commit.commit,
            } as GitHubCommit;
          }
        });

        const commitsWithStats = await Promise.all(commitPromises);
        commits.push(...commitsWithStats);

        if (response.data.length < perPage) break;
        page++;
      } catch (error: any) {
        if (error.response?.status === 409) {
          // Empty repository
          break;
        }
        if (error.response?.status === 403) {
          throw new Error('GitHub API rate limit exceeded');
        }
        // Continue on other errors
        break;
      }
    }

    return commits;
  }

  async getAllCommits(
    repos: Array<{ name: string; full_name: string }>,
    since: string,
    until: string,
    branch?: string,
    verbose: boolean = false
  ): Promise<Map<string, GitHubCommit[]>> {
    const allCommits = new Map<string, GitHubCommit[]>();
    const concurrentLimit = 10;
    let processed = 0;

    // Process repos in batches to respect rate limits
    for (let i = 0; i < repos.length; i += concurrentLimit) {
      const batch = repos.slice(i, i + concurrentLimit);
      
      const batchPromises = batch.map(async (repo) => {
        const [owner, repoName] = repo.full_name.split('/');
        try {
          const commits = await this.getCommitsForRepository(owner, repoName, since, until, branch);
          if (commits.length > 0) {
            allCommits.set(repo.full_name, commits);
          }
          processed++;
          if (verbose) {
            process.stdout.write(`\rProgress: ${processed}/${repos.length} repositories analyzed...`);
          }
        } catch (error: any) {
          processed++;
          if (verbose) {
            process.stdout.write(`\rProgress: ${processed}/${repos.length} repositories analyzed (error: ${repo.full_name})...`);
          }
        }
      });

      await Promise.all(batchPromises);
    }

    if (verbose) {
      process.stdout.write(`\rProgress: ${processed}/${repos.length} repositories analyzed.\n`);
    }

    return allCommits;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRateLimitInfo(): { remaining: number; reset: number } {
    return {
      remaining: this.rateLimitRemaining,
      reset: this.rateLimitReset,
    };
  }
}
