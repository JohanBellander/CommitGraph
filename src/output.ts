import * as fs from 'fs';
import { plot as asciichartPlot } from 'asciichart';
import chalk from 'chalk';
import { ProcessedStats } from './types';

export type OutputFormat = 'graph' | 'json' | 'csv' | 'summary';

export function formatOutput(
  stats: ProcessedStats,
  format: OutputFormat,
  outputFile?: string
): string {
  let output: string;

  switch (format) {
    case 'json':
      output = formatJSON(stats);
      break;
    case 'csv':
      output = formatCSV(stats);
      break;
    case 'summary':
      output = formatSummary(stats);
      break;
    case 'graph':
    default:
      output = formatGraph(stats);
      break;
  }

  if (outputFile) {
    fs.writeFileSync(outputFile, output, 'utf-8');
    return chalk.green(`✓ Output written to ${outputFile}`);
  }

  return output;
}

function formatGraph(stats: ProcessedStats): string {
  let output = '';

  // Header
  output += chalk.bold('GitHub Commit Statistics\n');
  output += `User: ${stats.user}\n`;
  output += `Period: ${formatDate(stats.period.start)} to ${formatDate(stats.period.end)}\n\n`;

  // Lines Added/Deleted per Day
  if (stats.daily_stats.length > 0) {
    const additions = stats.daily_stats.map(d => d.additions);
    const deletions = stats.daily_stats.map(d => d.deletions);

    output += 'Lines Added/Deleted per Day:\n';
    const chart = asciichartPlot([additions, deletions], {
      height: 15,
    });
    output += chart;
    output += `   ${chalk.blue('──')} Lines Added\n`;
    output += `   ${chalk.red('──')} Lines Deleted\n\n`;

    // Net Change per Day
    const net = stats.daily_stats.map(d => d.net);
    output += 'Net Change per Day:\n';
    const netChart = asciichartPlot([net], {
      height: 12,
    });
    output += netChart;
    output += '\n';
  }

  // Summary
  output += 'Summary:\n';
  output += `  Total lines added:    ${formatNumber(stats.summary.total_additions)}\n`;
  output += `  Total lines deleted:   ${formatNumber(stats.summary.total_deletions)}\n`;
  output += `  Net change:           ${formatSignedNumber(stats.summary.net_change)}\n`;
  output += `  Active days:          ${stats.summary.active_days}\n`;
  output += `  Avg lines/day:        ${formatNumber(stats.summary.avg_lines_per_day)}\n`;

  return output;
}

function formatJSON(stats: ProcessedStats): string {
  return JSON.stringify(stats, null, 2);
}

function formatCSV(stats: ProcessedStats): string {
  let csv = '';
  
  // Summary Section
  csv += '# Summary\n';
  csv += 'metric,value\n';
  csv += `user,${stats.user}\n`;
  csv += `period_start,${stats.period.start}\n`;
  csv += `period_end,${stats.period.end}\n`;
  csv += `total_additions,${stats.summary.total_additions}\n`;
  csv += `total_deletions,${stats.summary.total_deletions}\n`;
  csv += `net_change,${stats.summary.net_change}\n`;
  csv += `active_days,${stats.summary.active_days}\n`;
  csv += `avg_lines_per_day,${stats.summary.avg_lines_per_day}\n`;
  const totalCommits = stats.repositories.reduce((sum, repo) => sum + repo.commits, 0);
  csv += `total_commits,${totalCommits}\n`;
  csv += `repositories_analyzed,${stats.repositories.length}\n`;
  csv += '\n';
  
  // Daily Statistics Section
  csv += '# Daily Statistics\n';
  csv += 'date,additions,deletions,net_change,commits\n';
  for (const day of stats.daily_stats) {
    csv += `${day.date},${day.additions},${day.deletions},${day.net},${day.commits}\n`;
  }
  csv += '\n';
  
  // Repository Statistics Section
  csv += '# Repository Statistics\n';
  csv += 'repository,additions,deletions,net_change,commits\n';
  for (const repo of stats.repositories) {
    const netChange = repo.additions - repo.deletions;
    csv += `${repo.name},${repo.additions},${repo.deletions},${netChange},${repo.commits}\n`;
  }
  
  return csv;
}

function formatSummary(stats: ProcessedStats): string {
  let output = '';

  output += 'GitHub Commit Statistics\n';
  output += '========================\n';
  output += `User:                ${stats.user}\n`;
  output += `Period:              ${formatLongDate(stats.period.start)} - ${formatLongDate(stats.period.end)}\n`;
  output += `Repositories:        ${stats.repositories.length} analyzed\n\n`;

  output += 'Totals:\n';
  output += `  Lines added:       ${formatNumber(stats.summary.total_additions)}\n`;
  output += `  Lines deleted:      ${formatNumber(stats.summary.total_deletions)}\n`;
  output += `  Net change:        ${formatSignedNumber(stats.summary.net_change)}\n`;
  output += '\n';

  output += 'Activity:\n';
  const periodDays = Math.ceil(
    (new Date(stats.period.end).getTime() - new Date(stats.period.start).getTime()) / 
    (1000 * 60 * 60 * 24)
  ) + 1;
  const activePercentage = periodDays > 0 
    ? Math.round((stats.summary.active_days / periodDays) * 100)
    : 0;
  output += `  Active days:           ${stats.summary.active_days} of ${periodDays} (${activePercentage}%)\n`;
  const totalCommits = stats.repositories.reduce((sum, repo) => sum + repo.commits, 0);
  output += `  Total commits:          ${totalCommits}\n`;
  output += `  Avg lines/day:         ${formatNumber(stats.summary.avg_lines_per_day)}\n`;
  const avgCommitsPerDay = stats.summary.active_days > 0 
    ? Math.round(totalCommits / stats.summary.active_days)
    : 0;
  output += `  Avg commits/day:       ${avgCommitsPerDay}\n`;
  output += '\n';

  // Top 5 Most Active Days
  const topDays = [...stats.daily_stats]
    .filter(d => d.commits > 0)
    .sort((a, b) => b.net - a.net)
    .slice(0, 5);

  if (topDays.length > 0) {
    output += 'Top 5 Most Active Days:\n';
    topDays.forEach((day, index) => {
      output += `  ${index + 1}. ${formatShortDate(day.date)}: ${formatSignedNumber(day.net)} lines (${day.commits} commits)\n`;
    });
    output += '\n';
  }

  // Top 5 Repositories
  const topRepos = stats.repositories.slice(0, 5);
  if (topRepos.length > 0) {
    output += 'Top 5 Repositories:\n';
    topRepos.forEach((repo, index) => {
      const net = repo.additions - repo.deletions;
      output += `  ${index + 1}. ${repo.name}: ${formatSignedNumber(net)} lines (${repo.commits} commits)\n`;
    });
  }

  return output;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatSignedNumber(num: number): string {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${formatNumber(num)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

function formatLongDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}
