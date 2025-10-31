# GitHub Commit Statistics CLI Tool - Specification

## Overview
A command-line tool that fetches and visualizes commit statistics (lines of code) from all GitHub repositories for a specified time period.

## Technology Stack
- **Language**: TypeScript/JavaScript (Node.js) or Go or Rust (choose based on preference)
- **Package Manager**: npm/yarn (if Node.js) or cargo (if Rust) or go modules (if Go)
- **CLI Framework**: 
  - Node.js: `commander` or `yargs`
  - Go: `cobra` or `urfave/cli`
  - Rust: `clap`
- **HTTP Client**: 
  - Node.js: `axios` or `node-fetch`
  - Go: standard `net/http`
  - Rust: `reqwest`
- **Charting/Visualization**:
  - Node.js: `asciichart` for terminal graphs
  - Go: `termui` or `asciigraph`
  - Rust: `textplots` or `ratatui`

## Core Features

### 1. Authentication
- Read GitHub token from environment variable `GITHUB_TOKEN`
- Support `.env` file for local development
- Option to pass token via CLI flag (with warning about security)
- Validate token on startup

### 2. Data Fetching
- Fetch all user repositories (public and private)
- Get commits for specified date range
- Retrieve detailed commit statistics (additions/deletions)
- Handle pagination for large result sets
- Implement rate limit handling and retries

### 3. Data Processing
- Aggregate lines added/deleted per day
- Calculate net change (additions - deletions)
- Support filtering by:
  - Repository name (include/exclude patterns)
  - Date range (last N days, specific dates)
  - Branch (default: all branches)

### 4. Output Options
- **Terminal graph**: ASCII/Unicode chart in terminal
- **JSON**: Machine-readable format for further processing
- **CSV**: For import into spreadsheet tools
- **Summary statistics**: Text-based summary

### 5. Configuration
- Support config file (`.ghstatsrc.json` or similar)
- Allow overriding config with CLI flags

## Command-Line Interface

### Installation
```bash
npm install -g gh-commit-stats
# or
cargo install gh-commit-stats
# or
go install github.com/user/gh-commit-stats@latest
```

### Basic Usage
```bash
ghstats [options]
```

### Commands & Flags

#### Global Flags
```
-t, --token <token>           GitHub personal access token (not recommended, use env var)
-d, --days <number>          Number of days to analyze (default: 30)
-s, --since <date>           Start date (YYYY-MM-DD)
-u, --until <date>           End date (YYYY-MM-DD)
-o, --output <format>        Output format: graph, json, csv, summary (default: graph)
-f, --file <path>            Save output to file instead of stdout
-r, --repos <pattern>        Filter repositories (regex or glob pattern)
-e, --exclude <pattern>      Exclude repositories (regex or glob pattern)
-b, --branch <name>          Filter by branch (default: all branches)
-v, --verbose                Enable verbose logging
-h, --help                   Show help
--version                    Show version
```

#### Examples
```bash
# Basic usage - last 30 days
ghstats

# Last 7 days
ghstats --days 7

# Specific date range
ghstats --since 2025-10-01 --until 2025-10-31

# Export to JSON
ghstats --output json --file stats.json

# Filter specific repos
ghstats --repos "myproject-*"

# Exclude certain repos
ghstats --exclude "test-*,archive-*"

# Just show summary
ghstats --output summary
```

## Output Formats

### 1. Terminal Graph (Default)
```
GitHub Commit Statistics
User: username
Period: 2025-10-01 to 2025-10-31

Lines Added/Deleted per Day:
  800 ┤     ╭─╮              
  600 ┤   ╭─╯ ╰╮    ╭╮       ── Lines Added
  400 ┤  ╭╯    ╰╮  ╭╯╰╮      ── Lines Deleted
  200 ┤╭─╯      ╰──╯  ╰─╮    
    0 ┼─────────────────────
      Oct 1      Oct 15      Oct 31

Net Change per Day:
  400 ┤     █              
  200 ┤   █ █ █    █       
    0 ┼───────█─────█──────
 -200 ┤      █     █       
      Oct 1      Oct 15      Oct 31

Summary:
  Total lines added:    15,432
  Total lines deleted:   8,221
  Net change:           +7,211
  Active days:               18
  Avg lines/day:            856
```

