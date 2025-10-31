# Quick Start Guide

## One-Line Installation

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/JohanBellander/CommitGraph/master/scripts/install.ps1 | iex
```

**macOS/Linux/WSL:**
```bash
curl -fsSL https://raw.githubusercontent.com/JohanBellander/CommitGraph/master/scripts/install.sh | bash
```

**Requirements:** Node.js ≥ 16.0.0

## Setup GitHub Token

1. Generate a token at: https://github.com/settings/tokens
   - Select scope: **`repo`**
   - Copy the token

2. Set the token:
   ```bash
   # Windows PowerShell
   $env:GITHUB_TOKEN = "your-token-here"
   
   # Linux/Mac/WSL
   export GITHUB_TOKEN="your-token-here"
   ```
   
   Or create a `.env` file:
   ```
   GITHUB_TOKEN=your-token-here
   ```

## Quick Usage

```bash
# Using token as command-line parameter
ghstats --token your-token-here

# Last 30 days (default)
ghstats

# Last 7 days
ghstats --days 7

# Export to CSV
ghstats --output csv --file stats.csv

# Specific date range
ghstats --since 2025-01-01 --until 2025-01-31

# Filter repositories
ghstats --repos "myproject-*" --exclude "test-*"

# Verbose output
ghstats --verbose

# Combined example with token
ghstats --token your-token-here --days 14 --output summary --verbose
```

## Output Formats

- `graph` - ASCII charts (default)
- `json` - JSON format
- `csv` - CSV format with all data
- `summary` - Text summary

## Common Options

```
-d, --days <number>          Number of days to analyze (default: 30)
-s, --since <date>           Start date (YYYY-MM-DD)
-u, --until <date>           End date (YYYY-MM-DD)
-o, --output <format>        Output format: graph, json, csv, summary
-f, --file <path>            Save output to file
-r, --repos <pattern>        Filter repositories (regex/glob)
-e, --exclude <pattern>      Exclude repositories (regex/glob)
-b, --branch <name>          Filter by branch
-v, --verbose                Enable verbose logging
-h, --help                   Show help
```

## Examples

```bash
# Quick summary for last week
ghstats --days 7 --output summary

# Export detailed CSV for analysis
ghstats --since 2025-01-01 --until 2025-01-31 --output csv --file january.csv

# Analyze specific projects only
ghstats --repos "project-a,project-b" --verbose

# Exclude test repositories
ghstats --exclude "*-test,*test-*" --output graph
```

## Troubleshooting

**"GitHub authentication failed"**
- Make sure `GITHUB_TOKEN` is set
- Verify token has `repo` scope
- Check token hasn't expired

**"No commits found"**
- Expand date range with `--days` or `--since/--until`
- Verify repositories have commits in the period
- Check repository filters aren't too restrictive

## More Information

- Full documentation: [README.md](README.md)
- Repository: https://github.com/JohanBellander/CommitGraph
- Issues: https://github.com/JohanBellander/CommitGraph/issues
