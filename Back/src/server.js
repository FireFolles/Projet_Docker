require("dotenv").config({ path: process.env.ENV_FILE || ".env" });
const path = require("path");
const express = require("express");
const cors = require("cors");
const { createSupabaseClient } = require("./db");
const buildTasksRouter = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));

let supabase;
try {
  supabase = createSupabaseClient();
} catch (err) {
  console.error("Erreur de configuration Supabase :", err.message);
  process.exit(1);
}

app.use("/api/tasks", buildTasksRouter(supabase));
// Le backend sert uniquement l'API, il ne gère plus de fichiers statiques pour le front.

app.use((err, _req, res, _next) => {
  console.error("STACK:", err && (err.stack || err));
  res.status(500).json({ error: "Erreur interne du serveur." });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