### 2. JSON Format
```json
{
  "user": "username",
  "period": {
    "start": "2025-10-01",
    "end": "2025-10-31"
  },
  "summary": {
    "total_additions": 15432,
    "total_deletions": 8221,
    "net_change": 7211,
    "active_days": 18,
    "avg_lines_per_day": 856
  },
  "daily_stats": [
    {
      "date": "2025-10-01",
      "additions": 542,
      "deletions": 123,
      "net": 419,
      "commits": 5
    }
  ],
  "repositories": [
    {
      "name": "user/repo1",
      "additions": 3200,
      "deletions": 1100,
      "commits": 15
    }
  ]
}
```

### 3. CSV Format
```csv
date,additions,deletions,net_change,commits
2025-10-01,542,123,419,5
2025-10-02,0,0,0,0
2025-10-03,823,341,482,8
```

### 4. Summary Format
```
GitHub Commit Statistics
========================
User:                username
Period:              Oct 1, 2025 - Oct 31, 2025
Repositories:        42 analyzed

Totals:
  Lines added:       15,432
  Lines deleted:      8,221
  Net change:        +7,211
  
Activity:
  Active days:           18 of 31 (58%)
  Total commits:         124
  Avg lines/day:         856
  Avg commits/day:       7

Top 5 Most Active Days:
  1. Oct 15: +1,245 lines (18 commits)
  2. Oct 08: +1,102 lines (15 commits)
  3. Oct 22: +987 lines (12 commits)
  4. Oct 03: +823 lines (8 commits)
  5. Oct 29: +756 lines (9 commits)

Top 5 Repositories:
  1. user/project-a: +3,200 lines (42 commits)
  2. user/project-b: +2,100 lines (28 commits)
  3. user/website: +1,800 lines (15 commits)
  4. user/tool: +1,200 lines (12 commits)
  5. user/api: +950 lines (8 commits)
```

## Configuration File

Support `.ghstatsrc.json` in home directory or current directory:

```json
{
  "defaultDays": 30,
  "defaultOutput": "graph",
  "excludeRepos": ["test-*", "archive-*"],
  "includeRepos": ["*"],
  "branch": "main",
  "colorScheme": {
    "additions": "green",
    "deletions": "red",
    "neutral": "blue"
  }
}
```

## Error Handling

### Authentication Errors
```
Error: GitHub authentication failed
Please set GITHUB_TOKEN environment variable or use --token flag
Generate a token at: https://github.com/settings/tokens
Required scope: repo
```

### Rate Limit Errors
```
Warning: GitHub API rate limit reached
Waiting 60 seconds before retry...
Progress: 45/100 repositories analyzed
```

### No Data Found
```
No commits found for the specified period
User: username
Period: 2025-10-01 to 2025-10-31

Try:
  - Expanding the date range with --days or --since/--until
  - Checking if repositories have commits in this period
  - Verifying your GitHub username
```

## Performance Considerations

1. **Caching**: Cache repository list and commit data for a short period (5 minutes)
2. **Parallel Requests**: Fetch commit data from multiple repos concurrently (limit: 10 concurrent)
3. **Progressive Output**: Show progress for long-running operations
4. **Interruption Handling**: Support Ctrl+C gracefully, show partial results if available

## Testing Requirements

1. Unit tests for data processing functions
2. Integration tests with mocked GitHub API responses
3. CLI argument parsing tests
4. Error handling tests

## Security Requirements

1. Never log or display the GitHub token
2. Warn users if token is passed via CLI flag
3. Support secure credential storage (system keychain)
4. Validate all user input to prevent injection attacks

## Future Enhancements (Optional)

- Support for GitHub Enterprise
- Compare multiple time periods
- Email/Slack notifications for summary
- Interactive mode with prompts
- Support for organization statistics
- Language breakdown (which programming languages)
- Commit message analysis
- Export to image/PNG format

## Project Structure

```
gh-commit-stats/
├── src/
│   ├── cli.ts/main.rs/main.go     # CLI argument parsing
│   ├── github.ts/github.rs/github.go  # GitHub API client
│   ├── stats.ts/stats.rs/stats.go     # Statistics calculation
│   ├── output.ts/output.rs/output.go  # Output formatting
│   └── config.ts/config.rs/config.go  # Configuration handling
├── tests/
├── package.json / Cargo.toml / go.mod
├── README.md
├── LICENSE
└── .env.example
```

## Implementation Notes

1. Start with basic functionality (fetch commits, display summary)
2. Add graph visualization
3. Add filtering and configuration options
4. Add multiple output formats
5. Polish error messages and user experience

## Success Criteria

- Successfully fetches data from GitHub API
- Displays accurate statistics
- Works with large numbers of repositories (100+)
- Handles errors gracefully
- Easy to install and use
- Good performance (completes in under 2 minutes for typical usage)
- Clear, helpful error messages
