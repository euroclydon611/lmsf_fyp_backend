require("dotenv").config();
import { app } from "./index";
import connectDB from "./database/connectDB";

const port = parseInt(process.env.PORT || "8080", 10);

//create server
app.listen(port, () => {
  console.log(`Server is running on http://0.0.0.0:${process.env.PORT}`);
  connectDB();
});
