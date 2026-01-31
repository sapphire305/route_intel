/**
 * airports.js
 * Airport database and helper functions
 * Contains major US airports with coordinates, names, and cities
 */

// Airport database with latitude/longitude and metadata
export const AIRPORTS = {
    // United Hubs
    'EWR': {
        iata: 'EWR',
        name: 'Newark Liberty International Airport',
        city: 'Newark',
        state: 'NJ',
        country: 'USA',
        lat: 40.6925,
        lon: -74.1687
    },
    'SFO': {
        iata: 'SFO',
        name: 'San Francisco International Airport',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        lat: 37.6213,
        lon: -122.3790
    },
    'ORD': {
        iata: 'ORD',
        name: "O'Hare International Airport",
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        lat: 41.9742,
        lon: -87.9073
    },
    'IAH': {
        iata: 'IAH',
        name: 'George Bush Intercontinental Airport',
        city: 'Houston',
        state: 'TX',
        country: 'USA',
        lat: 29.9902,
        lon: -95.3368
    },
    'DEN': {
        iata: 'DEN',
        name: 'Denver International Airport',
        city: 'Denver',
        state: 'CO',
        country: 'USA',
        lat: 39.8561,
        lon: -104.6737
    },
    'IAD': {
        iata: 'IAD',
        name: 'Washington Dulles International Airport',
        city: 'Washington',
        state: 'DC',
        country: 'USA',
        lat: 38.9531,
        lon: -77.4565
    },
    'LAX': {
        iata: 'LAX',
        name: 'Los Angeles International Airport',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        lat: 33.9416,
        lon: -118.4085
    },

    // Additional Major US Airports
    'JFK': {
        iata: 'JFK',
        name: 'John F. Kennedy International Airport',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        lat: 40.6413,
        lon: -73.7781
    },
    'ATL': {
        iata: 'ATL',
        name: 'Hartsfield-Jackson Atlanta International Airport',
        city: 'Atlanta',
        state: 'GA',
        country: 'USA',
        lat: 33.6407,
        lon: -84.4277
    },
    'BOS': {
        iata: 'BOS',
        name: 'Logan International Airport',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        lat: 42.3656,
        lon: -71.0096
    },
    'SEA': {
        iata: 'SEA',
        name: 'Seattle-Tacoma International Airport',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        lat: 47.4502,
        lon: -122.3088
    },
    'MIA': {
        iata: 'MIA',
        name: 'Miami International Airport',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        lat: 25.7959,
        lon: -80.2870
    },
    'MCO': {
        iata: 'MCO',
        name: 'Orlando International Airport',
        city: 'Orlando',
        state: 'FL',
        country: 'USA',
        lat: 28.4312,
        lon: -81.3081
    },
    'PHX': {
        iata: 'PHX',
        name: 'Phoenix Sky Harbor International Airport',
        city: 'Phoenix',
        state: 'AZ',
        country: 'USA',
        lat: 33.4352,
        lon: -112.0101
    },
    'LAS': {
        iata: 'LAS',
        name: 'Harry Reid International Airport',
        city: 'Las Vegas',
        state: 'NV',
        country: 'USA',
        lat: 36.0840,
        lon: -115.1537
    },
    'DFW': {
        iata: 'DFW',
        name: 'Dallas/Fort Worth International Airport',
        city: 'Dallas',
        state: 'TX',
        country: 'USA',
        lat: 32.8998,
        lon: -97.0403
    },
    'MSP': {
        iata: 'MSP',
        name: 'Minneapolis-St Paul International Airport',
        city: 'Minneapolis',
        state: 'MN',
        country: 'USA',
        lat: 44.8848,
        lon: -93.2223
    },
    'DTW': {
        iata: 'DTW',
        name: 'Detroit Metropolitan Wayne County Airport',
        city: 'Detroit',
        state: 'MI',
        country: 'USA',
        lat: 42.2162,
        lon: -83.3554
    },
    'PHL': {
        iata: 'PHL',
        name: 'Philadelphia International Airport',
        city: 'Philadelphia',
        state: 'PA',
        country: 'USA',
        lat: 39.8729,
        lon: -75.2437
    },
    'CLT': {
        iata: 'CLT',
        name: 'Charlotte Douglas International Airport',
        city: 'Charlotte',
        state: 'NC',
        country: 'USA',
        lat: 35.2144,
        lon: -80.9473
    },
    'SAN': {
        iata: 'SAN',
        name: 'San Diego International Airport',
        city: 'San Diego',
        state: 'CA',
        country: 'USA',
        lat: 32.7338,
        lon: -117.1933
    },
    'PDX': {
        iata: 'PDX',
        name: 'Portland International Airport',
        city: 'Portland',
        state: 'OR',
        country: 'USA',
        lat: 45.5898,
        lon: -122.5951
    },
    'SLC': {
        iata: 'SLC',
        name: 'Salt Lake City International Airport',
        city: 'Salt Lake City',
        state: 'UT',
        country: 'USA',
        lat: 40.7899,
        lon: -111.9791
    },
    'AUS': {
        iata: 'AUS',
        name: 'Austin-Bergstrom International Airport',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        lat: 30.1945,
        lon: -97.6699
    },
    'STL': {
        iata: 'STL',
        name: 'St. Louis Lambert International Airport',
        city: 'St. Louis',
        state: 'MO',
        country: 'USA',
        lat: 38.7499,
        lon: -90.3697
    }
};

