require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const registerSockets = require("./sockets");

const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// if you want to access io inside routes/controllers later:
app.set("io", io);

// mount all socket modules
registerSockets(io);

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(`Link: http://localhost:${port}`);
});
