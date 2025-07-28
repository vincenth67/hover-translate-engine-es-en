
# Chrome Extension Template Blueprint

## 1. Executive Summary

Create a standardized Chrome extension template called `vince-chrome-extension-template` that provides a foundation for new Chrome extension projects. The template includes a basic "Hello World" popup, development tools setup (Jest testing, vince-dev-tools integration), and PowerShell automation.

### 1.1 Core Objectives

- **Quick Project Setup**: Clone template to start new Chrome extension projects instantly
- **Development Tools Ready**: Pre-configured Jest testing and vince-dev-tools integration
- **Best Practices Structure**: Component-based folder organization for scalability
- **Automation**: PowerShell shortcuts for vit commands

### 1.2 Template Features

- Basic Chrome extension with "Hello World" popup
- Jest testing framework with dummy test
- vince-dev-tools (main branch) pre-installed
- PowerShell setup script for command shortcuts
- Purple placeholder icons in required sizes
- Clean component-based folder structure

## 2. Project Structure

```
vince-chrome-extension-template/
├── package.json                    # NPM config with vince-dev-tools & Jest
├── manifest.json                   # Chrome extension manifest v3
├── .gitignore                      # Standard ignores
├── README.md                       # Basic template usage instructions
├── setup.ps1                       # PowerShell shortcut: vit → npx vit
├── docs/                           # Empty initially (for blueprints, documentation)
├── node_modules/                   # NPM dependencies (auto-generated)
├── assets/
│   └── icons/
│       ├── icon16.png              # 16x16 purple square
│       ├── icon48.png              # 48x48 purple square
│       └── icon128.png             # 128x128 purple square
├── src/
│   ├── pages/
│   │   └── popup/
│   │       ├── popup.html          # "Hello World" popup UI
│   │       ├── popup.css           # Popup styling
│   │       └── popup.js            # Popup logic
│   ├── background/
│   │   └── background.js           # Service worker (minimal)
│   └── main.js                     # Simple function for Jest testing
└── tests/
    └── main.test.js                # Simple Jest test that passes
```

## 3. File Specifications

### 3.1 package.json

```json
{
  "name": "my-chrome-extension",
  "version": "0.0.0",
  "description": "Chrome extension template",
  "main": "src/main.js",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "vince-dev-tools": "github:vincenth67/vince-dev-tools#main"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
```

### 3.2 manifest.json

```json
{
  "manifest_version": 3,
  "name": "My Extension Template",
  "version": "0.0.0",
  "description": "A simple Chrome extension template",
  "icons": {
    "16": "assets/icons/icon16.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  },
  "action": {
    "default_popup": "src/pages/popup/popup.html",
    "default_title": "My Extension"
  },
  "background": {
    "service_worker": "src/background/background.js"
  },
  "permissions": []
}
```

### 3.3 .gitignore

```
node_modules/
.DS_Store
*.log
.env
dist/
build/
```

### 3.4 setup.ps1

```powershell
# PowerShell setup script for vince-chrome-extension-template
Write-Host "Setting up vit command shortcut..." -ForegroundColor Green

# Create alias for vit command
Set-Alias -Name vit -Value "npx vit"

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "You can now use 'vit' command directly" -ForegroundColor Yellow
Write-Host "Example: vit init, vit commit, vit newbranch, etc." -ForegroundColor Yellow
```

### 3.5 README.md

```markdown
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
```

### 3.6 src/main.js

```javascript
// Simple main function for Jest testing
function add(a, b) {
  return a + b;
}

function greet(name) {
  return `Hello, ${name}!`;
}

module.exports = { add, greet };
```

### 3.7 tests/main.test.js

```javascript
const { add, greet } = require('../src/main');

describe('Template Tests', () => {
  test('addition works correctly', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('greeting works correctly', () => {
    expect(greet('World')).toBe('Hello, World!');
  });

  test('dummy test always passes', () => {
    expect(true).toBe(true);
  });
});
```

### 3.8 src/pages/popup/popup.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1>Hello World!</h1>
    <p>This is a Chrome extension template.</p>
    <button id="clickBtn">Click Me</button>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

### 3.9 src/pages/popup/popup.css

```css
body {
  width: 300px;
  height: 200px;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.container {
  padding: 20px;
  text-align: center;
}

h1 {
  color: #663399;
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

button {
  background-color: #663399;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #552288;
}
```

### 3.10 src/pages/popup/popup.js

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('clickBtn');
  
  button.addEventListener('click', function() {
    alert('Hello from Chrome Extension Template!');
  });
});
```

### 3.11 src/background/background.js

```javascript
// Service worker for Chrome extension
// Currently minimal - add background functionality as needed

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});
```

## 4. Icon Specifications

### 4.1 Required Icons

Create three purple square PNG files:

- **assets/icons/icon16.png**: 16x16 pixels, solid purple square
- **assets/icons/icon48.png**: 48x48 pixels, solid purple square  
- **assets/icons/icon128.png**: 128x128 pixels, solid purple square

### 4.2 Icon Creation Instructions

If you cannot generate PNG files:
1. Inform the user that manual icon creation is needed
2. Request three purple square PNG files in the specified sizes
3. Purple color suggestion: #663399
4. Files should be solid color squares with no additional content

## 5. Implementation Notes

### 5.1 Component-Based Structure

- Each UI component (popup) has its own folder with HTML, CSS, and JS
- Background service worker in dedicated folder
- Assets organized by type (icons, images, etc.)
- Tests in dedicated folder following src/ structure

### 5.2 Development Workflow

- Template provides foundation for immediate development
- Jest configured for simple testing
- vince-dev-tools ready for Git workflow automation
- PowerShell shortcuts for Windows development environment

### 5.3 Extension Loading

To test the extension:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `src/` folder
4. Extension will appear in toolbar for testing

### 5.4 Future Expansion

Template structure supports easy addition of:
- Additional pages/components in `src/pages/`
- Content scripts in new `src/content/` folder
- Additional background functionality
- More complex testing scenarios

## 6. Quality Assurance

### 6.1 Testing Requirements

- Jest test should run successfully with `npm test`
- All three dummy tests should pass
- No console errors when running tests

### 6.2 Extension Validation

- Manifest should be valid Chrome extension manifest v3
- Extension should load without errors in Chrome developer mode
- Popup should display "Hello World" message
- Button click should show alert dialog

### 6.3 PowerShell Setup

- setup.ps1 should create `vit` alias successfully
- After running setup, `vit` command should execute `npx vit`
- No PowerShell errors during setup execution

This blueprint provides a complete foundation for rapid Chrome extension development with integrated testing and workflow automation.