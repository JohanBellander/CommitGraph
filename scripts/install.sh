#!/usr/bin/env bash
# Install script for gh-commit-stats
# Usage: curl -fsSL https://raw.githubusercontent.com/JohanBellander/CommitGraph/master/scripts/install.sh | bash

set -e

REPO_URL="https://github.com/JohanBellander/CommitGraph.git"
BRANCH="${COMMITGRAPH_BRANCH:-master}"
INSTALL_DIR="${COMMITGRAPH_INSTALL_DIR:-$HOME/.gh-commit-stats}"

echo "🚀 Installing gh-commit-stats..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✓ Node.js $(node --version) found"

# Clone or update repository
if [ -d "$INSTALL_DIR" ]; then
    echo "📦 Updating existing installation..."
    cd "$INSTALL_DIR"
    git fetch origin
    git checkout "$BRANCH" 2>/dev/null || git checkout master
    git pull origin "$BRANCH" 2>/dev/null || git pull origin master
else
    echo "📦 Cloning repository..."
    git clone -b "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Create symlink to make ghstats command available globally
if [ -w "/usr/local/bin" ]; then
    echo "🔗 Creating global symlink..."
    ln -sf "$INSTALL_DIR/dist/cli.js" /usr/local/bin/ghstats
    chmod +x /usr/local/bin/ghstats
elif [ -w "$HOME/.local/bin" ]; then
    echo "🔗 Creating user-local symlink..."
    mkdir -p "$HOME/.local/bin"
    ln -sf "$INSTALL_DIR/dist/cli.js" "$HOME/.local/bin/ghstats"
    chmod +x "$HOME/.local/bin/ghstats"
    echo "⚠️  Added $HOME/.local/bin to PATH"
    echo "   Add this to your ~/.bashrc or ~/.zshrc:"
    echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
else
    echo "⚠️  Could not create global symlink. You can run the tool with:"
    echo "   node $INSTALL_DIR/dist/cli.js"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Set your GitHub token:"
echo "      export GITHUB_TOKEN=\"your-token-here\""
echo ""
echo "   2. Run the tool:"
if command -v ghstats &> /dev/null; then
    echo "      ghstats --help"
else
    echo "      node $INSTALL_DIR/dist/cli.js --help"
fi
echo ""
echo "📚 For more info, visit: https://github.com/JohanBellander/CommitGraph"
