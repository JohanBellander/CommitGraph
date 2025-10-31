#!/usr/bin/env node

import { Command } from 'commander';
import { GitHubClient } from './github';
import { loadConfig, getGitHubToken, validateConfig } from './config';
import { filterRepositories, processStats } from './stats';
import { formatOutput, OutputFormat } from './output';
import chalk from 'chalk';

const program = new Command();

program
  .name('ghstats')
  .description('A CLI tool to fetch and visualize GitHub commit statistics')
  .version('1.0.0')
  .option('-t, --token <token>', 'GitHub personal access token (not recommended, use env var)')
  .option('-d, --days <number>', 'Number of days to analyze', '30')
  .option('-s, --since <date>', 'Start date (YYYY-MM-DD)')
  .option('-u, --until <date>', 'End date (YYYY-MM-DD)')
  .option('-o, --output <format>', 'Output format: graph, json, csv, summary', 'graph')
  .option('-f, --file <path>', 'Save output to file instead of stdout')
  .option('-r, --repos <pattern>', 'Filter repositories (regex or glob pattern)')
  .option('-e, --exclude <pattern>', 'Exclude repositories (regex or glob pattern)')
  .option('-b, --branch <name>', 'Filter by branch (default: all branches)')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .parse(process.argv);

interface Options {
  token?: string;
  days?: string;
  since?: string;
  until?: string;
  output?: string;
  file?: string;
  repos?: string;
  exclude?: string;
  branch?: string;
  verbose?: boolean;
}

async function main() {
  const options = program.opts<Options>();

  try {
    // Load configuration
    const config = loadConfig();
    validateConfig(config);

    // Get GitHub token
    const token = getGitHubToken(options.token);
    if (!token) {
      console.error(chalk.red('Error: GitHub authentication failed'));
      console.error('');
      console.error('Authentication options:');
      console.error('  1. Set GITHUB_TOKEN environment variable:');
      console.error('     PowerShell: $env:GITHUB_TOKEN = "your-token-here"');
      console.error('     Bash/WSL:  export GITHUB_TOKEN="your-token-here"');
      console.error('');
      console.error('  2. Use --token flag (less secure):');
      console.error('     ghstats --token your-token-here');
      console.error('');
      console.error('  3. Create a .env file in the project directory:');
      console.error('     GITHUB_TOKEN=your-token-here');
      console.error('');
      console.error('Generate a token at: https://github.com/settings/tokens');
      console.error('Required scope: repo');
      process.exit(1);
    }

    // Initialize GitHub client
    const github = new GitHubClient(token);

    // Validate token
    if (options.verbose) {
      process.stdout.write('Validating GitHub token...');
    }
    const tokenValidation = await github.validateToken();
    if (!tokenValidation.valid) {
      console.error(chalk.red(`\nError: ${tokenValidation.error}`));
      console.error('Please check your GITHUB_TOKEN environment variable');
      process.exit(1);
    }

    const username = tokenValidation.username!;
    if (options.verbose) {
      console.log(`\n✓ Authenticated as ${username}`);
    }

    // Calculate date range
    let startDate: string;
    let endDate: string = new Date().toISOString().split('T')[0];

    if (options.since && options.until) {
      startDate = options.since;
      endDate = options.until;
    } else if (options.since) {
      startDate = options.since;
    } else {
      const days = parseInt(options.days || config.defaultDays?.toString() || '30', 10);
      const start = new Date();
      start.setDate(start.getDate() - days);
      startDate = start.toISOString().split('T')[0];
    }

    if (options.verbose) {
      console.log(`Date range: ${startDate} to ${endDate}`);
    }

    // Fetch repositories
    if (options.verbose) {
      console.log('Fetching repositories...');
    }
    const allRepos = await github.getUserRepositories(options.verbose);

    // Filter repositories
    const includePattern = options.repos || config.includeRepos?.join('|');
    const excludePattern = options.exclude || config.excludeRepos?.join('|');
    const filteredRepos = filterRepositories(allRepos, includePattern, excludePattern);

    if (filteredRepos.length === 0) {
      console.error(chalk.yellow('Warning: No repositories match the filter criteria'));
      process.exit(0);
    }

    if (options.verbose) {
      console.log(`Analyzing ${filteredRepos.length} repositories...`);
    }

    // Fetch commits
    const branch = options.branch || config.branch;
    const commitsByRepo = await github.getAllCommits(
      filteredRepos,
      startDate,
      endDate,
      branch,
      options.verbose
    );

    // Process statistics
    if (options.verbose) {
      console.log('Processing statistics...');
    }
    const stats = processStats(commitsByRepo, username, startDate, endDate);

    // Check if we have any data
    if (stats.summary.total_additions === 0 && stats.summary.total_deletions === 0) {
      console.log(chalk.yellow('No commits found for the specified period'));
      console.log(`User: ${username}`);
      console.log(`Period: ${startDate} to ${endDate}`);
      console.log('\nTry:');
      console.log('  - Expanding the date range with --days or --since/--until');
      console.log('  - Checking if repositories have commits in this period');
      console.log('  - Verifying your GitHub username');
      process.exit(0);
    }

    // Format and output
    const outputFormat = (options.output || config.defaultOutput || 'graph') as OutputFormat;
    const result = formatOutput(stats, outputFormat, options.file);

    if (options.file) {
      console.log(result);
    } else {
      console.log(result);
    }

  } catch (error: any) {
    console.error(chalk.red(`\nError: ${error.message}`));
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nOperation interrupted by user');
  process.exit(130);
});

main();
