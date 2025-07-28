# Chrome Extension Template

A standardized template for Chrome extension development.

## Included Packages

- **Jest**: Testing framework for unit tests
- **vince-dev-tools**: Custom Git workflow commands via `vit`

## Quick Start

1. Clone this template
2. Run `npm install`
3. Run `./setup.ps1` to set up PowerShell shortcuts
4. Start developing your extension

## Development

- **Testing**: Run `npm test`
- **Git Workflow**: Use `vit` commands (init, commit, newbranch, etc.)
- **Extension**: Load `src/` folder in Chrome developer mode

## Structure

- `src/pages/popup/`: Popup component files
- `src/background/`: Service worker
- `tests/`: Jest unit tests
- `assets/icons/`: Extension icons 