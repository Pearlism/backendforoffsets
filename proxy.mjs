import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());

app.get("/class", async (req, res) => {
  const className = req.query.class;
  let properties = req.query.properties;

  if (!className || !properties) {
    return res
      .status(400)
      .json({ error: "Missing class or properties query parameters" });
  }

  properties = properties.split(",");

  const results = {};

  try {
    for (const prop of properties) {
    const url = `https://offsets.host/offsets/offset?class=${className}&property=${prop}`;
    const response = await fetch(url, {
        headers: { "User-Agent": "offsets-host-api/6.7" },
    });

    const text = await response.text();
    console.log(`Response for ${className}::${prop}:`, text);

    if (!response.ok) {
        console.error(`Failed to fetch offset for ${prop}:`, text);
        results[prop] = null;
        continue;
    }

    try {
        const json = JSON.parse(text);
        if (json.offset) {
            
            results[prop] = parseInt(json.offset.replace(/^0x/, ""), 16);
        } else {
            results[prop] = null;
        }
    } catch {
        results[prop] = null;
    }
}

    res.json(results);
  } catch (err) {
    console.error("Proxy fetch failed:", err);
    res.status(500).json({ error: "Proxy fetch failed", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server ${port}`);
});
