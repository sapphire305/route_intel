/**
 * dataService.js
 * Data service layer that abstracts data fetching
 * Supports both MOCK mode (default) and LIVE mode for real API integration
 */

// Configuration: Set to 'MOCK' or 'LIVE'
const DATA_MODE = 'MOCK';

/**
 * Fetch flight schedules
 * @param {Object} params - Search parameters
 * @param {string} params.origin - Origin airport IATA code (required)
 * @param {string} [params.destination] - Destination airport IATA code (optional)
 * @param {string} params.date - Flight date in YYYY-MM-DD format (required)
 * @returns {Promise<Array>} Array of normalized schedule objects
 */
export async function fetchSchedules({ origin, destination, date }) {
    if (DATA_MODE === 'MOCK') {
        return await fetchSchedulesMock({ origin, destination, date });
    } else {
        return await fetchSchedulesLive({ origin, destination, date });
    }
}

/**
 * Fetch flight offers (priced itineraries)
 * @param {Object} params - Search parameters
 * @param {string} params.origin - Origin airport IATA code (required)
 * @param {string} params.destination - Destination airport IATA code (required)
 * @param {string} params.date - Flight date in YYYY-MM-DD format (required)
 * @param {number} [params.adults=1] - Number of adult passengers
 * @returns {Promise<Array>} Array of normalized offer objects
 */
export async function fetchOffers({ origin, destination, date, adults = 1 }) {
    if (DATA_MODE === 'MOCK') {
        return await fetchOffersMock({ origin, destination, date, adults });
    } else {
        return await fetchOffersLive({ origin, destination, date, adults });
    }
}

/* ========================================
   MOCK MODE IMPLEMENTATIONS
   ======================================== */

/**
 * Fetch mock schedule data
 * @private
 */
async function fetchSchedulesMock({ origin, destination, date }) {
    try {
        // Simulate network delay
        await delay(500);

        // Load mock data from JSON file
        const response = await fetch('./mock-data/schedules.json');
        if (!response.ok) {
            throw new Error(`Failed to load mock schedules: ${response.statusText}`);
        }

        const data = await response.json();

        // Filter schedules based on search criteria
        let schedules = data.schedules || [];

        // Filter by origin
        if (origin) {
            schedules = schedules.filter(s => s.origin.toUpperCase() === origin.toUpperCase());
        }

        // Filter by destination (if provided)
        if (destination) {
            schedules = schedules.filter(s => s.destination.toUpperCase() === destination.toUpperCase());
        }

        // Filter by date (if provided)
        if (date) {
            schedules = schedules.filter(s => s.date === date);
        }

        // Normalize the data
        return schedules.map(normalizeSchedule);
    } catch (error) {
        console.error('Error fetching mock schedules:', error);
        throw new Error('Failed to load schedule data. Please try again.');
    }
}

/**
 * Fetch mock offer data
 * @private
 */
async function fetchOffersMock({ origin, destination, date, adults }) {
    try {
        // Simulate network delay
        await delay(800);

        // Load mock data from JSON file
        const response = await fetch('./mock-data/offers.json');
        if (!response.ok) {
            throw new Error(`Failed to load mock offers: ${response.statusText}`);
        }

        const data = await response.json();

        // Filter offers based on search criteria
        let offers = data.offers || [];

        // Filter by origin and destination
        if (origin && destination) {
            offers = offers.filter(o =>
                o.origin.toUpperCase() === origin.toUpperCase() &&
                o.destination.toUpperCase() === destination.toUpperCase()
            );
        }

        // Filter by date
        if (date) {
            offers = offers.filter(o => o.date === date);
        }

        // Normalize the data
        return offers.map(normalizeOffer);
    } catch (error) {
        console.error('Error fetching mock offers:', error);
        throw new Error('Failed to load offer data. Please try again.');
    }
}

/* ========================================
   LIVE MODE IMPLEMENTATIONS (Placeholders)
   ======================================== */

/**
 * Fetch live schedule data from real API
 * @private
 * TODO: Implement real API integration
 */
async function fetchSchedulesLive({ origin, destination, date }) {
    // TODO: Replace with actual API endpoint
    // Example: United Airlines Flight Schedules API
    // WARNING: NEVER expose API keys in frontend code!
    // Use a backend proxy server to make API calls securely

    /* EXAMPLE IMPLEMENTATION:

    const apiEndpoint = '/api/schedules'; // Your backend proxy endpoint

    const params = new URLSearchParams({
        origin: origin,
        date: date
    });

    if (destination) {
        params.append('destination', destination);
    }

    try {
        const response = await fetch(`${apiEndpoint}?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Normalize the API response to match internal format
        return data.schedules.map(normalizeSchedule);

    } catch (error) {
        console.error('Error fetching live schedules:', error);
        throw error;
    }
    */

    throw new Error('LIVE mode not yet implemented. Please use MOCK mode.');
}

