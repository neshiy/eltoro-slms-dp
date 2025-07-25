// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initCharts();
    fetchAnalyticsData();
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

    // Add event listener to logout button
    const logoutBtn = document.querySelector('.logout a');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            // In a real application, you would perform logout operations here
            console.log('Logging out...');
            // Redirect to login page is handled by the href attribute
        });
    }

    // Add event listener to export button
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            console.log('Exporting analytics data...');
            // In a real application, you would implement export functionality here
            alert('Analytics data exported successfully!');
        });
    }
}

// Initialize all charts
function initCharts() {
    // We'll use the sample data from fetchAnalyticsData
    // This prevents duplicate chart initialization
}

// Fetch analytics data
async function fetchAnalyticsData() {
    try {
        // This is a placeholder URL - replace with your actual JSP endpoint
        const response = await fetch('http://103.140.194.188:6050/iothub/show.jsp');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process and update the analytics with the fetched data
        updateAnalyticsWithData(data);
        
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Use sample data when the JSP endpoint isn't available
        const sampleData = {
            topRegions: [
                { name: 'Colombo', performance: 95 },
                { name: 'Galle', performance: 85 },
                { name: 'Kandy', performance: 75 }
            ],
            uptimeToday: 95.2,
            outagesByWeek: [
                { week: 'Week 1', count: 20 },
                { week: 'Week 2', count: 15 },
                { week: 'Week 3', count: 12 },
                { week: 'Week 4', count: 8 }
            ],
            outagesRadar: {
                labels: ['Power', 'Network', 'Hardware', 'Software', 'External'],
                datasets: [
                    {
                        label: 'Current',
                        data: [65, 59, 90, 81, 56]
                    },
                    {
                        label: 'Previous',
                        data: [28, 48, 40, 19, 96]
                    }
                ]
            },
            visibilityImpact: {
                labels: ['Reach', 'Engagement', 'Conversion'],
                datasets: [
                    {
                        label: 'Current',
                        data: [65, 59, 90]
                    },
                    {
                        label: 'Target',
                        data: [80, 70, 95]
                    }
                ]
            }
        };
        
        // Use the sample data
        updateAnalyticsWithData(sampleData);
    }
}

// Update analytics with fetched data
function updateAnalyticsWithData(data) {
    // Update top regions
    if (data.topRegions) {
        const regionItems = document.querySelectorAll('.region-item');
        data.topRegions.forEach((region, index) => {
            if (index < regionItems.length) {
                const regionName = regionItems[index].querySelector('.region-name');
                const regionBar = regionItems[index].querySelector('.region-bar');
                
                if (regionName) regionName.textContent = region.name;
                if (regionBar) regionBar.style.width = `${region.performance}%`;
            }
        });
    }
    
    // Update uptime today
    if (data.uptimeToday) {
        const uptimePercentage = document.querySelector('.uptime-percentage');
        const uptimeCircle = document.querySelector('.uptime-circle');
        
        if (uptimePercentage) {
            uptimePercentage.textContent = `${data.uptimeToday}%`;
        }
        
        if (uptimeCircle) {
            // Update the border color to reflect the uptime percentage
            uptimeCircle.style.borderColor = '#00c853';
            uptimeCircle.style.borderWidth = '15px';
        }
    }
    
    // Update outages bar chart
    if (data.outagesByWeek) {
        const outageBarItems = document.querySelectorAll('.outage-bar');
        const maxOutage = Math.max(...data.outagesByWeek.map(item => item.count));
        
        data.outagesByWeek.forEach((outage, index) => {
            if (index < outageBarItems.length) {
                const barHeight = (outage.count / maxOutage) * 100;
                outageBarItems[index].style.height = `${barHeight}px`;
            }
        });
    }
    
    // Update outages radar chart
    if (data.outagesRadar) {
        const outagesRadarChartEl = document.getElementById('outages-radar-chart');
        if (outagesRadarChartEl && outagesRadarChartEl.getContext) {
            // Clear any existing chart
            if (window.outagesRadarChart) {
                window.outagesRadarChart.destroy();
            }
            
            // Create new chart
            window.outagesRadarChart = new Chart(outagesRadarChartEl, {
                type: 'radar',
                data: {
                    labels: data.outagesRadar.labels,
                    datasets: [
                        {
                            label: 'Current',
                            data: data.outagesRadar.datasets[0].data,
                            backgroundColor: 'rgba(26, 35, 126, 0.2)',
                            borderColor: '#1a237e',
                            pointBackgroundColor: '#1a237e',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#1a237e'
                        },
                        {
                            label: 'Previous',
                            data: data.outagesRadar.datasets[1].data,
                            backgroundColor: 'rgba(0, 200, 83, 0.2)',
                            borderColor: '#00c853',
                            pointBackgroundColor: '#00c853',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#00c853'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    elements: {
                        line: {
                            borderWidth: 2
                        }
                    },
                    scales: {
                        r: {
                            angleLines: {
                                color: '#e0e0e0'
                            },
                            grid: {
                                color: '#e0e0e0'
                            },
                            pointLabels: {
                                color: '#333'
                            }
                        }
                    }
                }
            });
        }
    }
    
    // Update visibility impact score
    if (data.visibilityImpact) {
        const visibilityRadarChartEl = document.getElementById('visibility-radar-chart');
        if (visibilityRadarChartEl && visibilityRadarChartEl.getContext) {
            // Clear any existing chart
            if (window.visibilityRadarChart) {
                window.visibilityRadarChart.destroy();
            }
            
            // Create new chart
            window.visibilityRadarChart = new Chart(visibilityRadarChartEl, {
                type: 'radar',
                data: {
                    labels: data.visibilityImpact.labels,
                    datasets: [
                        {
                            label: 'Current',
                            data: data.visibilityImpact.datasets[0].data,
                            backgroundColor: 'rgba(26, 35, 126, 0.2)',
                            borderColor: '#1a237e',
                            pointBackgroundColor: '#1a237e',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#1a237e'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    elements: {
                        line: {
                            borderWidth: 2
                        }
                    },
                    scales: {
                        r: {
                            angleLines: {
                                color: '#e0e0e0'
                            },
                            grid: {
                                color: '#e0e0e0'
                            },
                            pointLabels: {
                                color: '#333'
                            },
                            suggestedMin: 0,
                            suggestedMax: 100
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
}

// Set up periodic data refresh (every 5 minutes)
setInterval(fetchAnalyticsData, 5 * 60 * 1000);