// welcome.js - First-time setup page logic

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Worth My Time Welcome] DOM loaded, initializing...');
  
  // Load existing settings if any
  chrome.storage.sync.get(['salary', 'workHours', 'workDays'], (data) => {
    console.log('[Worth My Time Welcome] Loaded existing settings:', data);
    if (data.salary) document.getElementById('salary').value = data.salary;
    if (data.workHours) document.getElementById('workHours').value = data.workHours;
    if (data.workDays) document.getElementById('workDays').value = data.workDays;
  });
  
  // Get button element
  const saveButton = document.getElementById('saveButton');
  if (!saveButton) {
    console.error('[Worth My Time Welcome] ERROR: Save button not found!');
    return;
  }
  
  console.log('[Worth My Time Welcome] Save button found, attaching listener');
  
  // Save settings
  saveButton.addEventListener('click', () => {
    console.log('[Worth My Time Welcome] Save button clicked');
  
    const salaryInput = document.getElementById('salary');
    const salaryError = document.getElementById('salaryError');
    const salary = parseFloat(salaryInput.value);
    const workHours = parseFloat(document.getElementById('workHours').value);
    const workDays = parseFloat(document.getElementById('workDays').value);
    
    console.log('[Worth My Time Welcome] Input values:', { salary, workHours, workDays });
    
    // Clear previous errors
    salaryInput.style.borderColor = '';
    salaryInput.style.backgroundColor = '';
    salaryError.style.display = 'none';
    
    // Validate salary (required field)
    if (!salary || salary <= 0) {
      salaryInput.style.borderColor = '#f44336';
      salaryInput.style.backgroundColor = '#fff5f5';
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
    
    // Save settings with extension ENABLED
    chrome.storage.sync.set({
      salary,
      currency: 'USD',
      workHours,
      workDays,
      enabled: true  // Always enable on first setup
    }, () => {
      console.log('[Worth My Time] Settings saved successfully');
      
      // Small delay to ensure storage sync and icon update complete
      setTimeout(() => {
        // Show success message
        document.getElementById('status').style.display = 'block';
        document.getElementById('saveButton').textContent = '✅ Setup Complete!';
        document.getElementById('saveButton').disabled = true;
        
        // Notify all tabs to reload/update
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            // Send message to content script to reload settings
            chrome.tabs.sendMessage(tab.id, {action: 'updateSettings'}, () => {
              // Ignore errors for tabs that don't have content script
              if (chrome.runtime.lastError) {
                console.log('Tab cannot receive message:', tab.id);
              }
            });
          });
        });
        
        // Don't auto-close - let user manually close after verifying
        // This ensures they see the success message and icon change
      }, 500);
    });
  });
  
  // Allow Enter key to submit
  document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const saveButton = document.getElementById('saveButton');
      if (saveButton) {
        saveButton.click();
      }
    }
  });
  
  console.log('[Worth My Time Welcome] Initialization complete');
});
