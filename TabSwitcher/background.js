let lastActiveTabs = [];

// Funktion zum Aktualisieren der letzten aktiven Tab-IDs
function updateLastActiveTabs(newTabId) {
  // Wenn die Liste der letzten aktiven Tabs weniger als 2 Einträge hat, füge den neuen Tab hinzu
  if (lastActiveTabs.length < 2) {
    lastActiveTabs.unshift(newTabId);
  } else {
    // Wenn die Liste bereits 2 Einträge hat, ersetze den älteren Tab mit dem neuen Tab
    lastActiveTabs = [newTabId, lastActiveTabs[0]];
  }
  console.log("Last active tabs updated:", lastActiveTabs);
}

// Event Listener für das Schließen eines Tabs
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // Entferne die ID des geschlossenen Tabs aus der Liste
  const index = lastActiveTabs.indexOf(tabId);
  if (index !== -1) {
    lastActiveTabs.splice(index, 1);
  }

  // Erhalte den neuen aktiven Tab nach dem Schließen des aktuellen Tabs
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const newActiveTabId = tabs[0].id;
      // Ersetze die ID des geschlossenen Tabs durch die ID des neuen aktiven Tabs
      lastActiveTabs[index] = newActiveTabId;
      console.log("Closed tab was one of the last active tabs. Updated last active tabs:", lastActiveTabs);
    }
  });
});

// Event Listener für das Wechseln des aktiven Tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  const currentTabId = activeInfo.tabId;
  updateLastActiveTabs(currentTabId);
  console.log("Current tab ID:", currentTabId);
});

// Event Listener für den Befehl "toggle-tab-switcher"
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-tab-switcher") {
    if (lastActiveTabs.length === 2) {
      const [lastTabId, secondLastTabId] = lastActiveTabs;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        console.log("Current tab ID:", currentTab.id);
        console.log("Last active tabs:", lastActiveTabs);

        if (currentTab.id === lastTabId || currentTab.id === secondLastTabId) {
          const tabToActivate = (currentTab.id === lastTabId) ? secondLastTabId : lastTabId;
          chrome.tabs.update(tabToActivate, { active: true }, (updatedTab) => {
            if (chrome.runtime.lastError) {
              console.error("Error updating tab:", chrome.runtime.lastError.message);
            } else {
              console.log("Switched to last active tab:", updatedTab.id);
            }
          });
        } else {
          console.log("Unable to toggle tab switcher. Conditions not met or lastActiveTabs are invalid.");
        }
      });
    } else {
      console.log("Not enough tabs in history to switch.");
    }
  }
});
