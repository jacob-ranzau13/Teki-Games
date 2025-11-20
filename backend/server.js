import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

let db;

async function initDB() {
  try {
    const dbPath = path.resolve("C:/Users/ranza/SQL-Lite/Databases/Teki-games.db");
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  } catch (err) {
    console.error("Failed to open SQLite database:", err);
    throw err;
  }
}
await initDB();

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db.get(
    "SELECT user_id, username, email FROM Users WHERE email = ? AND password = ?",
    email,
    password
  );

  if (!user) return res.status(401).json({ success: false, error: "Invalid login" });

  res.json({ success: true, user });
});


app.get("/users", async (_, res) => {
  const rows = await db.all("SELECT * FROM Users");
  res.json(rows);
});


app.get("/games", async (_, res) => {
  const rows = await db.all("SELECT * FROM Games");
  res.json(rows);
});

app.post("/games", async (req, res) => {
  const { title, genre, release_year, platform_id } = req.body;
  const result = await db.run(
    "INSERT INTO Games (title, genre, release_year, platform_id) VALUES (?, ?, ?, ?)",
    title,
    genre,
    release_year,
    platform_id
  );
  res.json({ game_id: result.lastID });
});

app.put("/games/:id", async (req, res) => {
  const { title, genre, release_year, platform_id } = req.body;
  await db.run(
    "UPDATE Games SET title=?, genre=?, release_year=?, platform_id=? WHERE game_id=?",
    title,
    genre,
    release_year,
    platform_id,
    req.params.id
  );
  res.json({ success: true });
});

app.delete("/games/:id", async (req, res) => {
  await db.run("DELETE FROM Games WHERE game_id = ?", req.params.id);
  res.json({ success: true });
});


app.get("/reviews/:gameId", async (req, res) => {
  const rows = await db.all(
    "SELECT * FROM Reviews WHERE game_id = ?",
    req.params.gameId
  );
  res.json(rows);
});

app.post("/reviews", async (req, res) => {
  const { user_id, game_id, rating, review_text } = req.body;
  const result = await db.run(
    "INSERT INTO Reviews (user_id, game_id, rating, review_text) VALUES (?, ?, ?, ?)",
    user_id,
    game_id,
    rating,
    review_text
  );
  res.json({ review_id: result.lastID });
});


app.get("/favorites/:userId", async (req, res) => {
  const rows = await db.all(
    "SELECT * FROM Favorites WHERE user_id = ?",
    req.params.userId
  );
  res.json(rows);
});

app.post("/favorites", async (req, res) => {
  const { user_id, game_id } = req.body;
  const result = await db.run(
    "INSERT INTO Favorites (user_id, game_id) VALUES (?, ?)",
    user_id,
    game_id
  );
  res.json({ favorite_id: result.lastID });
});


app.get("/platforms", async (_, res) => {
  const rows = await db.all("SELECT * FROM Platforms");
  res.json(rows);
});

app.post("/platforms", async (req, res) => {
  const { platform_name } = req.body;
  const result = await db.run(
    "INSERT INTO Platforms (platform_name) VALUES (?)",
    platform_name
  );
  res.json({ platform_id: result.lastID });
});

app.get("/", (_, res) => res.json({ status: "Backend running" }));

const PORT = 4000;
app.listen(PORT, () => {
  console.log("Backend running at http://localhost:" + PORT);
});
