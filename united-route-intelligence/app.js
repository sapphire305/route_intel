/**
 * app.js
 * Main application logic for United Route Intelligence Map
 * PATCHED VERSION - Includes fixes for edge cases and issues
 */

import { getAirport, isValidAirport } from './airports.js';
import { fetchSchedules, fetchOffers } from './dataService.js';
import {
    renderResults,
    updateResultsCount,
    showLoading,
    hideLoading,
    showError,
    hideError,
    isTimeInRange,
    isArrivalTimeInRange
} from './uiComponents.js';

/* ========================================
   STATE MANAGEMENT
   ======================================== */

const state = {
    currentMode: 'schedules', // 'schedules' or 'offers'
    currentResults: [],
    filteredResults: [],
    map: null,
    markers: {},
    routeLine: null,
    mapInitialized: false
};

/* ========================================
   DOM ELEMENTS
   ======================================== */

const elements = {
    // Mode switching
    modeSchedulesBtn: document.getElementById('mode-schedules'),
    modeOffersBtn: document.getElementById('mode-offers'),

    // Form inputs
    form: document.getElementById('search-form'),
    originInput: document.getElementById('origin-input'),
    destinationInput: document.getElementById('destination-input'),
    dateInput: document.getElementById('date-input'),
    depTimeStart: document.getElementById('dep-time-start'),
    depTimeEnd: document.getElementById('dep-time-end'),
    arrTimeStart: document.getElementById('arr-time-start'),
    arrTimeEnd: document.getElementById('arr-time-end'),
    unitedOnlyFilter: document.getElementById('united-only-filter'),
    sortSelect: document.getElementById('sort-select'),

    // UI elements
    searchBtn: document.getElementById('search-btn'),
    loadingIndicator: document.getElementById('loading-indicator'),
    errorMessage: document.getElementById('error-message'),
    resultsContainer: document.getElementById('results-container'),
    resultsCount: document.getElementById('results-count'),
    sortGroup: document.getElementById('sort-group'),
    destinationRequired: document.getElementById('destination-required'),
    destinationOptional: document.getElementById('destination-optional'),

    // Map
    mapElement: document.getElementById('map'),
    legendModeText: document.getElementById('legend-mode-text')
};

/* ========================================
   INITIALIZATION
   ======================================== */

/**
 * Initialize the application
 */
function init() {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    elements.dateInput.value = tomorrow.toISOString().split('T')[0];

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    elements.dateInput.setAttribute('min', today);

    // Initialize map when Leaflet is ready
    initMap();

    // Set up event listeners
    setupEventListeners();

    console.log('United Route Intelligence Map initialized');
}

/**
 * Initialize Leaflet map
 * FIX: Added check for Leaflet availability and retry mechanism
 */
function initMap() {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.warn('Leaflet not yet loaded, retrying in 100ms...');
        setTimeout(initMap, 100);
        return;
    }

    try {
        // Create map centered on US
        state.map = L.map('map').setView([39.8283, -98.5795], 4);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(state.map);

        state.mapInitialized = true;
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
        showError(elements.errorMessage, 'Failed to initialize map. Please refresh the page.');
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Mode switching
    elements.modeSchedulesBtn.addEventListener('click', () => switchMode('schedules'));
    elements.modeOffersBtn.addEventListener('click', () => switchMode('offers'));

    // Form submission
    elements.form.addEventListener('submit', handleSearch);

    // FIX: Input transformations with validation
    elements.originInput.addEventListener('input', (e) => {
        // Only allow letters and limit to 3 characters
        e.target.value = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().substring(0, 3);
    });

    elements.destinationInput.addEventListener('input', (e) => {
        // Only allow letters and limit to 3 characters
        e.target.value = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().substring(0, 3);
    });

    // Filter changes (re-filter existing results)
    elements.depTimeStart.addEventListener('change', applyFilters);
    elements.depTimeEnd.addEventListener('change', applyFilters);
    elements.arrTimeStart.addEventListener('change', applyFilters);
    elements.arrTimeEnd.addEventListener('change', applyFilters);
    elements.unitedOnlyFilter.addEventListener('change', applyFilters);

    // Sort changes (offers mode only)
    elements.sortSelect.addEventListener('change', applySorting);
}

/* ========================================
   MODE SWITCHING
   ======================================== */

/**
 * Switch between schedules and offers modes
 * @param {string} mode - 'schedules' or 'offers'
 */
