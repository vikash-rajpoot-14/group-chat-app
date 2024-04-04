const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: `${__dirname}/config.env` });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const sequelize = require("./util/database");

const User = require("./models/user");
const Group = require("./models/group");
const Message = require("./models/message");
const GroupUser = require("./models/groupUser");
const Forgetpassword = require("./models/forgetPasswords");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");
const adminRoutes = require("./routes/adminRoutes");
const forgotPasswordRoute = require("./routes/forgotPassword");

User.hasMany(Message);
Message.belongsTo(User);
Group.belongsToMany(User, { through: GroupUser });
User.belongsToMany(Group, { through: GroupUser });
Group.hasMany(Message);
Message.belongsTo(Group);
User.hasMany(Forgetpassword);
Forgetpassword.belongsTo(User);

app.post("/s3Url", async (req, res) => {
  const file = req.body;
  const url = await generateUploadURL();
  res.send({ url });
});
app.use(authRoutes);
app.use(forgotPasswordRoute);
app.use("/chat", chatRoutes);
app.use("/groups", groupRoutes);
app.use(adminRoutes);
// app.get("/s3url");
app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});
app.use((req, res) => {
  res.send("<h2>welcome to chat app</h2>");
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server started at port ${process.env.PORT}`);
});

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    console.log("db connected");
  });

const io = require("socket.io")(server, {
  pingTimeout: 3000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

let GroupId;
io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  // socket.on("setup", (user) => {
  //   socket.join(user.id);
  //   socket.emit("connected");
  // });

  socket.on("join room", (room) => {
    socket.join(room);
    GroupId = room;
    socket.emit("joined", room);
    // console.log("User Joined Room: " + room);
  });

  socket.on("new message", (message) => {
    // console.log(message);
    io.to(GroupId).emit("message recieved", message);
    // socket.in(GroupId).emit("message recieved", message);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
