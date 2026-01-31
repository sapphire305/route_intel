/**
 * uiComponents.js
 * UI rendering functions for flight cards and components
 * UPDATED: Added airline logos and overnight flight handling
 */

import { formatAirportDisplay } from './airports.js';

// Airline logo URLs (using reliable CDN or fallback to badges)
const AIRLINE_LOGOS = {
    'UA': 'https://images.kiwi.com/airlines/64/UA.png', // United Airlines
    'AA': 'https://images.kiwi.com/airlines/64/AA.png', // American Airlines
    'DL': 'https://images.kiwi.com/airlines/64/DL.png', // Delta
    'WN': 'https://images.kiwi.com/airlines/64/WN.png', // Southwest
    'AS': 'https://images.kiwi.com/airlines/64/AS.png', // Alaska
    'B6': 'https://images.kiwi.com/airlines/64/B6.png', // JetBlue
};

/**
 * Get airline logo HTML
 * @param {string} carrierCode - IATA carrier code
 * @returns {string} HTML for airline logo or badge
 */
function getAirlineLogo(carrierCode) {
    const logoUrl = AIRLINE_LOGOS[carrierCode];
    if (logoUrl) {
        return `<img src="${logoUrl}" alt="${carrierCode}" class="airline-logo" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%230033A1%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22white%22 font-size=%2224%22 font-family=%22Arial%22 text-anchor=%22middle%22 dy=%22.3em%22>${carrierCode}</text></svg>';" />`;
    }
    // Fallback: show carrier code in badge
    return `<span class="carrier-code ${carrierCode === 'UA' ? 'ua' : ''}">${carrierCode}</span>`;
}

/**
 * Check if flight arrives next day (overnight flight)
 * @param {string} departureTime - Departure time HH:MM
 * @param {string} arrivalTime - Arrival time HH:MM
 * @returns {boolean} True if arrival is next day
 */
export function isOvernightFlight(departureTime, arrivalTime) {
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);

    const depTotalMinutes = depHours * 60 + depMinutes;
    const arrTotalMinutes = arrHours * 60 + arrMinutes;

    return arrTotalMinutes < depTotalMinutes;
}

/**
 * Render a schedule card
 * @param {Object} schedule - Normalized schedule object
 * @returns {HTMLElement} Card element
 */
export function renderScheduleCard(schedule) {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.setAttribute('role', 'article');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-flight-id', schedule.flightId);
    card.setAttribute('data-destination', schedule.destination);

    const carrierClass = schedule.carrierCode === 'UA' ? 'ua' : '';
    const overnight = isOvernightFlight(schedule.departureTime, schedule.arrivalTime);

    card.innerHTML = `
        <div class="flight-card-header">
            <div class="flight-info">
                <div class="flight-number">
                    ${getAirlineLogo(schedule.carrierCode)}
                    <span class="flight-number-text">Flight ${schedule.flightNumber}</span>
                </div>
            </div>
        </div>
        <div class="flight-route">
            <div class="airport">
                <div class="airport-code">${schedule.origin}</div>
                <div class="airport-time">${schedule.departureTime}</div>
            </div>
            <div class="route-arrow">→</div>
            <div class="airport">
                <div class="airport-code">${schedule.destination}</div>
                <div class="airport-time">
                    ${schedule.arrivalTime}
                    ${overnight ? '<span class="next-day-badge">+1</span>' : ''}
                </div>
            </div>
        </div>
        <div class="flight-details">
            <div class="detail-item">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${formatDuration(schedule.durationMinutes)}</span>
            </div>
            ${schedule.aircraft ? `
            <div class="detail-item">
                <span class="detail-label">Aircraft:</span>
                <span class="detail-value">${schedule.aircraft}</span>
            </div>
            ` : ''}
            <div class="detail-item">
                <span class="detail-label">Stops:</span>
                <span class="detail-value">${schedule.stops}</span>
            </div>
        </div>
    `;

    return card;
}

/**
 * Render an offer card
 * @param {Object} offer - Normalized offer object
 * @returns {HTMLElement} Card element
 */
export function renderOfferCard(offer) {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.setAttribute('role', 'article');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-offer-id', offer.offerId);

    // Check if all segments are UA
    const allUA = offer.carrierCodes.every(code => code === 'UA');
    const carrierClass = allUA ? 'ua' : '';

    // Format carrier display
    const carrierDisplay = offer.carrierCodes.join('/');
    const overnight = isOvernightFlight(offer.departureTime, offer.arrivalTime);

    // Determine if it's a connecting flight
    const isConnecting = offer.stops > 0;
    const flightType = isConnecting ? 'Connecting' : 'Nonstop';

    // Get primary carrier logo
    const primaryCarrier = offer.carrierCodes[0];

    card.innerHTML = `
        <div class="flight-card-header">
            <div class="flight-info">
                <div class="flight-number">
                    ${getAirlineLogo(primaryCarrier)}
                    <span class="flight-type-text">${flightType}</span>
                    ${offer.carrierCodes.length > 1 ? `<span class="multi-carrier">${carrierDisplay}</span>` : ''}
                </div>
            </div>
            <div class="price-tag">
                $${offer.totalPrice.toFixed(2)}
                <span class="price-currency">${offer.currency}</span>
            </div>
        </div>
        <div class="flight-route">
            <div class="airport">
                <div class="airport-code">${offer.origin}</div>
                <div class="airport-time">${offer.departureTime}</div>
            </div>
            <div class="route-arrow">→</div>
            <div class="airport">
                <div class="airport-code">${offer.destination}</div>
                <div class="airport-time">
                    ${offer.arrivalTime}
                    ${overnight ? '<span class="next-day-badge">+1</span>' : ''}
                </div>
            </div>
        </div>
        <div class="flight-details">
            <div class="detail-item">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${formatDuration(offer.durationMinutes)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Stops:</span>
                <span class="detail-value">${offer.stops}</span>
            </div>
            ${isConnecting ? `
            <div class="detail-item">
                <span class="detail-label">Segments:</span>
                <span class="detail-value">${offer.segments.length}</span>
            </div>
            ` : ''}
        </div>
    `;

    return card;
}

