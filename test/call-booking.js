#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import readline from "node:readline";

const [,, name = "Ashmita Pandey",
          phone = "+442080160508",
          dob   = "1940-01-01"] = process.argv;

const VERBOSE = process.argv.includes("--verbose");
const offerId = await fs.readFile("/tmp/offer_id.txt","utf8")
                        .then(b => b.toString().trim())
                        .catch(() => { console.error("run call-search.js first"); process.exit(1); });

const server = spawn("node", ["build/index.js"], { stdio:["pipe","pipe","pipe"] });
if (VERBOSE) server.stderr.pipe(process.stderr);

server.stderr.once("data", () => {
  server.stdin.write(JSON.stringify({
    jsonrpc:"2.0",
    id:2,
    method:"tools/call",
    params:{
      name:"book_flight",
      arguments:{
        offer_id       : offerId,
        passenger_name : name,
        passenger_phone: phone,
        born_on        : dob
      }
    }
  }) + "\n");
});

readline.createInterface({input:server.stdout})
        .once("line", line => { console.dir(JSON.parse(line), {depth:null}); server.kill(); });