/**
 * Get airport data by IATA code
 * @param {string} iata - 3-letter IATA airport code
 * @returns {Object|null} Airport object or null if not found
 */
export function getAirport(iata) {
    if (!iata || typeof iata !== 'string') {
        return null;
    }

    const code = iata.trim().toUpperCase();
    return AIRPORTS[code] || null;
}

/**
 * Search airports by query (matches IATA code, city, or name)
 * @param {string} query - Search query
 * @returns {Array} Array of matching airport objects
 */
export function searchAirports(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results = [];

    for (const [iata, airport] of Object.entries(AIRPORTS)) {
        if (
            iata.toLowerCase().includes(searchTerm) ||
            airport.name.toLowerCase().includes(searchTerm) ||
            airport.city.toLowerCase().includes(searchTerm) ||
            airport.state.toLowerCase().includes(searchTerm)
        ) {
            results.push(airport);
        }
    }

    return results;
}

/**
 * Validate if an IATA code exists in the database
 * @param {string} iata - 3-letter IATA airport code
 * @returns {boolean} True if airport exists
 */
export function isValidAirport(iata) {
    return getAirport(iata) !== null;
}

/**
 * Get all airport IATA codes
 * @returns {Array<string>} Array of all IATA codes
 */
export function getAllAirportCodes() {
    return Object.keys(AIRPORTS);
}

/**
 * Format airport for display
 * @param {string} iata - 3-letter IATA airport code
 * @returns {string} Formatted string like "SFO - San Francisco, CA"
 */
export function formatAirportDisplay(iata) {
    const airport = getAirport(iata);
    if (!airport) {
        return iata;
    }
    return `${airport.iata} - ${airport.city}, ${airport.state}`;
}

/**
 * Calculate great circle distance between two airports (in miles)
 * Uses the Haversine formula
 * @param {string} iata1 - First airport IATA code
 * @param {string} iata2 - Second airport IATA code
 * @returns {number|null} Distance in miles, or null if airports not found
 */
export function calculateDistance(iata1, iata2) {
    const airport1 = getAirport(iata1);
    const airport2 = getAirport(iata2);

    if (!airport1 || !airport2) {
        return null;
    }

    const R = 3959; // Earth's radius in miles
    const lat1 = airport1.lat * Math.PI / 180;
    const lat2 = airport2.lat * Math.PI / 180;
    const dLat = (airport2.lat - airport1.lat) * Math.PI / 180;
    const dLon = (airport2.lon - airport1.lon) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
}
