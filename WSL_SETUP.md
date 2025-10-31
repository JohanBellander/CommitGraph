# WSL Setup Instructions

## Install Node.js in WSL

You have a few options to install Node.js in WSL:

### Option A: Using nvm (Node Version Manager) - Recommended

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload your shell configuration
source ~/.bashrc

# Install Node.js LTS version
nvm install --lts
nvm use --lts

# Verify installation
node --version
npm --version
```

### Option B: Using NodeSource Repository

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Option C: Using Snap (if available)

```bash
sudo snap install node --classic
node --version
npm --version
```

## After Installing Node.js

1. Navigate to your project:
   ```bash
   cd /mnt/c/Users/Johan.Bellander/Projects/CommitGraph
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run the tool:
   ```bash
   node dist/cli.js --output csv --file stats.csv
   ```

## Alternative: Use Windows PowerShell

If you prefer, you can also run the tool from Windows PowerShell:
- Open PowerShell (not WSL)
- Navigate to the project: `cd C:\Users\Johan.Bellander\Projects\CommitGraph`
- Run: `node dist/cli.js --output csv --file stats.csv`

