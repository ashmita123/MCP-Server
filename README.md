# Duffle MCP Server

This project is a Model Context Protocol (MCP) server that provides flight search and booking capabilities via the Duffel API. It exposes two tools: `search_flights` to find flight offers and `book_flight` to book flights using those offers.

## Setup

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

### Run the Server
```bash
node build/index.js
```

You should see the message:
Duffel MCP ready — search_flights · book_flight

### Usage

The server implements two tools:
	•	search_flights: Search for flight offers based on origin, destination, date, cabin class, and passenger count.
	•	book_flight: Book a flight offer by providing offer ID and passenger details.

### Search Example

Run the search script with optional parameters: origin, destination, date
```bash
node test/call-search.js [ORIGIN] [DESTINATION] [DATE]
```

### Example:

```bash
node test/call-search.js SFO LAX 2025-06-15
```

This script will save the top offer ID to /tmp/offer_id.txt for booking.

### Book Example

Run the booking script with optional passenger info:
```bash
node test/call-booking.js [NAME] [PHONE] [BORN_ON]
```

### Example:
node test/call-booking.js "Ashmita Pandey" "+442080160508" "1990-01-01"

This script reads the saved offer ID from /tmp/offer_id.txt and attempts to book the flight.

### Test Scripts
	•	test/test-search.sh: Shell script to perform a flight search via FIFO pipes.
	•	test/test-book.sh: Shell script to book a flight using a saved offer ID.

Ensure that the MCP server is running before using these scripts.

### Environment Variables

Set your Duffel API token in .env or environment variables:
```bash
DUFFEL_TOKEN=your_duffel_api_token_here
```

## Author

	•Ashmita Pandey
	•GitHub: https://github.com/ashmita123
	•LinkedIn: https://linkedin.com/in/ashmitapandey

## License

MIT License