function switchMode(mode) {
    if (state.currentMode === mode) return;

    state.currentMode = mode;

    // Update UI
    if (mode === 'schedules') {
        elements.modeSchedulesBtn.classList.add('active');
        elements.modeSchedulesBtn.setAttribute('aria-pressed', 'true');
        elements.modeOffersBtn.classList.remove('active');
        elements.modeOffersBtn.setAttribute('aria-pressed', 'false');

        // Hide sort dropdown, make destination optional
        elements.sortGroup.style.display = 'none';
        elements.destinationRequired.style.display = 'none';
        elements.destinationOptional.style.display = 'inline';
        elements.destinationInput.removeAttribute('required');

        elements.legendModeText.textContent = 'Schedules';
    } else {
        elements.modeOffersBtn.classList.add('active');
        elements.modeOffersBtn.setAttribute('aria-pressed', 'true');
        elements.modeSchedulesBtn.classList.remove('active');
        elements.modeSchedulesBtn.setAttribute('aria-pressed', 'false');

        // Show sort dropdown, make destination required
        elements.sortGroup.style.display = 'block';
        elements.destinationRequired.style.display = 'inline';
        elements.destinationOptional.style.display = 'none';
        elements.destinationInput.setAttribute('required', 'required');

        elements.legendModeText.textContent = 'Offers';
    }

    // Clear previous results
    state.currentResults = [];
    state.filteredResults = [];
    clearMap();
    renderResults(elements.resultsContainer, [], mode);
    updateResultsCount(elements.resultsCount, 0, mode);

    console.log(`Switched to ${mode} mode`);
}

/* ========================================
   SEARCH FUNCTIONALITY
   ======================================== */

/**
 * Handle search form submission
 * @param {Event} e - Submit event
 */
async function handleSearch(e) {
    e.preventDefault();

    // Hide previous errors
    hideError(elements.errorMessage);

    // FIX: Validate inputs with better trimming
    const origin = elements.originInput.value.trim().toUpperCase();
    const destination = elements.destinationInput.value.trim().toUpperCase();
    const date = elements.dateInput.value;

    if (!origin) {
        showError(elements.errorMessage, 'Please enter an origin airport.');
        elements.originInput.focus();
        return;
    }

    if (origin.length !== 3) {
        showError(elements.errorMessage, 'Origin airport code must be 3 letters.');
        elements.originInput.focus();
        return;
    }

    if (!isValidAirport(origin)) {
        showError(elements.errorMessage, `Invalid origin airport code: ${origin}. Please check the code and try again.`);
        elements.originInput.focus();
        return;
    }

    if (state.currentMode === 'offers' && !destination) {
        showError(elements.errorMessage, 'Destination is required for Offers mode.');
        elements.destinationInput.focus();
        return;
    }

    if (destination && destination.length !== 3) {
        showError(elements.errorMessage, 'Destination airport code must be 3 letters.');
        elements.destinationInput.focus();
        return;
    }

    if (destination && !isValidAirport(destination)) {
        showError(elements.errorMessage, `Invalid destination airport code: ${destination}. Please check the code and try again.`);
        elements.destinationInput.focus();
        return;
    }

    if (origin && destination && origin === destination) {
        showError(elements.errorMessage, 'Origin and destination cannot be the same.');
        elements.destinationInput.focus();
        return;
    }

    if (!date) {
        showError(elements.errorMessage, 'Please select a date.');
        elements.dateInput.focus();
        return;
    }

    // FIX: Validate date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showError(elements.errorMessage, 'Please select a date that is today or in the future.');
        elements.dateInput.focus();
        return;
    }

    // Check if map is initialized
    if (!state.mapInitialized) {
        showError(elements.errorMessage, 'Map is still loading. Please wait a moment and try again.');
        return;
    }

    // Show loading state
    showLoading(elements.loadingIndicator, elements.searchBtn);

    try {
        // Fetch data based on mode
        let results;
        if (state.currentMode === 'schedules') {
            results = await fetchSchedules({ origin, destination, date });
        } else {
            results = await fetchOffers({ origin, destination, date, adults: 1 });
        }

        // Store results
        state.currentResults = results;

        // Apply filters
        applyFilters();

        // Update map
        updateMap(origin, destination, results);

        console.log(`Found ${results.length} results for ${origin} to ${destination || 'all destinations'}`);

    } catch (error) {
        console.error('Search error:', error);
        showError(elements.errorMessage, error.message || 'An error occurred while searching. Please try again.');
        state.currentResults = [];
        state.filteredResults = [];
        renderResults(elements.resultsContainer, [], state.currentMode);
        updateResultsCount(elements.resultsCount, 0, state.currentMode);
    } finally {
        hideLoading(elements.loadingIndicator, elements.searchBtn);
    }
}

