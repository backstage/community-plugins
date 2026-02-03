#!/bin/bash
echo "Installing root dependencies..."

yarn install
export VIRTUAL_ENV=$HOME/venv
python3 -m venv $VIRTUAL_ENV
export PATH="$VIRTUAL_ENV/bin:$PATH"
python3 -m pip install mkdocs-techdocs-core

echo ""
echo "╔════════════════════════════════════════════════════════╗ "
echo "║  🚀 Setup Complete! Ready to launch plugins!           ║ "
echo "╠════════════════════════════════════════════════════════╣ "
echo "║                                                        ║ "
echo "║  Open a new terminal and navigate to plugin workspace: ║ "
echo "║                                                        ║ "
echo "║       cd workspaces/<plugin>                           ║ "
echo "║                                                        ║ "
echo "║  Install plugin dependencies:                          ║ "
echo "║                                                        ║ "
echo "║       yarn install                                     ║ "
echo "║                                                        ║ "
echo "║  Start plugin development environment:                 ║ "
echo "║                                                        ║ "
echo "║       yarn start                                       ║ "
echo "║                                                        ║ "
echo "║  Then access plugin at:                                ║ "
echo "║                                                        ║ "
echo "║       http://localhost:3000                            ║ "
echo "║                                                        ║ "
echo "║  You might need to refresh the page once backend       ║ "
echo "║  is ready.                                             ║ "
echo "║                                                        ║ "
echo "║  Happy coding! 🎉                                      ║ "
echo "╚════════════════════════════════════════════════════════╝ "
echo ""
