const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const http = require("http");
const morgan = require("morgan");
const socketIo = require("socket.io");
// some initial circles
const circles = [
  {
    size: 1,
    color: "red"
  },
  {
    size: 5,
    color: "blue"
  },
  {
    size: 7,
    color: "green",
    animated: true
  },
  {
    size: 2,
    color: "limegreen"
  }
];

const port = process.env.PORT || 4001;

const app = express();

//create a server object:
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/circles", (req, res) => {
  res.send(circles);
});

app.post("/circles", (req, res) => {
  circles.push(req.body);
  res.sendStatus(200);
});
app.get("/", (req, res) => {
  res.send("Hello World");
});

const io = socketIo(server); // < Interesting!

io.on("connection", socket => {
  console.log("New client joined: ", socket.id);
  // join room
  socket.join("circle_room");
  // emit the initial data
  socket.emit("circle_data", circles);

  // report on disconnect
  socket.on("disconnect", () => console.log("Client disconnected"));

  // when receiving an 'add_circle' event
  socket.on("add_circle", circle => {
    // add the new circle
    circles.push(circle);
    // and emit a 'circle_data' event to all the sockets within the room
    io.in("circle_room").emit("circle_data", circles);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
