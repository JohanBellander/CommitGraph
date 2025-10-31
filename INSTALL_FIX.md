# Quick Fix for Current Installation

If you've already installed and `ghstats` command is not working, run this in PowerShell:

```powershell
cd $HOME\.gh-commit-stats
npm link
```

Then restart your PowerShell session, or run:
```powershell
refreshenv
```

Alternatively, you can run the tool directly:
```powershell
node $HOME\.gh-commit-stats\dist\cli.js --help
```

Or re-run the install script to get the updated version:
```powershell
irm https://raw.githubusercontent.com/JohanBellander/CommitGraph/master/scripts/install.ps1 | iex
```
