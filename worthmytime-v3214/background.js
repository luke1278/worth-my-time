// background.js - Service worker for handling installation and icon state

// Open popup on first install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Worth My Time] Extension installed for the first time');
    
    // Open welcome/setup page
    chrome.tabs.create({
      url: 'welcome.html'
    });
    
    // Set initial icon state
    updateIcon();
  } else if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`[Worth My Time] Extension updated from ${previousVersion} to ${currentVersion}`);
    
    // Update icon state after update
    updateIcon();
  }
});

// Update icon based on enabled/disabled state
async function updateIcon() {
  try {
    const data = await chrome.storage.sync.get(['enabled', 'salary']);
    const isEnabled = data.enabled !== false;
    const hasConfig = data.salary && parseFloat(data.salary) > 0;
    
    // Choose icon based on state
    let iconPath;
    if (isEnabled && hasConfig) {
      // Active: bright green glowing icon
      iconPath = {
        16: 'icons/icon16.png',
        48: 'icons/icon48.png',
        128: 'icons/icon128.png'
      };
      console.log('[Worth My Time] Icon set to ACTIVE (enabled & configured)');
    } else {
      // Inactive: darker green icon
      iconPath = {
        16: 'icons/icon_inactive16.png',
        48: 'icons/icon_inactive48.png',
        128: 'icons/icon_inactive128.png'
      };
      console.log('[Worth My Time] Icon set to INACTIVE (disabled or not configured)');
    }
    
    // Update the icon
    await chrome.action.setIcon({ path: iconPath });
    
  } catch (error) {
    console.error('[Worth My Time] Error updating icon:', error);
  }
}

// Listen for storage changes to update icon
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    // If enabled state or salary changes, update icon
    if (changes.enabled || changes.salary) {
      console.log('[Worth My Time] Settings changed, updating icon');
      updateIcon();
    }
  }
});

// Update icon when extension starts
updateIcon();

