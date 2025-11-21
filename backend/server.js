import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

let db;

async function initDB() {
  try {
    const dbPath = path.resolve("C:/Users/ranza/SQLite/Databases/Teki-Games.db");
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
  try {
    const row = await db.get(
      "SELECT user_id, username, email, password_hash FROM Users WHERE email = ?",
      email
    );
    if (!row) return res.status(401).json({ success: false, error: "Invalid login" });

    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) return res.status(401).json({ success: false, error: "Invalid login" });

    
    const { password_hash, ...user } = row;
    res.json({ success: true, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
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
    `SELECT r.review_id, r.user_id, u.username, r.game_id, r.rating, r.review_text
     FROM Reviews r
     LEFT JOIN Users u ON r.user_id = u.user_id
     WHERE r.game_id = ?
     ORDER BY r.review_id DESC`,
    req.params.gameId
  );
  res.json(rows);
});

app.get("/reviews", async (_, res) => {
  const rows = await db.all(
    `SELECT r.review_id, r.user_id, u.username, r.game_id, r.rating, r.review_text
     FROM Reviews r
     LEFT JOIN Users u ON r.user_id = u.user_id
     ORDER BY r.review_id DESC`
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

app.post("/auth/register", async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }
  try {
    const existing = await db.get("SELECT user_id FROM Users WHERE email = ?", email);
    if (existing) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.run(
      "INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)",
      username,
      email,
      password_hash
    );
    res.json({ success: true, user_id: result.lastID });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});
