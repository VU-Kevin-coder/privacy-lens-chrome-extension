document.addEventListener('DOMContentLoaded', function() {
  const requestsTab = document.getElementById('requests-tab');
  const cookiesTab = document.getElementById('cookies-tab');
  const requestsView = document.getElementById('requests-view');
  const cookiesView = document.getElementById('cookies-view');
  const requestsList = document.getElementById('requests-list');
  const cookiesList = document.getElementById('cookies-list');
  const domainFilter = document.getElementById('domain-filter');
  const cookieFilter = document.getElementById('cookie-filter');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');

  // Switch between tabs
  requestsTab.addEventListener('click', () => {
    requestsTab.classList.add('active');
    cookiesTab.classList.remove('active');
    requestsView.style.display = 'block';
    cookiesView.style.display = 'none';
  });

  cookiesTab.addEventListener('click', () => {
    cookiesTab.classList.add('active');
    requestsTab.classList.remove('active');
    cookiesView.style.display = 'block';
    requestsView.style.display = 'none';
  });

  // Get current tab and fetch data
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs.length === 0) {
      showError('No active tab found');
      return;
    }

    const activeTab = tabs[0];
    if (!activeTab.url || !activeTab.url.startsWith('http')) {
      showError('Privacy Lens only works on web pages');
      return;
    }

    const currentDomain = new URL(activeTab.url).hostname;
    
    // Get requests data
    chrome.runtime.sendMessage(
      {action: 'getRequestsData', tabId: activeTab.id}, 
      (response) => {
        if (chrome.runtime.lastError) {
          showError(chrome.runtime.lastError.message);
          return;
        }
        
        loadingElement.style.display = 'none';
        displayRequestsData(response, currentDomain);
      }
    );

    // Get cookies data
    chrome.runtime.sendMessage(
      {action: 'getCookiesData', domain: currentDomain},
      (response) => {
        if (chrome.runtime.lastError) {
          showError(chrome.runtime.lastError.message);
          return;
        }
        
        displayCookiesData(response, currentDomain);
      }
    );
  });

  // Filter requests
  domainFilter.addEventListener('input', function() {
    const filter = this.value.toLowerCase();
    const items = requestsList.querySelectorAll('.request-item');
    
    items.forEach(item => {
      const domain = item.querySelector('.request-domain').textContent.toLowerCase();
      if (domain.includes(filter)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });

  // Filter cookies
  cookieFilter.addEventListener('input', function() {
    const filter = this.value.toLowerCase();
    const items = cookiesList.querySelectorAll('.cookie-item');
    
    items.forEach(item => {
      const name = item.querySelector('.cookie-name').textContent.toLowerCase();
      const domain = item.querySelector('.cookie-domain').textContent.toLowerCase();
      if (name.includes(filter) || domain.includes(filter)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });

  function displayRequestsData(data, currentDomain) {
    if (!data || !data.requests) {
      showError('No request data available');
      return;
    }

    requestsList.innerHTML = '';
    
    // Group requests by domain
    const domainMap = {};
    data.requests.forEach(request => {
      const requestDomain = new URL(request.url).hostname;
      
      // Skip main domain requests
      if (requestDomain === currentDomain || requestDomain.endsWith('.' + currentDomain)) {
        return;
      }
      
      if (!domainMap[requestDomain]) {
        domainMap[requestDomain] = {
          types: new Set(),
          count: 0
        };
      }
      
      domainMap[requestDomain].types.add(request.type);
      domainMap[requestDomain].count++;
    });
    
    // Sort domains by request count
    const sortedDomains = Object.keys(domainMap).sort((a, b) => {
      return domainMap[b].count - domainMap[a].count;
    });
    
    // Display domains
    if (sortedDomains.length === 0) {
      requestsList.innerHTML = '<div class="request-item">No third-party requests detected</div>';
      return;
    }
    
    sortedDomains.forEach(domain => {
      const item = document.createElement('div');
      item.className = 'request-item';
      
      const domainEl = document.createElement('div');
      domainEl.className = 'request-domain';
      domainEl.textContent = domain;
      
      const detailsEl = document.createElement('div');
      detailsEl.className = 'request-details';
      
      // Add request types
      Array.from(domainMap[domain].types).forEach(type => {
        const typeEl = document.createElement('span');
        typeEl.className = 'request-type';
        typeEl.textContent = type;
        detailsEl.appendChild(typeEl);
      });
      
      // Add request count
      const countEl = document.createElement('span');
      countEl.className = 'request-count';
      countEl.textContent = `${domainMap[domain].count} requests`;
      detailsEl.appendChild(countEl);
      
      item.appendChild(domainEl);
      item.appendChild(detailsEl);
      requestsList.appendChild(item);
    });
  }

  function displayCookiesData(data, currentDomain) {
    if (!data || !data.cookies) {
      showError('No cookie data available');
      return;
    }

    cookiesList.innerHTML = '';
    
    if (data.cookies.length === 0) {
      cookiesList.innerHTML = '<div class="cookie-item">No cookies found</div>';
      return;
    }
    
    data.cookies.forEach(cookie => {
      const item = document.createElement('div');
      item.className = 'cookie-item';
      
      const nameEl = document.createElement('div');
      nameEl.className = 'cookie-name';
      nameEl.textContent = cookie.name;
      
      const domainEl = document.createElement('div');
      domainEl.className = 'cookie-domain';
      domainEl.textContent = cookie.domain;
      
      const detailsEl = document.createElement('div');
      detailsEl.className = 'cookie-details';
      
      const sameSite = cookie.sameSite || 'unspecified';
      detailsEl.innerHTML = `
        <div>Path: ${cookie.path}</div>
        <div>Secure: ${cookie.secure ? 'Yes' : 'No'}</div>
        <div>HTTP Only: ${cookie.httpOnly ? 'Yes' : 'No'}</div>
        <div>SameSite: ${sameSite.charAt(0).toUpperCase() + sameSite.slice(1)}</div>
        <div>Expires: ${cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString() : 'Session'}</div>
      `;
      
      item.appendChild(nameEl);
      item.appendChild(domainEl);
      item.appendChild(detailsEl);
      cookiesList.appendChild(item);
    });
  }

  function showError(message) {
    loadingElement.style.display = 'none';
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
});