/**
 * Render empty state message
 * @param {string} message - Message to display
 * @returns {HTMLElement} Empty state element
 */
export function renderEmptyState(message = 'No flights match your filters.') {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `<p>${message}</p>`;
    return emptyState;
}

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "4h 15m")
 */
export function formatDuration(minutes) {
    if (!minutes || isNaN(minutes)) {
        return 'N/A';
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins}m`;
    } else if (mins === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${mins}m`;
    }
}

/**
 * Show loading state
 * @param {HTMLElement} loadingElement - Loading indicator element
 * @param {HTMLElement} buttonElement - Search button element
 */
export function showLoading(loadingElement, buttonElement) {
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
    if (buttonElement) {
        buttonElement.disabled = true;
    }
}

/**
 * Hide loading state
 * @param {HTMLElement} loadingElement - Loading indicator element
 * @param {HTMLElement} buttonElement - Search button element
 */
export function hideLoading(loadingElement, buttonElement) {
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    if (buttonElement) {
        buttonElement.disabled = false;
    }
}

/**
 * Show error message
 * @param {HTMLElement} errorElement - Error message element
 * @param {string} message - Error message to display
 */
export function showError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.setAttribute('role', 'alert');
    }
}

/**
 * Hide error message
 * @param {HTMLElement} errorElement - Error message element
 */
export function hideError(errorElement) {
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        errorElement.removeAttribute('role');
    }
}

/**
 * Update results count display
 * @param {HTMLElement} countElement - Results count element
 * @param {number} count - Number of results
 * @param {string} mode - Current mode ('schedules' or 'offers')
 */
export function updateResultsCount(countElement, count, mode) {
    if (countElement) {
        const itemType = mode === 'schedules' ? 'flight' : 'offer';
        const itemTypePlural = mode === 'schedules' ? 'flights' : 'offers';
        const text = count === 1 ? `${count} ${itemType}` : `${count} ${itemTypePlural}`;
        countElement.textContent = text;
    }
}

/**
 * Clear results container
 * @param {HTMLElement} container - Results container element
 */
export function clearResults(container) {
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * Render results to container
 * @param {HTMLElement} container - Results container element
 * @param {Array} results - Array of flight/offer objects
 * @param {string} mode - Current mode ('schedules' or 'offers')
 */
export function renderResults(container, results, mode) {
    clearResults(container);

    if (!results || results.length === 0) {
        container.appendChild(renderEmptyState());
        return;
    }

    results.forEach(result => {
        const card = mode === 'schedules'
            ? renderScheduleCard(result)
            : renderOfferCard(result);
        container.appendChild(card);
    });
}

/**
 * Validate time range
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {boolean} True if valid
 */
export function isValidTimeRange(startTime, endTime) {
    if (!startTime || !endTime) {
        return true; // Allow empty values
    }

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    return end >= start;
}

/**
 * Convert time string to minutes since midnight
 * @param {string} time - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
export function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Check if a time falls within a range
 * UPDATED: Now handles overnight flights where arrival time can be next day
 * @param {string} time - Time to check (HH:MM)
 * @param {string} startTime - Range start (HH:MM)
 * @param {string} endTime - Range end (HH:MM)
 * @param {boolean} allowNextDay - If true, allows time to be "tomorrow" for overnight flights
 * @returns {boolean} True if time is within range
 */
export function isTimeInRange(time, startTime, endTime, allowNextDay = false) {
    if (!time || !startTime || !endTime) {
        return true;
    }

    const timeMinutes = timeToMinutes(time);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Normal case: simple range check
    if (startMinutes <= endMinutes) {
        return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
    } else {
        // Range crosses midnight (e.g., 22:00 to 06:00)
        // This means we're looking for times either >= start OR <= end
        return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    }
}

/**
 * Check if arrival time is in range, accounting for overnight flights
 * @param {string} departureTime - Departure time (HH:MM)
 * @param {string} arrivalTime - Arrival time (HH:MM)
 * @param {string} filterStart - Filter start time (HH:MM)
 * @param {string} filterEnd - Filter end time (HH:MM)
 * @returns {boolean} True if arrival time matches filter
 */
export function isArrivalTimeInRange(departureTime, arrivalTime, filterStart, filterEnd) {
    if (!arrivalTime || !filterStart || !filterEnd) {
        return true;
    }

    const overnight = isOvernightFlight(departureTime, arrivalTime);

    // For overnight flights, we need special handling
    if (overnight) {
        // If the flight lands next day, we still filter based on time-of-day
        // This is intentional: users filtering for "06:00-12:00" arrivals
        // want morning arrivals regardless of which day they land
        return isTimeInRange(arrivalTime, filterStart, filterEnd, true);
    } else {
        // Normal same-day flight
        return isTimeInRange(arrivalTime, filterStart, filterEnd, false);
    }
}
