const express = require("express");
const cors = require("cors");
require("dotenv").config();
// require("express-async-errors");

const authRoutes = require("./routes/auth.js");

const app = express();

const port = process.env.PORT || 5000;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = require("twilio")(accountSid, authToken);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello, World");
});

app.post("/", (req, res) => {
  const { message, user: sender, type, members } = req.body;
  if (type === "message.new") {
    members
      .filter((member) => member.user_id !== sender.id)
      .forEach(({ user }) => {
        if (!user.online) {
          twilioClient.messages
            .create({
              body: `You have a new Messade from ${message.user.fullName} - ${message.text}`,
              messagingServiceSid: messagingServiceSid,
              to: user.phoneNumber,
            })
            .then(() => console.log("Message Sent!"))
            .catch((err) => console.log(err));
        }
      });
    return res.status(200).send("Message Sent!");
  }
  return res.status(200).send("Not a new message request");
});

app.use("/auth", authRoutes);

app.listen(port, () => console.log(`Server is listening on port ${port}...`));
