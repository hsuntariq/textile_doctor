import express from "express";
import dotenv from "dotenv";
import colors from "colors";
dotenv.config();
const app = express();

app.listen(process.env.PORT, () =>
  console.log(`Server started on port:${process.env.PORT.yellow}`)
);
