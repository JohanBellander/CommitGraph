import { GitHubCommit, DailyStats, RepositoryStats, ProcessedStats, CommitStats } from './types';

export function filterRepositories(
  repos: Array<{ name: string; full_name: string }>,
  includePattern?: string,
  excludePattern?: string
): Array<{ name: string; full_name: string }> {
  let filtered = [...repos];

  if (includePattern) {
    const includeRegex = new RegExp(includePattern.replace(/\*/g, '.*'));
    filtered = filtered.filter(repo => includeRegex.test(repo.name) || includeRegex.test(repo.full_name));
  }

  if (excludePattern) {
    const excludeRegex = new RegExp(excludePattern.replace(/\*/g, '.*'));
    filtered = filtered.filter(repo => 
      !excludeRegex.test(repo.name) && !excludeRegex.test(repo.full_name)
    );
  }

  return filtered;
}

export function aggregateCommits(commits: GitHubCommit[]): CommitStats {
  let additions = 0;
  let deletions = 0;

  for (const commit of commits) {
    if (commit.stats) {
      additions += commit.stats.additions || 0;
      deletions += commit.stats.deletions || 0;
    }
  }

  return {
    additions,
    deletions,
    net: additions - deletions,
    commits: commits.length,
  };
}

export function processStats(
  commitsByRepo: Map<string, GitHubCommit[]>,
  username: string,
  startDate: string,
  endDate: string
): ProcessedStats {
  const dailyStatsMap = new Map<string, DailyStats>();
  const repoStats: RepositoryStats[] = [];
  
  let totalAdditions = 0;
  let totalDeletions = 0;
  let totalCommits = 0;

  // Process each repository
  for (const [repoName, commits] of commitsByRepo.entries()) {
    const repoAdditions: number[] = [];
    const repoDeletions: number[] = [];
    let repoCommits = 0;

    for (const commit of commits) {
      const commitDate = new Date(commit.commit.author.date).toISOString().split('T')[0];
      const additions = commit.stats?.additions || 0;
      const deletions = commit.stats?.deletions || 0;

      // Update daily stats
      if (!dailyStatsMap.has(commitDate)) {
        dailyStatsMap.set(commitDate, {
          date: commitDate,
          additions: 0,
          deletions: 0,
          net: 0,
          commits: 0,
        });
      }

      const dailyStat = dailyStatsMap.get(commitDate)!;
      dailyStat.additions += additions;
      dailyStat.deletions += deletions;
      dailyStat.net = dailyStat.additions - dailyStat.deletions;
      dailyStat.commits += 1;

      repoAdditions.push(additions);
      repoDeletions.push(deletions);
      repoCommits++;
      totalCommits++;
    }

    // Calculate repository totals
    const repoTotalAdditions = repoAdditions.reduce((a, b) => a + b, 0);
    const repoTotalDeletions = repoDeletions.reduce((a, b) => a + b, 0);

    totalAdditions += repoTotalAdditions;
    totalDeletions += repoTotalDeletions;

    repoStats.push({
      name: repoName,
      additions: repoTotalAdditions,
      deletions: repoTotalDeletions,
      commits: repoCommits,
    });
  }

  // Sort daily stats by date
  const dailyStats = Array.from(dailyStatsMap.values()).sort((a, b) => 
    a.date.localeCompare(b.date)
  );

  // Fill in missing dates with zero stats
  const allDates = getAllDatesInRange(startDate, endDate);
  const dailyStatsFilled: DailyStats[] = allDates.map(date => {
    const existing = dailyStatsMap.get(date);
    return existing || {
      date,
      additions: 0,
      deletions: 0,
      net: 0,
      commits: 0,
    };
  });

  const activeDays = dailyStatsFilled.filter(stat => stat.commits > 0).length;
  const avgLinesPerDay = activeDays > 0 
    ? Math.round((totalAdditions + totalDeletions) / activeDays)
    : 0;

  return {
    user: username,
    period: {
      start: startDate,
      end: endDate,
    },
    summary: {
      total_additions: totalAdditions,
      total_deletions: totalDeletions,
      net_change: totalAdditions - totalDeletions,
      active_days: activeDays,
      avg_lines_per_day: avgLinesPerDay,
    },
    daily_stats: dailyStatsFilled,
    repositories: repoStats.sort((a, b) => (b.additions + b.deletions) - (a.additions + a.deletions)),
  };
}

function getAllDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
