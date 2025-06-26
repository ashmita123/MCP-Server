#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { searchShape, searchHandler } from "./tools/search.js";
import { bookShape,   bookHandler   } from "./tools/booking.js";

export const server = new McpServer(
  { name: "TaskerDuffelServer", version: "0.4.5" },
  { capabilities: { tools: {} } }
);

server.tool("search_flights", searchShape, searchHandler);
server.tool("book_flight",    bookShape,   bookHandler);

(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Duffel MCP ready — search_flights · book_flight");
})();















