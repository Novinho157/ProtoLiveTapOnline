const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let running = false;
let totalTaps = 0;
let startedAt = null;
let spectators = new Map();
let nextId = 1;
let lastTick = Date.now();

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

function summary() {
  const now = Date.now();
  const elapsed = startedAt ? Math.max(0, (now - startedAt) / 1000) : 0;
  return {
    type: "state",
    running,
    totalTaps,
    spectators: spectators.size,
    active: [...spectators.values()].filter(s => s.active).length,
    tapsPerSecond: elapsed > 0 ? totalTaps / elapsed : 0,
    elapsed,
    people: [...spectators.values()].slice(0, 500)
  };
}

function setSpectators(count, avgTps) {
  count = Math.max(0, Math.min(5000, Math.floor(Number(count) || 0)));
  avgTps = Math.max(0, Math.min(100, Number(avgTps) || 0));
  const old = [...spectators.values()];
  spectators.clear();

  for (let i = 0; i < count; i++) {
    const previous = old[i];
    // Variação individual de aproximadamente +/- 35%.
    const factor = 0.65 + Math.random() * 0.70;
    spectators.set(nextId++, {
      id: previous?.id || `P${String(nextId).padStart(5, "0")}`,
      taps: previous?.taps || 0,
      tps: Math.max(0, avgTps * factor),
      active: true,
      accumulator: 0
    });
  }
}

function reset() {
  running = false;
  totalTaps = 0;
  startedAt = null;
  spectators.forEach(s => { s.taps = 0; s.accumulator = 0; });
}

setInterval(() => {
  const now = Date.now();
  const dt = Math.min(0.25, (now - lastTick) / 1000);
  lastTick = now;

  if (running) {
    let added = 0;
    for (const s of spectators.values()) {
      if (!s.active) continue;
      s.accumulator += s.tps * dt;
      const taps = Math.floor(s.accumulator);
      if (taps > 0) {
        s.accumulator -= taps;
        s.taps += taps;
        added += taps;
      }
    }
    totalTaps += added;
  }
  broadcast(summary());
}, 250);

wss.on("connection", ws => {
  ws.send(JSON.stringify(summary()));

  ws.on("message", raw => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "configure") {
        setSpectators(msg.count, msg.avgTps);
      }
      if (msg.type === "start") {
        running = true;
        if (!startedAt) startedAt = Date.now();
      }
      if (msg.type === "pause") running = false;
      if (msg.type === "reset") reset();
      if (msg.type === "stop") running = false;
    } catch {}
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Protótipo disponível em http://localhost:${PORT}`);
});