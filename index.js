const express = require("express");
const app = express();
const allRouter = require("./routes/analyzerRoute");

app.use(express.json());

app.use("/api/v1/strings", allRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`String Analyzer API running on port ${PORT}`);
});