/* ========================================
   FILTERING
   ======================================== */

/**
 * Apply filters to current results
 */
function applyFilters() {
    if (state.currentResults.length === 0) {
        return;
    }

    let filtered = [...state.currentResults];
    const originalCount = filtered.length;

    // Get filter values
    const depTimeStart = elements.depTimeStart.value;
    const depTimeEnd = elements.depTimeEnd.value;
    const arrTimeStart = elements.arrTimeStart.value;
    const arrTimeEnd = elements.arrTimeEnd.value;
    const unitedOnly = elements.unitedOnlyFilter.checked;

    // Apply departure time filter
    if (depTimeStart && depTimeEnd) {
        filtered = filtered.filter(item =>
            isTimeInRange(item.departureTime, depTimeStart, depTimeEnd)
        );
    }

    // Apply arrival time filter (handles overnight flights)
    if (arrTimeStart && arrTimeEnd) {
        filtered = filtered.filter(item =>
            isArrivalTimeInRange(item.departureTime, item.arrivalTime, arrTimeStart, arrTimeEnd)
        );
    }

    // Apply United-only filter
    if (unitedOnly) {
        filtered = filtered.filter(item => {
            if (state.currentMode === 'schedules') {
                return item.carrierCode === 'UA';
            } else {
                // For offers, check if all carrier codes are UA
                return item.carrierCodes && item.carrierCodes.every(code => code === 'UA');
            }
        });
    }

    // Store filtered results
    state.filteredResults = filtered;

    // FIX: Show helpful message if filters eliminated all results
    if (filtered.length === 0 && originalCount > 0) {
        console.log('Filters eliminated all results');
    }

    // Apply sorting (for offers mode)
    if (state.currentMode === 'offers') {
        applySorting();
    } else {
        // Render results
        renderResults(elements.resultsContainer, state.filteredResults, state.currentMode);
        updateResultsCount(elements.resultsCount, state.filteredResults.length, state.currentMode);
    }
}

/* ========================================
   SORTING (Offers Mode)
   ======================================== */

/**
 * Apply sorting to filtered results (offers mode only)
 */
function applySorting() {
    if (state.currentMode !== 'offers') {
        return;
    }

    // FIX: Handle case where filteredResults might be empty
    if (!state.filteredResults || state.filteredResults.length === 0) {
        renderResults(elements.resultsContainer, [], state.currentMode);
        updateResultsCount(elements.resultsCount, 0, state.currentMode);
        return;
    }

    const sortBy = elements.sortSelect.value;
    const sorted = [...state.filteredResults];

    switch (sortBy) {
        case 'price':
            sorted.sort((a, b) => a.totalPrice - b.totalPrice);
            break;
        case 'departure':
            sorted.sort((a, b) => {
                const aMinutes = timeToMinutes(a.departureTime);
                const bMinutes = timeToMinutes(b.departureTime);
                return aMinutes - bMinutes;
            });
            break;
        case 'duration':
            sorted.sort((a, b) => a.durationMinutes - b.durationMinutes);
            break;
    }

    // Render sorted results
    renderResults(elements.resultsContainer, sorted, state.currentMode);
    updateResultsCount(elements.resultsCount, sorted.length, state.currentMode);
}

/**
 * Convert time string to minutes since midnight
 * @param {string} time - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(time) {
    if (!time || typeof time !== 'string') return 0;
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
}

/* ========================================
   MAP MANAGEMENT
   ======================================== */

/**
 * Update map with markers and routes
 * @param {string} origin - Origin airport code
 * @param {string} destination - Destination airport code (optional)
 * @param {Array} results - Flight results
 */
function updateMap(origin, destination, results) {
    // Clear existing markers and routes
    clearMap();

    // Get origin airport
    const originAirport = getAirport(origin);
    if (!originAirport) {
        console.warn(`Origin airport ${origin} not found in database`);
        return;
    }

    // Add origin marker
    const originMarker = L.marker([originAirport.lat, originAirport.lon], {
        icon: createCustomIcon('green')
    }).addTo(state.map);

    originMarker.bindPopup(`
        <strong>${originAirport.iata}</strong><br>
        ${originAirport.name}<br>
        ${originAirport.city}, ${originAirport.state}
    `);

    state.markers.origin = originMarker;

    // If destination is provided
    if (destination) {
        const destAirport = getAirport(destination);
        if (destAirport) {
            addDestinationMarker(destAirport, origin, false); // FIX: Don't add click handler in offers mode
            fitMapToBounds([originAirport, destAirport]);
        }
    } else if (state.currentMode === 'schedules' && results.length > 0) {
        // In schedules mode without destination, show all destinations from results
        const destinations = [...new Set(results.map(r => r.destination))];
        const destAirports = destinations
            .map(code => getAirport(code))
            .filter(airport => airport !== null);

        destAirports.forEach(destAirport => {
            // FIX: Add click handler only in schedules mode without a specified destination
            const marker = addDestinationMarker(destAirport, origin, true);
        });

        // Fit map to show all airports
        if (destAirports.length > 0) {
            fitMapToBounds([originAirport, ...destAirports]);
        } else {
            // FIX: Handle case with only origin
            state.map.setView([originAirport.lat, originAirport.lon], 6);
        }
    } else {
        // Just center on origin
        state.map.setView([originAirport.lat, originAirport.lon], 6);
    }
}

