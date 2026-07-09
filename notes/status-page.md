IDEAS

Core service health

- Web/SvelteKit app — uptime, current version (you already have /api/os/version), git commit/build hash, PM2 process state from pm2.config.cjs.
- WebSocket server — connection up/down, active socket count (the custom Bun /ws server), reconnect rate.
- PostgreSQL/Drizzle — reachability ping, latency, pool usage, last successful query. A degraded-DB indicator is the single most valuable signal.

Domain subsystems (the differentiators here)

- Minecraft server — running/stopped (you have start/shutdown/online APIs), player count online, TPS/lag if the plugin can report it, last heartbeat from the plugin HTTP API.
- Minechat bridge — Discord↔Minecraft link status, last message relayed, webhook health (minechatHooks), queue backlog.
- File storage (VFS) — disk usage vs. quota, file_meta count, upload service reachable.

System-level appliances

- Live user presence — currently online users (ties into /api/os/online + WebSocket).
- Incident/uptime history — per-service uptime % over 24h/7d/30d, color-coded timeline bars (classic statuspage style).
- Resource metrics — CPU/memory of the Bun process, event-loop lag.

Design notes for this stack

- Each appliance = a Svelte 5 component with $state/$derived, fed by a /api/os/status aggregator endpoint that pings each subsystem with a short timeout and returns { service, state:
  up|degraded|down, latency, detail }.
- Three-state model (up / degraded / down) is more honest than a binary up/down, especially for the Minecraft and Minechat bridges.
