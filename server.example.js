const express = require("express");
const StreamAudio = require("ytdl-core");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.static("./"));

app.get("/", async (req, res) => {
  const Link = req.query.url;
  if (Link) {
    try {
      const id = StreamAudio.getVideoID(
        `https://www.youtube.com/watch?v=${Link}`
      );
      const info = await StreamAudio.getInfo(Link);
      const formatWithAudio = info.formats.find((format) => format.hasVideo);

      const contentLength = formatWithAudio.contentLength;
      res.setHeader("content-length", contentLength);

      res.setHeader("content-type", "audio/mpeg");
      //res.setHeader("Cache-Control", "public, max-age=3600"); 
      res.setHeader("Accept-Ranges", "bytes");

      
      const Download = StreamAudio(Link, {
        filter: "videoandaudio",
        quality: "highestvideo",
      }).pipe(res);
    } catch (error) {
      console.log(error);
      res.json(error.message);
    }
  } else {
    res.status(404).json("url not provided");
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

module.exports = app;
