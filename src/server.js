const app = require("./app.js");
const { connectDB } = require("./database.js");

const dotenv = require("dotenv");
if (!process.env.PORT) {
  dotenv.config();
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
};

startServer();
