import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";



const app = express();
const port = 3001;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

const db = new sqlite3.Database("streamers.sqlite");

db.run(`CREATE TABLE IF NOT EXISTS streamers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    platform TEXT,
    description TEXT,
    image TEXT,
    vote INTEGER DEFAULT 0
  )`);

//adding new streamer
app.post("/streamers", (req, res) => {
  const { name, platform, description, image } = req.body;
  db.run(
    "INSERT INTO streamers (name, platform, description, image) VALUES (?, ?, ?, ?)",
    [name, platform, description, image],
    function (err) {
      if (err) {
        console.error("Error inserting data:", err);
        res
          .status(500)
          .json({ error: "An error occurred while inserting the streamer." });
      } else {
        console.log("Streamer inserted successfully!");
        res.json({ id: this.lastID });
      }
    }
  );
});

// getting all streamers
app.get("/streamers", (req, res) => {
  db.all("SELECT * FROM streamers", (err, rows) => {
    if (err) {
      console.error("Error retrieving streamers:", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving streamers." });
    } else {
      // Respond with the retrieved streamers
      res.json(rows);
    }
  });
});

// getting one streamer by id
app.get("/streamers/:streamerId", (req, res) => {
  const streamerId = req.params.streamerId;
  db.get("SELECT * FROM streamers WHERE id = ?", [streamerId], (err, row) => {
    if (err) {
      console.error("Error retrieving streamer:", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the streamer." });
    } else if (!row) {
      res.status(404).json({ error: "Streamer not found." });
    } else {
      res.json(row);
    }
  });
});

// changing vote cound on specific streamer
app.put("/streamers/:streamerId/vote", (req, res) => {
  const streamerId = req.params.streamerId;
  const voteType = req.body.vote; // "upvote" or "downvote"
  if (voteType === "upvote") {
    db.run(
      "UPDATE streamers SET vote = vote + 1 WHERE id = ?",
      [streamerId],
      function (err) {
        if (err) {
          console.error("Error updating vote count:", err);
          res
            .status(500)
            .json({
              error: "An error occurred while updating the vote count.",
            });
        } else if (this.changes === 0) {
          res.status(404).json({ error: "Streamer not found." });
        } else {
          console.log("Upvote counted successfully!");
          res.json({ message: "Upvote counted successfully!" });
        }
      }
    );
  } else if (voteType === "downvote") {
    db.run(
      "UPDATE streamers SET vote = vote - 1 WHERE id = ?",
      [streamerId],
      function (err) {
        if (err) {
          console.error("Error updating vote count:", err);
          res
            .status(500)
            .json({
              error: "An error occurred while updating the vote count.",
            });
        } else if (this.changes === 0) {
          res.status(404).json({ error: "Streamer not found." });
        } else {
          console.log("Downvote counted successfully!");
          res.json({ message: "Downvote counted successfully!" });
        }
      }
    );
  } else {
    res
      .status(400)
      .json({
        error: 'Invalid vote type. Vote can be either "upvote" or "downvote".',
      });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
