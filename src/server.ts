import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";

dotenv.config(); //Read .env file lines as though they were env vars.

const dbClientConfig = setupDBClientConfig();
const client = new Client(dbClientConfig);

//Configure express routes
const app = express();

app.use(express.json()); //add JSON body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

app.get("/", async (_req, res) => {
  try {
    const allHistory = await client.query("SELECT * FROM todobysilviu;");
    res.status(200).json(allHistory.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error has occured!");
  }
});

app.post("/", async (req, res) => {
  try {
    const { description } = req.body;
    await client.query(`INSERT INTO todobysilviu (description) VALUES ($1);`, [
      description,
    ]);
    res.status(201).json({ status: "It worked" });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error has occured!");
  }
});
////////////////////////////////////

app.delete("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    await client.query("DELETE FROM todobysilviu WHERE id = $1;", [itemId]);
    res.status(204).send();
  } catch (error) {
    console.error(error);

    res.status(500).send("An error has occurred!");
  }
});

//////////////////////
app.get("/health-check", async (_req, res) => {
  try {
    //For this to be successful, must connect to db
    await client.query("select now()");
    res.status(200).send("system ok");
  } catch (error) {
    //Recover from error rather than letting system halt
    console.error(error);
    res.status(500).send("An error occurred. Check server logs.");
  }
});

connectToDBAndStartListening();

async function connectToDBAndStartListening() {
  console.log("Attempting to connect to db");
  await client.connect();
  console.log("Connected to db!");

  const port = getEnvVarOrFail("PORT");
  app.listen(port, () => {
    console.log(
      `Server started listening for HTTP requests on port ${port}.  Let's go!`
    );
  });
}
