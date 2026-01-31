# United Route Intelligence Map

A single-page web application for exploring United Airlines flight schedules and offers with an interactive map interface. Built with vanilla HTML, CSS, and JavaScript—no frameworks required.

## Features

- **Two Data Modes**:
  - **Schedules Mode**: Browse flight schedules/timetables with flight numbers and times
  - **Offers Mode**: Search priced flight offers with sorting by price, departure time, or duration

- **Interactive Map**: Visualize routes with Leaflet.js, showing origin and destination airports with clickable markers

- **Advanced Filtering**:
  - Departure and arrival time range filters
  - United Airlines only toggle
  - Real-time client-side filtering

- **Responsive Design**: Works on desktop, tablet, and mobile devices

- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation support

- **Mock Data by Default**: Runs out-of-the-box without API keys, structured for easy real API integration later

## Project Structure

```
united-route-intelligence/
├── index.html              # Main HTML file
├── styles.css              # All styling
├── app.js                  # Main application logic
├── dataService.js          # Data layer (mock/live mode)
├── airports.js             # Airport database and helpers
├── uiComponents.js         # UI rendering functions
├── mock-data/
│   ├── schedules.json      # Mock flight schedules
│   └── offers.json         # Mock flight offers
└── README.md               # This file
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- VS Code with Live Server extension (recommended) OR any local web server

### Running Locally with VS Code Live Server

1. **Install VS Code** (if you haven't already):
   - Download from [https://code.visualstudio.com/](https://code.visualstudio.com/)

2. **Install Live Server Extension**:
   - Open VS Code
   - Go to Extensions (Cmd+Shift+X on Mac, Ctrl+Shift+X on Windows)
   - Search for "Live Server" by Ritwick Dey
   - Click Install

3. **Open the Project**:
   - Open VS Code
   - File → Open Folder → Select the `united-route-intelligence` folder

4. **Start Live Server**:
   - Right-click on `index.html` in the Explorer panel
   - Select "Open with Live Server"
   - The app will open in your default browser at `http://127.0.0.1:5500/`

5. **Start Using the App**:
   - Choose a mode (Schedules or Offers)
   - Enter origin airport (e.g., SFO)
   - Optionally enter destination (required for Offers mode)
   - Select a date
   - Adjust time filters as needed
   - Click "Search Flights"

### Running with Python HTTP Server

If you prefer Python:

```bash
# Python 3
cd united-route-intelligence
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

### Running with Node.js HTTP Server

If you prefer Node.js:

```bash
# Install http-server globally
npm install -g http-server

# Run server
cd united-route-intelligence
http-server -p 8000

# Then open http://localhost:8000 in your browser
```

## Using the Application

### Schedules Mode

1. Switch to "Schedules" mode using the header toggle
2. Enter an origin airport (e.g., SFO)
3. Optionally enter a destination (if blank, shows all destinations from that origin)
4. Select a date (use 2026-02-15 for mock data)
5. Apply time filters for departure and arrival windows
6. Toggle "United Only" to filter by carrier
7. Click "Search Flights"
8. Click destination markers on the map to filter results by that destination

### Offers Mode

1. Switch to "Offers" mode using the header toggle
2. Enter both origin and destination (required)
3. Select a date (use 2026-02-15 for mock data)
4. Apply time filters as needed
5. Choose a sort option (price, departure time, or duration)
6. Toggle "United Only" to show only UA flights
7. Click "Search Flights"

### Sample Queries (Mock Data)

Try these with date `2026-02-15`:

- **Schedules Mode**:
  - Origin: SFO (no destination) - Shows all flights from San Francisco
  - Origin: SFO, Destination: ORD - Shows SFO to Chicago flights
  - Origin: SFO, Destination: DEN - Shows SFO to Denver flights

- **Offers Mode**:
  - Origin: SFO, Destination: ORD - Shows priced offers
  - Origin: SFO, Destination: EWR - Shows cross-country offers
  - Origin: SFO, Destination: IAH - Shows flights to Houston

## Switching Between MOCK and LIVE Mode

### Current Mode: MOCK

By default, the app runs in **MOCK mode** and loads data from local JSON files. This allows you to test the app without any API keys or backend.

### Switching to LIVE Mode

**⚠️ IMPORTANT SECURITY NOTE**:

**NEVER expose real API keys in frontend JavaScript code!** API keys should always be kept secure on a backend server.

To enable LIVE mode for real API integration:

1. **Set up a backend proxy server** (Node.js, Python, etc.) that:
   - Securely stores your API keys
   - Provides endpoints like `/api/schedules` and `/api/offers`
   - Makes requests to the real APIs (United, Amadeus, etc.)
   - Returns data to your frontend

2. **Update `dataService.js`**:
   ```javascript
   // Change this line at the top of dataService.js
   const DATA_MODE = 'LIVE';  // Changed from 'MOCK'
   ```

3. **Implement the `fetchSchedulesLive()` and `fetchOffersLive()` functions** in `dataService.js`:
   - Replace the placeholder comments with actual fetch calls to your backend proxy
   - See the TODO comments in those functions for example implementations

4. **Test thoroughly** before deploying

### Recommended API Services

- **United Airlines API**: Check if United offers a developer API
- **Amadeus Flight API**: [https://developers.amadeus.com/](https://developers.amadeus.com/)
- **Sabre API**: [https://developer.sabre.com/](https://developer.sabre.com/)
- **Travelport API**: [https://developers.travelport.com/](https://developers.travelport.com/)

## Deploying for Free

### Option 1: GitHub Pages

1. **Create a GitHub repository**:
   ```bash
   cd united-route-intelligence
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/united-route-intelligence.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)
   - Click Save

