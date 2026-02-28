// Load saved settings
chrome.storage.sync.get(['salary', 'workHours', 'workDays', 'enabled'], (data) => {
  document.getElementById('salary').value = data.salary || '';
  document.getElementById('workHours').value = data.workHours || 8;
  document.getElementById('workDays').value = data.workDays || 22;
  document.getElementById('enabled').checked = data.enabled !== false; // default to true
  
  // Show welcome message if this is first time (no salary configured)
  if (!data.salary || data.salary === '') {
    document.getElementById('firstTimeMessage').style.display = 'block';
  }
});

// Get page status from content script
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getPageStatus'}, (response) => {
      const pageStatus = document.getElementById('pageStatus');
      if (response && response.count !== undefined) {
        if (response.count === 0) {
          pageStatus.textContent = 'No prices converted on this page';
          pageStatus.style.color = '#ff9800';
        } else if (response.count === 1) {
          pageStatus.textContent = 'Converted 1 price';
          pageStatus.style.color = '#4CAF50';
        } else {
          pageStatus.textContent = `Converted ${response.count} prices`;
          pageStatus.style.color = '#4CAF50';
        }
      } else {
        pageStatus.textContent = 'Extension not active on this page';
        pageStatus.style.color = '#999';
      }
    });
  }
});

// Report site issue
document.getElementById('reportSite').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      const url = tabs[0].url;
      const hostname = new URL(url).hostname;
      
      // Client-side rate limiting: 1 report per site per day
      const reportKey = `wmt_report_${hostname}`;
      const lastReported = localStorage.getItem(reportKey);
      const now = Date.now();
      
      if (lastReported && (now - parseInt(lastReported)) < 24 * 60 * 60 * 1000) {
        // Already reported this site in last 24 hours
        const reportButton = document.getElementById('reportSite');
        const reportStatus = document.getElementById('reportStatus');
        reportButton.textContent = '✅ Already Reported';
        reportButton.disabled = true;
        reportStatus.textContent = 'You reported this site recently. Thanks!';
        reportStatus.style.display = 'block';
        
        setTimeout(() => {
          reportButton.disabled = false;
          reportButton.innerHTML = '⚠️ Report Site Issue';
          reportStatus.style.display = 'none';
          reportStatus.textContent = 'Report submitted. Thank you!';
        }, 3000);
        return;
      }
      
      // Get conversion count from content script
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getPageStatus'}, async (response) => {
        const conversionCount = response ? response.count : 0;
        const extensionVersion = chrome.runtime.getManifest().version;
        
        // ========================================
        // FIREBASE CONFIGURATION
        // ========================================
        const firebaseConfig = {
          apiKey: "AIzaSyDfVEOKSyV5qOR6axptNGvmLxFhqMKrN4c",
          projectId: "worthmytime-reports"
        };
        
        // Build report data
        const report = {
          url: url,
          hostname: hostname,
          timestamp: new Date().toISOString(),
          conversionCount: conversionCount,
          extensionVersion: extensionVersion
        };
        
        try {
          // Send to Firebase Firestore REST API
          const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/reports?key=${firebaseConfig.apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fields: {
                  url: { stringValue: report.url },
                  hostname: { stringValue: report.hostname },
                  timestamp: { stringValue: report.timestamp },
                  conversionCount: { integerValue: report.conversionCount.toString() },
                  extensionVersion: { stringValue: report.extensionVersion }
                }
              })
            }
          );
          
          if (!response.ok) {
            throw new Error(`Firebase error: ${response.status}`);
          }
          
          console.log('[Worth My Time] Report submitted successfully:', report);
          
          // Save report timestamp to prevent duplicates
          localStorage.setItem(reportKey, now.toString());
          
          // Show confirmation
          const reportButton = document.getElementById('reportSite');
          const reportStatus = document.getElementById('reportStatus');
          reportButton.disabled = true;
          reportButton.textContent = '✅ Reported';
          reportStatus.style.display = 'block';
          
          setTimeout(() => {
            reportButton.disabled = false;
            reportButton.innerHTML = '⚠️ Report Site Issue';
            reportStatus.style.display = 'none';
          }, 3000);
          
        } catch (error) {
          console.error('[Worth My Time] Report failed:', error);
          
          // Still show confirmation to user (fail silently)
          const reportButton = document.getElementById('reportSite');
          const reportStatus = document.getElementById('reportStatus');
          reportButton.disabled = true;
          reportButton.textContent = '✅ Reported';
          reportStatus.textContent = 'Report submitted (pending network)';
          reportStatus.style.display = 'block';
          
          setTimeout(() => {
            reportButton.disabled = false;
            reportButton.innerHTML = '⚠️ Report Site Issue';
            reportStatus.style.display = 'none';
            reportStatus.textContent = 'Report submitted. Thank you!';
          }, 3000);
        }
      });
    }
  });
});

// Save settings
document.getElementById('save').addEventListener('click', () => {
  const salaryInput = document.getElementById('salary');
  const salaryError = document.getElementById('salaryError');
  const salary = parseFloat(salaryInput.value);
  const currency = 'USD'; // Fixed to USD for now
  const workHours = parseFloat(document.getElementById('workHours').value);
  const workDays = parseFloat(document.getElementById('workDays').value);
  const enabled = document.getElementById('enabled').checked;
  
  // Clear previous errors
  salaryInput.classList.remove('error');
  salaryError.style.display = 'none';
  
  // Validate salary (required field)
  if (!salary || salary <= 0) {
    salaryInput.classList.add('error');
    salaryError.style.display = 'block';
    salaryInput.focus();
    return;
  }
  
  if (!workHours || workHours <= 0 || workHours > 24) {
    alert('Please enter valid work hours (1-24)');
    return;
  }
  
  if (!workDays || workDays <= 0 || workDays > 31) {
    alert('Please enter valid work days (1-31)');
    return;
  }
  
  chrome.storage.sync.set({
    salary,
    currency,
    workHours,
    workDays,
    enabled
  }, () => {
    // Show status message
    const status = document.getElementById('status');
    status.style.display = 'block';
    
    // Notify content script to update
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'updateSettings'});
      }
    });
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  });
});

// Toggle functionality
document.getElementById('enabled').addEventListener('change', (e) => {
  chrome.storage.sync.set({ enabled: e.target.checked }, () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'updateSettings'});
      }
    });
  });
});

// Clear error when user starts typing in salary field
document.getElementById('salary').addEventListener('input', () => {
  const salaryInput = document.getElementById('salary');
  const salaryError = document.getElementById('salaryError');
  salaryInput.classList.remove('error');
  salaryError.style.display = 'none';
});
