# GitHub Commit Statistics CLI Tool

A command-line tool that fetches and visualizes commit statistics (lines of code) from all your GitHub repositories for a specified time period.

## Features

- 📊 Visualize commit statistics with ASCII graphs
- 📈 Track lines added/deleted per day
- 🔍 Filter by repository, date range, and branch
- 💾 Export to JSON, CSV, or summary format
- ⚡ Fast parallel processing of multiple repositories
- 🔐 Secure token management

## Installation

**One-line install:**

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/JohanBellander/CommitGraph/master/scripts/install.ps1 | iex
```

**macOS/Linux/WSL:**
```bash
curl -fsSL https://raw.githubusercontent.com/JohanBellander/CommitGraph/master/scripts/install.sh | bash
```

**Develop branch (latest in-progress features):**
```powershell
# Windows PowerShell
$env:COMMITGRAPH_BRANCH='develop'; irm https://raw.githubusercontent.com/JohanBellander/CommitGraph/master/scripts/install.ps1 | iex
```

```bash
# macOS/Linux/WSL
COMMITGRAPH_BRANCH=develop curl -fsSL https://raw.githubusercontent.com/JohanBellander/CommitGraph/master/scripts/install.sh | bash
```

**Or install from source:**
```bash
git clone https://github.com/JohanBellander/CommitGraph.git
cd CommitGraph
npm install
npm run build
```

**Requirements:** Node.js ≥ 16.0.0

## Setup

1. Generate a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Create a new token with `repo` scope
   - Copy the token

2. Set the token as an environment variable:
   ```bash
   # Windows (PowerShell)
   $env:GITHUB_TOKEN = "your-token-here"

   # Windows (CMD)
   set GITHUB_TOKEN=your-token-here

   # Linux/Mac/WSL
   export GITHUB_TOKEN=your-token-here
   ```

   Or create a `.env` file in the project root:
   ```
   GITHUB_TOKEN=your-token-here
   ```

### WSL Users

If you're using WSL (Windows Subsystem for Linux) and Node.js is not installed:

1. **Install Node.js in WSL:**
   ```bash
   # Using NodeSource repository (recommended)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Or using nvm (Node Version Manager)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   ```

2. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

3. **Navigate to project and install dependencies:**
   ```bash
   cd /mnt/c/Users/Johan.Bellander/Projects/CommitGraph
   npm install
   npm run build
   ```

## Usage

### Basic Usage

```bash
# Last 30 days (default)
ghstats

# Last 7 days
ghstats --days 7

# Specific date range
ghstats --since 2025-01-01 --until 2025-01-31
```

### Output Formats

```bash
# Terminal graph (default)
ghstats --output graph

# JSON format
ghstats --output json --file stats.json

# CSV format
ghstats --output csv --file stats.csv

# Summary format
ghstats --output summary
```

### Filtering Options

```bash
# Filter by repository pattern
ghstats --repos "myproject-*"

# Exclude certain repositories
ghstats --exclude "test-*,archive-*"

# Filter by branch
ghstats --branch main
```

### All Options

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

## Configuration File

Create a `.ghstatsrc.json` file in your home directory or project root:

```json
{
  "defaultDays": 30,
  "defaultOutput": "graph",
  "excludeRepos": ["test-*", "archive-*"],
  "includeRepos": ["*"],
  "branch": "main"
}
```

## Examples

```bash
# Quick summary for last week
ghstats --days 7 --output summary

# Export detailed JSON for analysis
ghstats --since 2025-01-01 --until 2025-01-31 --output json --file january.json

# Analyze only specific projects
ghstats --repos "project-a,project-b" --verbose

# Exclude test repositories
ghstats --exclude "*-test,*test-*" --output graph
```

## Output Examples

### Terminal Graph
```
GitHub Commit Statistics
User: username
Period: 2025-01-01 to 2025-01-31

Lines Added/Deleted per Day:
  800 ┤     ╭─╮              
  600 ┤   ╭─╯ ╰╮    ╭╮       
  ...
```

### Summary
```
GitHub Commit Statistics
========================
User:                username
Period:              Jan 1, 2025 - Jan 31, 2025
Repositories:        42 analyzed

Totals:
  Lines added:       15,432
  Lines deleted:      8,221
  Net change:        +7,211
...
```

## Requirements

- Node.js >= 16.0.0
- GitHub Personal Access Token with `repo` scope

## Error Handling

The tool handles common errors gracefully:

- **Authentication errors**: Clear instructions for setting up the token
- **Rate limiting**: Automatic retry with exponential backoff
- **Empty results**: Helpful suggestions for troubleshooting
- **Network errors**: Clear error messages with retry suggestions

## Performance

- Processes repositories in parallel (10 concurrent requests)
- Caches repository lists
- Progress indicators for long operations
- Typically completes in under 2 minutes for 100+ repositories

## Security

- Never logs or displays the GitHub token
- Warns if token is passed via CLI flag
- Supports secure environment variable storage
- Validates all user input

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## Troubleshooting

### "GitHub authentication failed"
- Make sure `GITHUB_TOKEN` environment variable is set
- Verify the token has the `repo` scope
- Check that the token hasn't expired

### "No commits found"
- Expand the date range with `--days` or `--since/--until`
- Check that your repositories have commits in the specified period
- Verify repository filters aren't too restrictive

### Rate limiting
- The tool automatically handles rate limits and waits before retrying
- For very large numbers of repositories, the process may take longer
- Consider filtering repositories to reduce API calls