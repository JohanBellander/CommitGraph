# Setting GitHub Token

## Option 1: Environment Variable (Temporary - Current Session Only)

### In WSL/Linux:
```bash
export GITHUB_TOKEN="your-token-here"
```

### In Windows PowerShell:
```powershell
$env:GITHUB_TOKEN = "your-token-here"
```

### In Windows CMD:
```cmd
set GITHUB_TOKEN=your-token-here
```

**Note:** This only lasts for the current terminal session. When you close the terminal, you'll need to set it again.

---

## Option 2: .env File (Recommended for Development)

Create a `.env` file in the project root directory:

1. Create the file:
   ```bash
   # In WSL
   nano .env
   
   # Or in Windows PowerShell
   notepad .env
   ```

2. Add your token:
   ```
   GITHUB_TOKEN=your-token-here
   ```

3. Save the file. The tool will automatically load it.

**Important:** The `.env` file is in `.gitignore`, so it won't be committed to git.

---

## Option 3: Make it Permanent (Shell Configuration)

### For WSL/Linux (Bash):
Add to your `~/.bashrc` or `~/.bash_profile`:

```bash
# Open the file
nano ~/.bashrc

# Add this line (replace with your actual token)
export GITHUB_TOKEN="your-token-here"

# Save and reload
source ~/.bashrc
```

### For Windows PowerShell:
Add to your PowerShell profile:

```powershell
# Open profile
notepad $PROFILE

# Add this line
$env:GITHUB_TOKEN = "your-token-here"

# Reload PowerShell or run:
. $PROFILE
```

---

## Option 4: Via CLI Flag (Not Recommended - Security Warning)

You can pass the token directly via command line, but you'll get a security warning:

```bash
node dist/cli.js --token your-token-here
```

**Warning:** This is less secure as the token may appear in command history.

---

## Verify Your Token is Set

### In WSL/Linux:
```bash
echo $GITHUB_TOKEN
```

### In Windows PowerShell:
```powershell
$env:GITHUB_TOKEN
```

---

## Getting a GitHub Token

If you don't have a token yet:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "gh-commit-stats")
4. Select scope: **`repo`** (required for private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

---

## Quick Start

After setting your token, test it:

```bash
node dist/cli.js --days 7 --verbose
```

