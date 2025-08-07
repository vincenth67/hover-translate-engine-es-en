

## Advanced Chrome Extension Architecture (Recommended)

For production Chrome extensions, it
'
s recommended to use a background script with an offscreen document to handle the translation engine. This approach provides better performance and follows Chrome extension best practices.

### Architecture Overview

```
Content Script → Background Script → Offscreen Document → Translation Engine
```

### Manifest.json Setup
```json
{
  "manifest_version": 3,
  "name": "Hover Translate - Spanish",
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }],
  "web_accessible_resources": [{
    "resources": [
      "node_modules/hover-translate-engine-es-en/dist/wasm/*"
    ],
    "matches": ["<all_urls>"]
  }],
  "permissions": ["offscreen"]
}
```