/**
 * Add destination marker to map
 * @param {Object} airport - Airport object
 * @param {string} origin - Origin airport code
 * @param {boolean} addClickHandler - Whether to add click handler for filtering
 * @returns {L.Marker} Leaflet marker
 */
function addDestinationMarker(airport, origin, addClickHandler = false) {
    const marker = L.marker([airport.lat, airport.lon], {
        icon: createCustomIcon('blue')
    }).addTo(state.map);

    marker.bindPopup(`
        <strong>${airport.iata}</strong><br>
        ${airport.name}<br>
        ${airport.city}, ${airport.state}
    `);

    // FIX: Only add click handler if explicitly requested (schedules mode with no destination)
    if (addClickHandler) {
        marker.on('click', () => {
            filterByDestination(airport.iata);
        });
    }

    // Store marker
    if (!state.markers.destinations) {
        state.markers.destinations = {};
    }
    state.markers.destinations[airport.iata] = marker;

    // Draw route line
    const originAirport = getAirport(origin);
    if (originAirport) {
        const routeLine = L.polyline(
            [[originAirport.lat, originAirport.lon], [airport.lat, airport.lon]],
            {
                color: '#0033A1',
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 10'
            }
        ).addTo(state.map);

        if (!state.markers.routeLines) {
            state.markers.routeLines = [];
        }
        state.markers.routeLines.push(routeLine);
    }

    return marker;
}

/**
 * Create custom map marker icon
 * @param {string} color - Color name ('green' or 'blue')
 * @returns {L.Icon} Leaflet icon
 */
function createCustomIcon(color) {
    const iconUrl = color === 'green'
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';

    return L.icon({
        iconUrl: iconUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

/**
 * Fit map bounds to show all airports
 * FIX: Handle edge case with single airport
 * @param {Array} airports - Array of airport objects
 */
function fitMapToBounds(airports) {
    if (!airports || airports.length === 0) return;

    if (airports.length === 1) {
        // FIX: If only one airport, just center on it
        state.map.setView([airports[0].lat, airports[0].lon], 6);
        return;
    }

    const bounds = L.latLngBounds(
        airports.map(airport => [airport.lat, airport.lon])
    );

    state.map.fitBounds(bounds, { padding: [50, 50] });
}

/**
 * Clear all markers and routes from map
 * FIX: More thorough cleanup to prevent memory leaks
 */
function clearMap() {
    if (!state.map) return;

    // Remove origin marker
    if (state.markers.origin) {
        state.map.removeLayer(state.markers.origin);
        state.markers.origin = null;
    }

    // Remove destination markers
    if (state.markers.destinations) {
        Object.values(state.markers.destinations).forEach(marker => {
            if (marker) {
                marker.off(); // FIX: Remove event listeners
                state.map.removeLayer(marker);
            }
        });
        state.markers.destinations = {};
    }

    // Remove route lines
    if (state.markers.routeLines) {
        state.markers.routeLines.forEach(line => {
            if (line) {
                state.map.removeLayer(line);
            }
        });
        state.markers.routeLines = [];
    }
}

/**
 * Filter results by destination (schedules mode)
 * @param {string} destinationCode - Destination airport code
 */
function filterByDestination(destinationCode) {
    if (state.currentMode !== 'schedules') return;

    // Filter current results
    const filtered = state.filteredResults.filter(
        item => item.destination.toUpperCase() === destinationCode.toUpperCase()
    );

    // Render filtered results
    renderResults(elements.resultsContainer, filtered, state.currentMode);
    updateResultsCount(elements.resultsCount, filtered.length, state.currentMode);

    console.log(`Filtered to destination: ${destinationCode} (${filtered.length} results)`);
}

/* ========================================
   START APPLICATION
   ======================================== */

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