3. **Access your app**:
   - After a few minutes, visit: `https://YOUR-USERNAME.github.io/united-route-intelligence/`

### Option 2: Cloudflare Pages

1. **Create a Cloudflare account**: [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)

2. **Connect your Git repository**:
   - Push your code to GitHub/GitLab
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Connect your Git account
   - Select your repository

3. **Configure build settings**:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: `/`
   - Click "Save and Deploy"

4. **Access your app**:
   - Cloudflare will provide a URL like: `https://united-route-intelligence.pages.dev`

### Option 3: Netlify

1. **Create a Netlify account**: [https://app.netlify.com/signup](https://app.netlify.com/signup)

2. **Deploy via drag-and-drop**:
   - Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag your `united-route-intelligence` folder onto the page
   - Netlify will deploy it instantly

3. **Or connect to Git**:
   - Click "New site from Git"
   - Connect your repository
   - Build settings: Leave all empty (no build step needed)
   - Click "Deploy site"

## Customization

### Adding More Airports

Edit `airports.js` and add entries to the `AIRPORTS` object:

```javascript
'YOUR_CODE': {
    iata: 'YOUR_CODE',
    name: 'Airport Name',
    city: 'City',
    state: 'ST',
    country: 'USA',
    lat: 12.3456,
    lon: -78.9012
}
```

### Modifying Mock Data

- Edit `mock-data/schedules.json` to add/modify flight schedules
- Edit `mock-data/offers.json` to add/modify priced offers
- Ensure dates match your test queries

### Styling Changes

All styles are in `styles.css`. Key CSS variables are defined in `:root`:

```css
--united-blue: #0033A1;
--united-dark-blue: #001E62;
--accent-orange: #FF6A13;
/* ... etc */
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES6 module support (`type="module"` in script tags).

## Troubleshooting

### "Failed to load module script" error

Make sure you're running the app through a web server (Live Server, http-server, etc.), not opening `index.html` directly with `file://`. ES6 modules require HTTP/HTTPS protocol.

### Map not loading

Check your internet connection—Leaflet tiles are loaded from OpenStreetMap CDN.

### No results showing

- Verify you're using date `2026-02-15` for mock data
- Check that airport codes exist in `airports.js`
- Open browser console (F12) to see any error messages

### Search button disabled

Check that all required fields are filled based on the current mode.

## Development

### Code Organization

- **app.js**: Main application logic, state management, event handlers
- **dataService.js**: Data fetching abstraction, normalizes API responses
- **airports.js**: Static airport database with helper functions
- **uiComponents.js**: Reusable UI rendering functions
- **styles.css**: All styling with CSS custom properties

### Adding New Features

1. Update the state object in `app.js` if needed
2. Add UI elements to `index.html`
3. Style them in `styles.css`
4. Add event handlers in `setupEventListeners()`
5. Implement logic in appropriate functions

## Security Considerations

- ✅ No API keys in frontend code
- ✅ Input validation on airport codes
- ✅ Client-side filtering only (mock data)
- ⚠️ For LIVE mode: Always use a backend proxy to make API calls
- ⚠️ Implement rate limiting on your backend
- ⚠️ Sanitize user inputs before sending to APIs

## License

This project is provided as-is for educational and demonstration purposes.

## Credits

- **Leaflet.js**: [https://leafletjs.com/](https://leafletjs.com/)
- **OpenStreetMap**: [https://www.openstreetmap.org/](https://www.openstreetmap.org/)
- **United Airlines**: Brand colors and inspiration

## Support

For issues or questions:
1. Check the browser console for errors
2. Review this README
3. Verify your local server is running
4. Check that mock data files are in the correct location

---

Built with ❤️ using vanilla JavaScript - no frameworks needed!
