#!/usr/bin/env node
import { spawnSync, spawn } from "node:child_process";
import fs from "node:fs/promises";
import readline from "node:readline";

const [,, ORIGIN="SFO", DEST="LAX", DATE="2025-06-15", flag] = process.argv;
const VERBOSE = flag === "--verbose";

spawnSync("npm", ["run","-s","build"], { stdio: VERBOSE?"inherit":"pipe" });

const server = spawn("node", ["build/index.js"], { stdio:["pipe","pipe","pipe"] });
if (VERBOSE) server.stderr.pipe(process.stderr);

server.stderr.once("data", () => {
  server.stdin.write(JSON.stringify({
    jsonrpc:"2.0", id:1, method:"tools/call",
    params :{ name:"search_flights",
              arguments:{ origin:ORIGIN, destination:DEST, date:DATE } }
  })+"\n");
});

readline.createInterface({ input: server.stdout })
        .once("line", async line => {
          const reply = JSON.parse(line);
          if (VERBOSE) console.dir(reply, {depth:null});

          if (reply.result?.isError) {
            console.error(" Search failed.");
            return server.kill();
          }
          const match = reply.result.content[0].text.match(/\s+(\S+)/);
          if (match) {
            await fs.writeFile("/tmp/offer_id.txt", match[1]);
            console.log(` saved offer_id = ${match[1]}`);
          }
          server.kill();
        });