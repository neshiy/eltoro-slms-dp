// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initCharts();
    fetchData();
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

// Initialize all charts
function initCharts() {
    // Initialize the map
    initMap();
    
    // For other charts, we'll use the sample data from fetchData
    // This prevents duplicate chart initialization
}

// Initialize the map
function initMap() {
    // Check if the map container exists
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    // Create a map centered at a default location
    const map = L.map('map-container').setView([7.8731, 80.7718], 7); // Center on Sri Lanka
    
    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add some sample markers with status indicators (these would be replaced with real data)
    const locations = [
        { lat: 6.9271, lng: 79.8612, name: 'Colombo', status: 'online' },
        { lat: 7.2906, lng: 80.6337, name: 'Kandy', status: 'offline' },
        { lat: 8.3114, lng: 80.4037, name: 'Anuradhapura', status: 'online' },
        { lat: 6.0535, lng: 80.2210, name: 'Galle', status: 'online' },
        { lat: 7.4818, lng: 80.3609, name: 'Kurunegala', status: 'power_off' },
        { lat: 8.5874, lng: 81.2152, name: 'Trincomalee', status: 'online' },
        { lat: 7.2964, lng: 81.6759, name: 'Batticaloa', status: 'power_off' },
        { lat: 9.6615, lng: 80.0255, name: 'Jaffna', status: 'offline' }
    ];
    
    // Create custom icons for different statuses
    const icons = {
        online: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        offline: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        power_off: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    };
    
    // Add markers to the map
    locations.forEach(location => {
        const icon = icons[location.status] || icons.online;
        
        L.marker([location.lat, location.lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${location.name}</b><br>Status: ${location.status}`);
    });
}

// Initialize the uptime line chart - now handled by updateDashboardWithData

// Initialize the status pie chart - now handled by updateDashboardWithData

// Initialize the uptime percentage display - now handled by updateDashboardWithData

// Initialize the outages list - now handled by updateDashboardWithData

// Add styling for outage items
function addOutageStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .outage-item {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .outage-date {
            font-weight: 500;
            margin-bottom: 5px;
        }
        .outage-details {
            display: flex;
            justify-content: space-between;
            color: #666;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
}

// Call this function to add the styles
addOutageStyles();

// Fetch data from backend API
async function fetchData() {
    try {
        // Connect to our Node.js backend API
        const response = await fetch('http://localhost:3000/api/dashboard');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process and update the dashboard with the fetched data
        updateDashboardWithData(data);
        
        // Update device-specific information
        updateDeviceInfo(data.devices);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        // Use sample data when the API isn't available
        const sampleData = {
            uptimePercentage: 98.7,
            boardStatus: {
                online: 832,
                offline: 120,
                power_off: 48
            },
            uptimeHistory: Array.from({ length: 24 }, () => Math.floor(Math.random() * 20) + 80),
            outages: [
                { date: '2025-07-24', duration: '45 minutes', reason: 'Network issue' },
                { date: '2025-07-22', duration: '2 hours', reason: 'Scheduled maintenance' },
                { date: '2025-07-20', duration: '15 minutes', reason: 'Power outage' },
                { date: '2025-07-19', duration: '30 minutes', reason: 'Server restart' },
                { date: '2025-07-18', duration: '1 hour', reason: 'Database maintenance' },
                { date: '2025-07-17', duration: '10 minutes', reason: 'Network issue' },
                { date: '2025-07-16', duration: '3 hours', reason: 'Power outage' }
            ],
            devices: [
                { dId: 'DEV001', p: true, s: true, l: true, t: 25, i: 0.5, b: 95 },
                { dId: 'DEV002', p: true, s: false, l: false, t: 28, i: 0.2, b: 80 },
                { dId: 'DEV003', p: false, s: false, l: false, t: 0, i: 0, b: 60 },
                { dId: 'DEV004', p: true, s: true, l: true, t: 26, i: 0.6, b: 90 }
            ]
        };
        
        // Use the sample data
        updateDashboardWithData(sampleData);
        updateDeviceInfo(sampleData.devices);
    }
}

// Update device-specific information on the dashboard
function updateDeviceInfo(devices) {
    // Check if the device-info container exists
    const deviceInfoContainer = document.getElementById('device-info-container');
    if (!deviceInfoContainer) return;
    
    // Clear existing content
    deviceInfoContainer.innerHTML = '';
    
    // Create a table to display device information
    const table = document.createElement('table');
    table.className = 'device-info-table';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Device ID</th>
            <th>Power</th>
            <th>Switch</th>
            <th>Light</th>
            <th>Time/Temp</th>
            <th>Current</th>
            <th>Battery</th>
            <th>Last Update</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Add rows for each device
    devices.forEach(device => {
        const tr = document.createElement('tr');
        
        // Status classes for styling
        const powerClass = device.p ? 'status-on' : 'status-off';
        const switchClass = device.s ? 'status-on' : 'status-off';
        
        // Format timestamp
        const timestamp = device.timestamp || '';
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
        
        // Format light value
        let lightDisplay = device.l ? device.l : 'OFF';
        let lightClass = 'status-off';
        
        if (device.l && typeof device.l === 'number' && device.l > 0) {
            lightDisplay = device.l;
            lightClass = 'status-on';
        }
        
        // Format temperature/time value
        let tempDisplay = device.t || '-';
        
        // Check if t is a time string (contains :)
        if (typeof device.t === 'string' && device.t.includes(':')) {
            tempDisplay = device.t; // It's a time string
        } else if (typeof device.t === 'number') {
            tempDisplay = `${device.t}°C`; // It's a temperature
        }
        
        tr.innerHTML = `
            <td>${device.dId || '-'}</td>
            <td class="${powerClass}">${device.p ? 'ON' : 'OFF'}</td>
            <td class="${switchClass}">${device.s ? 'ON' : 'OFF'}</td>
            <td class="${lightClass}">${lightDisplay}</td>
            <td>${tempDisplay}</td>
            <td>${device.i !== undefined ? device.i + 'A' : '-'}</td>
            <td>${device.b !== undefined ? device.b + '%' : '-'}</td>
            <td>${formattedTimestamp}</td>
        `;
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    deviceInfoContainer.appendChild(table);
    
    // Add some basic styles for the device info table
    const style = document.createElement('style');
    style.textContent = `
        .device-info-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 14px;
        }
        .device-info-table th, .device-info-table td {
            padding: 8px;
            text-align: center;
            border: 1px solid #ddd;
        }
        .device-info-table th {
            background-color: #f5f5f5;
            font-weight: 500;
        }
        .status-on {
            background-color: #e8f5e9;
            color: #4CAF50;
            font-weight: 500;
        }
        .status-off {
            background-color: #ffebee;
            color: #F44336;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
}

// Update dashboard with fetched data
function updateDashboardWithData(data) {
    // Update uptime percentage
    if (data.uptimePercentage) {
        const uptimePercentageEl = document.getElementById('uptime-percentage-container');
        if (uptimePercentageEl) {
            uptimePercentageEl.textContent = `${data.uptimePercentage}%`;
        }
    }
    
    // Update board status pie chart
    if (data.boardStatus) {
        const statusChartEl = document.getElementById('status-pie-chart');
        if (statusChartEl && statusChartEl.getContext) {
            // Clear any existing chart
            if (window.statusChart) {
                window.statusChart.destroy();
            }
            
            // Create new chart
            window.statusChart = new Chart(statusChartEl, {
                type: 'pie',
                data: {
                    labels: ['Lights On', 'Lights Off', 'Power Off'],
                    datasets: [{
                        data: [
                            data.boardStatus.online || 832,
                            data.boardStatus.offline || 120,
                            data.boardStatus.power_off || 48
                        ],
                        backgroundColor: ['#00c853', '#f44336', '#ffc107']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false // Hide default legend as we're using custom one
                        }
                    },
                    cutout: '60%' // Make it a donut chart to match the image
                }
            });
            
            // Update the status counts in the custom legend
            const lightsOnCount = document.querySelector('.status-item:nth-child(1) .status-count');
            const lightsOffCount = document.querySelector('.status-item:nth-child(2) .status-count');
            const powerOffCount = document.querySelector('.status-item:nth-child(3) .status-count');
            
            if (lightsOnCount) lightsOnCount.textContent = data.boardStatus.online || 832;
            if (lightsOffCount) lightsOffCount.textContent = data.boardStatus.offline || 120;
            if (powerOffCount) powerOffCount.textContent = data.boardStatus.power_off || 48;
        }
    }
    
    // Update uptime chart
    if (data.uptimeHistory) {
        const uptimeChartEl = document.getElementById('uptime-chart');
        if (uptimeChartEl && uptimeChartEl.getContext) {
            // Clear any existing chart
            if (window.uptimeChart) {
                window.uptimeChart.destroy();
            }
            
            // Create new chart with dates for the last 8 days to match the image
            const today = new Date();
            const labels = Array.from({ length: 8 }, (_, i) => {
                const date = new Date(today);
                date.setDate(date.getDate() - (7 - i));
                return `May ${date.getDate()}`;
            });
            
            // Sample data to match the image pattern
            const sampleData = [95, 85, 95, 80, 70, 90, 40, 60];
            
            window.uptimeChart = new Chart(uptimeChartEl, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Uptime (%)',
                        data: sampleData,
                        borderColor: '#1a237e',
                        backgroundColor: 'rgba(26, 35, 126, 0.1)',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#1a237e'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            min: 0,
                            max: 100,
                            grid: {
                                color: '#eee'
                            },
                            ticks: {
                                stepSize: 20
                            }
                        },
                        x: {
                            grid: {
                                color: '#eee'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }
    
    // Update outages count
    if (data.outages) {
        const outagesCountEl = document.querySelector('.outages-count');
        if (outagesCountEl) {
            outagesCountEl.textContent = data.outages.length || 30;
        }
    }
}

// Real-time data service
class RealTimeDataService {
    constructor() {
        console.log('Real-time data service initialized');
        this.apiBaseUrl = 'http://localhost:3000/api';
    }
    
    // Fetch dashboard data from the backend API
    async fetchDashboardData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/dashboard`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }
    
    // Fetch all devices
    async fetchDevices() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/devices`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching devices:', error);
            throw error;
        }
    }
    
    // Fetch a specific device by ID
    async fetchDeviceById(deviceId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/devices/${deviceId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching device ${deviceId}:`, error);
            throw error;
        }
    }
}

// Initialize real-time data service
const realTimeDataService = new RealTimeDataService();

// Set up periodic data refresh (every minute)
fetchData(); // Initial fetch
setInterval(fetchData, 60 * 1000);