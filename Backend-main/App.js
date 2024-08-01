const { io, server, app } = require('./socket');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const color = require('colors');
const path = require('path');
const fs = require('fs');

app.set("port", 5000);
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/api/user', require('./Routers/user.router'));
app.use('/api/coin', require('./Routers/coin.router.js'));
app.use('/api/admin/basic', require('./Routers/admin.router.js'));

mongoose.connect('mongodb://localhost:27017/paymentDB', (err) => {
  if (!err) {
    console.log("DB Connected");
  } else {
    console.log("DB Not Connected");
  }
});

server.listen(5000, () => {
  console.log(`Http Server is Up and Running on http://localhost:5000`.rainbow);
});
io.on('connection', (socket) => {
  console.log('New client connected');


 
  socket.on('joinRoom', (username) => {
    socket.join(username);
    console.log(`User joined room: ${username}`);
  });

  // For demonstration, emitting a token update (this would normally come from some logic in your app)
  socket.on('tokenUpdate', (username, newToken) => {
    console.log(username, newToken)
    io.to(username).emit('tokenUpdate', newToken);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

 


});
app.get("/", async (req, res) => {
  return res.json({ status: true, message: "Server Running" });
});