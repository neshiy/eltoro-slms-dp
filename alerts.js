// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the alerts page
    initNavigation();
    fetchAlertsData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Refresh data every 5 minutes
    setInterval(fetchAlertsData, 5 * 60 * 1000);
});

// Navigation functionality
function initNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-links li a');
    
    // Add click event listeners to each link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // If it's not a real page navigation (for demo purposes)
            if (link.getAttribute('href') === '#') {
                e.preventDefault();
                
                // Remove active class from all links
                document.querySelectorAll('.nav-links li').forEach(item => {
                    item.classList.remove('active-link');
                });
                
                // Add active class to the clicked link's parent li
                this.parentElement.classList.add('active-link');
            }
        });
    });
}

// Set up event listeners for the alerts page
function setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterAlertsTable(this.value);
        });
    }
    
    // Sort functionality
    const sortButton = document.querySelector('.sort-button');
    if (sortButton) {
        sortButton.addEventListener('click', function() {
            sortAlertsTable();
        });
    }
    
    // Mark all button
    const markAllButton = document.querySelector('.mark-all-button');
    if (markAllButton) {
        markAllButton.addEventListener('click', function() {
            markAllAlerts();
        });
    }
}

// Filter the alerts table based on search input
function filterAlertsTable(searchTerm) {
    const rows = document.querySelectorAll('#alerts-table-body tr');
    searchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Sort the alerts table
let sortAscending = true;
function sortAlertsTable() {
    const tbody = document.getElementById('alerts-table-body');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Sort rows based on the priority column
    rows.sort((a, b) => {
        const aPriority = getPriorityValue(a.cells[0]);
        const bPriority = getPriorityValue(b.cells[0]);
        
        return sortAscending 
            ? aPriority - bPriority 
            : bPriority - aPriority;
    });
    
    // Toggle sort direction for next click
    sortAscending = !sortAscending;
    
    // Remove existing rows
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    
    // Add sorted rows
    rows.forEach(row => {
        tbody.appendChild(row);
    });
}

// Get numeric value for priority (for sorting)
function getPriorityValue(cell) {
    const priorityText = cell.textContent.trim().toLowerCase();
    if (priorityText.includes('high')) return 1;
    if (priorityText.includes('medium')) return 2;
    if (priorityText.includes('low')) return 3;
    return 4; // Default for unknown priority
}

// Mark all alerts as read/resolved
function markAllAlerts() {
    const rows = document.querySelectorAll('#alerts-table-body tr');
    
    rows.forEach(row => {
        const statusCell = row.cells[5]; // Status column
        if (statusCell && statusCell.textContent.trim().toLowerCase() === 'unresolved') {
            statusCell.textContent = 'Assigned';
            statusCell.className = 'status-assigned';
        }
    });
    
    alert('All unresolved alerts have been marked as assigned');
}

// Fetch alerts data from the JSP endpoint
async function fetchAlertsData() {
    try {
        // This is the actual JSP endpoint URL
        const response = await fetch('http://103.140.194.188:6050/iothub/show.jsp');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // For a real JSP endpoint, you might need to parse HTML or expect JSON
        // This example assumes JSON response
        const data = await response.json();
        
        // Update the alerts table with the fetched data
        updateAlertsTable(data);
        
    } catch (error) {
        console.error('Error fetching alerts data:', error);
        // Use sample data when the JSP endpoint isn't available
        useSampleData();
    }
}

// Update the alerts table with the fetched data
function updateAlertsTable(data) {
    const tbody = document.getElementById('alerts-table-body');
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Check if data has the expected structure
    if (!data || !data.alerts || !Array.isArray(data.alerts)) {
        useSampleData();
        return;
    }
    
    // Add rows for each alert
    data.alerts.forEach(alert => {
        const row = createAlertRow(alert);
        tbody.appendChild(row);
    });
}

// Create a table row for an alert
function createAlertRow(alert) {
    const row = document.createElement('tr');
    
    // Priority
    const priorityCell = document.createElement('td');
    const priorityBadge = document.createElement('span');
    priorityBadge.className = 'priority-badge';
    
    if (alert.priority) {
        priorityBadge.textContent = alert.priority.toUpperCase();
        
        if (alert.priority.toLowerCase() === 'high') {
            priorityBadge.classList.add('priority-high');
        } else if (alert.priority.toLowerCase() === 'medium') {
            priorityBadge.classList.add('priority-medium');
        } else if (alert.priority.toLowerCase() === 'low') {
            priorityBadge.classList.add('priority-low');
        }
    } else {
        priorityBadge.textContent = 'N/A';
    }
    
    priorityCell.appendChild(priorityBadge);
    row.appendChild(priorityCell);
    
    // Board ID
    const idCell = document.createElement('td');
    idCell.textContent = alert.boardId || 'N/A';
    row.appendChild(idCell);
    
    // Location
    const locationCell = document.createElement('td');
    locationCell.textContent = alert.location || 'N/A';
    row.appendChild(locationCell);
    
    // Alert Type
    const typeCell = document.createElement('td');
    typeCell.textContent = alert.type || 'N/A';
    row.appendChild(typeCell);
    
    // Duration
    const durationCell = document.createElement('td');
    durationCell.textContent = alert.duration || 'N/A';
    row.appendChild(durationCell);
    
    // Status
    const statusCell = document.createElement('td');
    statusCell.textContent = alert.status || 'N/A';
    
    if (alert.status) {
        if (alert.status.toLowerCase() === 'unresolved') {
            statusCell.className = 'status-unresolved';
        } else if (alert.status.toLowerCase() === 'assigned') {
            statusCell.className = 'status-assigned';
        } else if (alert.status.toLowerCase() === 'resolved') {
            statusCell.className = 'status-resolved';
        }
    }
    
    row.appendChild(statusCell);
    
    // Assigned To
    const assignedCell = document.createElement('td');
    assignedCell.textContent = alert.assignedTo || '--';
    row.appendChild(assignedCell);
    
    // Action
    const actionCell = document.createElement('td');
    const actionLink = document.createElement('a');
    actionLink.className = 'action-button';
    actionLink.href = '#';
    
    if (alert.status && alert.status.toLowerCase() === 'unresolved') {
        actionLink.textContent = '[Resolve]';
        actionLink.addEventListener('click', function(e) {
            e.preventDefault();
            resolveAlert(row);
        });
    } else if (alert.status && alert.status.toLowerCase() === 'assigned') {
        actionLink.textContent = '[View]';
        actionLink.addEventListener('click', function(e) {
            e.preventDefault();
            viewAlert(row);
        });
    } else {
        actionLink.textContent = '[Locate]';
        actionLink.addEventListener('click', function(e) {
            e.preventDefault();
            locateAlert(row);
        });
    }
    
    actionCell.appendChild(actionLink);
    row.appendChild(actionCell);
    
    return row;
}

// Resolve an alert
function resolveAlert(row) {
    const statusCell = row.cells[5]; // Status column
    statusCell.textContent = 'Assigned';
    statusCell.className = 'status-assigned';
    
    const assignedCell = row.cells[6]; // Assigned To column
    assignedCell.textContent = 'Agent xyz';
    
    const actionCell = row.cells[7]; // Action column
    const actionLink = actionCell.querySelector('a');
    actionLink.textContent = '[View]';
    
    // Update event listener
    actionLink.removeEventListener('click', resolveAlert);
    actionLink.addEventListener('click', function(e) {
        e.preventDefault();
        viewAlert(row);
    });
}

// View an alert
function viewAlert(row) {
    const boardId = row.cells[1].textContent;
    const location = row.cells[2].textContent;
    const alertType = row.cells[3].textContent;
    
    alert(`Alert Details:\nBoard ID: ${boardId}\nLocation: ${location}\nAlert Type: ${alertType}`);
}

// Locate an alert on map
function locateAlert(row) {
    const location = row.cells[2].textContent;
    alert(`Locating ${location} on map...`);
}

// Use sample data when the JSP endpoint isn't available
function useSampleData() {
    const sampleData = {
        alerts: [
            { priority: 'high', boardId: '0001', location: 'Location1', type: 'Power Loss', duration: '2h 15m', status: 'Unresolved', assignedTo: '--' },
            { priority: 'high', boardId: '0002', location: 'Location2', type: 'Lights OFF', duration: '50m', status: 'Assigned', assignedTo: 'Agent xyz' },
            { priority: 'high', boardId: '0003', location: 'Location3', type: 'Weak Signal', duration: '1h 30m', status: 'Assigned', assignedTo: 'Agent xyz' },
            { priority: 'medium', boardId: '0003', location: 'Location1', type: 'Power Loss', duration: '3h 10m', status: 'Resolved', assignedTo: 'Agent xyz' },
            { priority: 'medium', boardId: '0004', location: 'Location1', type: 'Power Loss', duration: '2h', status: 'Resolved', assignedTo: 'Agent xyz' },
            { priority: 'low', boardId: '0004', location: 'Location1', type: 'Power Loss', duration: '2h', status: 'Assigned', assignedTo: 'Agent xyz' },
            { priority: 'low', boardId: '0006', location: 'Location1', type: 'Power Loss', duration: '1h', status: 'Assigned', assignedTo: 'Agent xyz' }
        ]
    };
    
    updateAlertsTable(sampleData);
}