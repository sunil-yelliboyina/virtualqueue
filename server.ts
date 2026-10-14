import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocketServer } from "./src/lib/socket";

const dev = process.env.NODE_ENV !== "production";
// Public hostname used in logs and Next.js URL generation.
// Keep this as localhost when Oracle VM NAT forwards host port 3000 to the guest.
const hostname = process.env.HOSTNAME || "localhost";
// Bind address. 0.0.0.0 is required so VirtualBox port forwarding can reach the guest.
const bindHost = process.env.BIND_HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Attach Socket.io to the same HTTP server
  initSocketServer(httpServer);

  httpServer.listen(port, bindHost, () => {
    console.log(
      `> FlowQ ready on http://${hostname}:${port} (${dev ? "development" : "production"})`
    );
    console.log(`> Listening on ${bindHost}:${port}`);
    console.log(`> Socket.io server running on the same port`);
  });
});
