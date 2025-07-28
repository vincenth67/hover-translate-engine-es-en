// Service worker for Chrome extension
// Currently minimal - add background functionality as needed

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
}); 