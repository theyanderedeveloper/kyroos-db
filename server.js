const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8647;

// Absolute paths
const BASE_HTML = "/kyroos-db/public"; // <-- folder path
const BASE_FILES = "/kyroos-db/files";  // <-- folder path

// Serve public folder as static
app.use(express.static(BASE_HTML));  // <-- this makes all files in public accessible

app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src * 'unsafe-inline' 'unsafe-eval'; " +
            "script-src * 'unsafe-inline' 'unsafe-eval'; " +
            "style-src * 'unsafe-inline'; " +
            "img-src * data:; " +
            "frame-src *; " +
            "connect-src *",
    );
    next();
});

app.get("/", (req, res) => {
    res.sendFile(path.join(BASE_HTML, "index.html"));
});

app.get("/api/list", (req, res) => {
    const userPath = req.query.path || "";
    const dirPath = path.join(BASE_FILES, userPath);

    fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
        if (err) return res.status(400).json({ error: "Invalid directory path" });

        const items = files.map((file) => ({
            name: file.name,
            type: file.isDirectory() ? "dir" : "package",
            path: path.join(userPath, file.name).replace(/\\/g, "/"),
        }));

        res.json(items);
    });
});

app.get("/api/download", (req, res) => {
    const userPath = req.query.path;
    if (!userPath) return res.status(400).send("Missing path parameter");

    const filePath = path.join(BASE_FILES, userPath);
    res.download(filePath, (err) => {
        if (err) res.status(404).send("File not found");
    });
});

// Serve files for iframe preview
app.use("/files", express.static(BASE_FILES));

app.listen(PORT, () => {
    console.log(`KyroOS File Browser running on http://192.168.8.205:${PORT}`);
});