// Store requests data by tab ID
const requestsData = {};

// Listen for web requests
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (!requestsData[details.tabId]) {
      requestsData[details.tabId] = {
        requests: []
      };
    }
    
    requestsData[details.tabId].requests.push({
      url: details.url,
      type: details.type,
      timeStamp: details.timeStamp
    });
  },
  {urls: ["<all_urls>"]},
  []
);

// Clean up data when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete requestsData[tabId];
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRequestsData') {
    const data = requestsData[request.tabId] || {requests: []};
    sendResponse(data);
  } else if (request.action === 'getCookiesData') {
    getAllCookies(request.domain).then(cookies => {
      sendResponse({cookies});
    });
    return true; // Keep the message channel open for async response
  }
});

async function getAllCookies(currentDomain) {
  try {
    // Get cookies for the current domain
    const currentDomainCookies = await chrome.cookies.getAll({domain: currentDomain});
    
    // Get all cookies (for third-party detection)
    const allCookies = await chrome.cookies.getAll({});
    
    // Filter third-party cookies that are set on this page
    const thirdPartyCookies = allCookies.filter(cookie => {
      return !cookie.domain.includes(currentDomain) && 
             !currentDomain.includes(cookie.domain.replace(/^\./, ''));
    });
    
    return [...currentDomainCookies, ...thirdPartyCookies];
  } catch (error) {
    console.error('Error fetching cookies:', error);
    return [];
  }
}