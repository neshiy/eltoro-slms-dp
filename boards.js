// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the boards page
    initNavigation();
    fetchBoardsData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Refresh data every minute
    setInterval(fetchBoardsData, 60 * 1000);
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

// Set up event listeners for the boards page
function setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterBoardsTable(this.value);
        });
    }
    
    // Sort functionality
    const sortButton = document.querySelector('.sort-button');
    if (sortButton) {
        sortButton.addEventListener('click', function() {
            sortBoardsTable();
        });
    }
    
    // Add board button
    const addBoardButton = document.querySelector('.add-board-button');
    if (addBoardButton) {
        addBoardButton.addEventListener('click', function() {
            alert('Add board functionality would be implemented here');
        });
    }
}

// Filter the boards table based on search input
function filterBoardsTable(searchTerm) {
    const rows = document.querySelectorAll('#boards-table-body tr');
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

// Sort the boards table
let sortAscending = true;
function sortBoardsTable() {
    const tbody = document.getElementById('boards-table-body');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Sort rows based on the first column (Board ID)
    rows.sort((a, b) => {
        const aValue = a.cells[0].textContent;
        const bValue = b.cells[0].textContent;
        
        return sortAscending 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
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

// Fetch boards data from our backend API
async function fetchBoardsData() {
    try {
        // Connect to our Node.js backend API
        const response = await fetch('http://localhost:3000/api/devices');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const devices = await response.json();
        
        // Format the data for the boards table
        const formattedData = {
            boards: devices.map(device => ({
                id: device.dId,
                location: getLocationForDevice(device.dId),
                status: getStatusFromDevice(device),
                lastUpdate: device.timestamp,
                power: device.p ? 'ON' : 'OFF',
                switch: device.s ? 'ON' : 'OFF',
                light: device.l ? 'ON' : 'OFF',
                temperature: device.t,
                current: device.i,
                battery: device.b
            }))
        };
        
        // Update the boards table with the fetched data
        updateBoardsTable(formattedData);
        
    } catch (error) {
        console.error('Error fetching boards data:', error);
        // Use sample data when the API isn't available
        useSampleData();
    }
}

// Get location based on device ID (in a real app, this would come from the database)
function getLocationForDevice(deviceId) {
    const locationMap = {
        'DEV001': 'Colombo',
        'DEV002': 'Kandy',
        'DEV003': 'Galle',
        'DEV004': 'Jaffna',
        'DEV005': 'Batticaloa',
        'DEV006': 'Trincomalee',
        'DEV007': 'Anuradhapura',
        'DEV008': 'Kurunegala',
        'DEV009': 'Badulla',
        'DEV010': 'Ratnapura',
        'DEV00002': 'Matara',
        'LBC0001': 'Negombo',
        'dev002': 'Kegalle'
    };
    
    return locationMap[deviceId] || 'Unknown';
}

// Determine status based on device parameters
function getStatusFromDevice(device) {
    if (device.p === 0) return 'out'; // Power is off
    if (device.l && device.l !== 0) return 'on';   // Light is on
    return 'off';                // Light is off but power is on
}

// Format timestamp from MongoDB format
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    let formattedTimestamp = '';
    
    if (timestamp.length >= 14) {
        const year = timestamp.substring(0, 4);
        const month = timestamp.substring(4, 6);
        const day = timestamp.substring(6, 8);
        const hour = timestamp.substring(8, 10);
        const minute = timestamp.substring(10, 12);
        const second = timestamp.substring(12, 14);
        
        formattedTimestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    } else {
        formattedTimestamp = timestamp;
    }
    
    return formattedTimestamp;
}

// Update the boards table with the fetched data
function updateBoardsTable(data) {
    const tbody = document.getElementById('boards-table-body');
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Check if data has the expected structure
    if (!data || !data.boards || !Array.isArray(data.boards)) {
        useSampleData();
        return;
    }
    
    // Add rows for each board
    data.boards.forEach(board => {
        const row = createBoardRow(board);
        tbody.appendChild(row);
    });
}

// Create a table row for a board
function createBoardRow(board) {
    const row = document.createElement('tr');
    
    // Board ID
    const idCell = document.createElement('td');
    idCell.textContent = board.id || 'N/A';
    row.appendChild(idCell);
    
    // Location
    const locationCell = document.createElement('td');
    locationCell.textContent = board.location || 'N/A';
    row.appendChild(locationCell);
    
    // Status
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge';
    
    if (board.status) {
        statusBadge.textContent = board.status.toUpperCase();
        
        if (board.status.toLowerCase() === 'on') {
            statusBadge.classList.add('status-on');
        } else if (board.status.toLowerCase() === 'off') {
            statusBadge.classList.add('status-off');
        } else if (board.status.toLowerCase() === 'out') {
            statusBadge.classList.add('status-out');
        }
    } else {
        statusBadge.textContent = 'N/A';
    }
    
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);
    
    // Last Update
    const updateCell = document.createElement('td');
    updateCell.textContent = formatLastUpdate(board.lastUpdate);
    row.appendChild(updateCell);
    
    // Power
    const powerCell = document.createElement('td');
    powerCell.textContent = board.power || 'N/A';
    row.appendChild(powerCell);
    
    return row;
}

// Format the last update timestamp
function formatLastUpdate(timestamp) {
    if (!timestamp) return 'N/A';
    
    // If timestamp is already formatted, return it
    if (typeof timestamp === 'string' && 
        (timestamp.includes('mins ago') || 
         timestamp.includes('hours ago') || 
         timestamp.includes('days ago'))) {
        return timestamp;
    }
    
    // If timestamp is a number (unix timestamp), convert to relative time
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffMs = now - updateTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
        return `${diffMins} mins ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
}

// Use sample data when the API isn't available
function useSampleData() {
    const sampleData = {
        boards: [
            { id: 'DEV001', location: 'Colombo', status: 'on', lastUpdate: '20250713111901', power: 'ON', switch: 'ON', light: 'ON' },
            { id: 'DEV002', location: 'Kandy', status: 'on', lastUpdate: '20250713111913', power: 'ON', switch: 'OFF', light: 'OFF' },
            { id: 'DEV003', location: 'Galle', status: 'on', lastUpdate: '20250713111919', power: 'ON', switch: 'OFF', light: 'OFF' },
            { id: 'DEV004', location: 'Jaffna', status: 'on', lastUpdate: '20250713112306', power: 'ON', switch: 'OFF', light: 'OFF' },
            { id: 'DEV005', location: 'Batticaloa', status: 'on', lastUpdate: '20250713112312', power: 'ON', switch: 'OFF', light: 'OFF' },
            { id: 'DEV006', location: 'Trincomalee', status: 'on', lastUpdate: '20250713112317', power: 'ON', switch: 'OFF', light: 'OFF' },
            { id: 'DEV007', location: 'Anuradhapura', status: 'on', lastUpdate: '20250713112327', power: 'ON', switch: 'OFF', light: 'OFF' },
            { id: 'DEV008', location: 'Kurunegala', status: 'on', lastUpdate: '20250713112327', power: 'ON', switch: 'OFF', light: 'OFF' },
            { id: 'DEV009', location: 'Badulla', status: 'on', lastUpdate: '20250713112332', power: 'ON', switch: 'OFF', light: 'OFF' },
            { id: 'DEV010', location: 'Ratnapura', status: 'on', lastUpdate: '20250714051447', power: 'ON', switch: 'OFF', light: 'OFF' },
            { id: 'DEV00002', location: 'Matara', status: 'on', lastUpdate: '20250713204636', power: 'ON', switch: 'ON', light: 'OFF' },
            { id: 'LBC0001', location: 'Negombo', status: 'out', lastUpdate: '20250725112907', power: 'OFF', switch: 'OFF', light: '1134' },
            { id: 'dev002', location: 'Kegalle', status: 'on', lastUpdate: '20250716154857', power: 'ON', switch: '3', light: 'OFF' }
        ]
    };
    
    updateBoardsTable(sampleData);
}