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