/**
 * Fetch live offer data from real API
 * @private
 * TODO: Implement real API integration
 */
async function fetchOffersLive({ origin, destination, date, adults }) {
    // TODO: Replace with actual API endpoint
    // Example: United Airlines Flight Shopping API or Amadeus Flight Offers API
    // WARNING: NEVER expose API keys in frontend code!
    // Use a backend proxy server to make API calls securely

    /* EXAMPLE IMPLEMENTATION:

    const apiEndpoint = '/api/offers'; // Your backend proxy endpoint

    const requestBody = {
        origin: origin,
        destination: destination,
        departureDate: date,
        adults: adults,
        currencyCode: 'USD'
    };

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Normalize the API response to match internal format
        return data.offers.map(normalizeOffer);

    } catch (error) {
        console.error('Error fetching live offers:', error);
        throw error;
    }
    */

    throw new Error('LIVE mode not yet implemented. Please use MOCK mode.');
}

/* ========================================
   DATA NORMALIZATION FUNCTIONS
   ======================================== */

/**
 * Normalize schedule data to consistent internal format
 * @param {Object} schedule - Raw schedule object
 * @returns {Object} Normalized schedule object
 */
function normalizeSchedule(schedule) {
    // Calculate duration if not provided
    let durationMinutes = schedule.durationMinutes;
    if (!durationMinutes && schedule.departureTime && schedule.arrivalTime) {
        durationMinutes = calculateDuration(schedule.departureTime, schedule.arrivalTime);
    }

    return {
        flightId: schedule.flightId || `${schedule.carrierCode}${schedule.flightNumber}`,
        carrierCode: schedule.carrierCode,
        flightNumber: schedule.flightNumber,
        origin: schedule.origin.toUpperCase(),
        destination: schedule.destination.toUpperCase(),
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        durationMinutes: durationMinutes,
        date: schedule.date,
        aircraft: schedule.aircraft || null,
        stops: schedule.stops || 0
    };
}

/**
 * Normalize offer data to consistent internal format
 * @param {Object} offer - Raw offer object
 * @returns {Object} Normalized offer object
 */
function normalizeOffer(offer) {
    // Extract first segment for origin/destination/times
    const firstSegment = offer.segments && offer.segments.length > 0 ? offer.segments[0] : null;
    const lastSegment = offer.segments && offer.segments.length > 0 ? offer.segments[offer.segments.length - 1] : null;

    // Calculate total duration if not provided
    let durationMinutes = offer.durationMinutes;
    if (!durationMinutes && firstSegment && lastSegment) {
        durationMinutes = calculateDuration(firstSegment.departureTime, lastSegment.arrivalTime);
    }

    // Extract all carrier codes from segments
    const carrierCodes = offer.segments
        ? [...new Set(offer.segments.map(s => s.carrierCode))]
        : [offer.carrierCode];

    return {
        offerId: offer.offerId,
        totalPrice: parseFloat(offer.totalPrice),
        currency: offer.currency || 'USD',
        carrierCodes: carrierCodes,
        segments: offer.segments || [],
        departureTime: firstSegment ? firstSegment.departureTime : offer.departureTime,
        arrivalTime: lastSegment ? lastSegment.arrivalTime : offer.arrivalTime,
        durationMinutes: durationMinutes,
        origin: offer.origin.toUpperCase(),
        destination: offer.destination.toUpperCase(),
        date: offer.date,
        stops: offer.segments ? offer.segments.length - 1 : 0
    };
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

/**
 * Calculate flight duration in minutes
 * @param {string} departureTime - Departure time in HH:MM format
 * @param {string} arrivalTime - Arrival time in HH:MM format
 * @returns {number} Duration in minutes
 */
function calculateDuration(departureTime, arrivalTime) {
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);

    const depTotalMinutes = depHours * 60 + depMinutes;
    const arrTotalMinutes = arrHours * 60 + arrMinutes;

    let duration = arrTotalMinutes - depTotalMinutes;

    // Handle overnight flights (arrival is next day)
    if (duration < 0) {
        duration += 24 * 60;
    }

    return duration;
}

/**
 * Simulate network delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get current data mode
 * @returns {string} Current data mode ('MOCK' or 'LIVE')
 */
export function getDataMode() {
    return DATA_MODE;
}
