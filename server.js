const express = require("express");
const StreamAudio = require("ytdl-core");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");
const fs = require("fs");
const cluster = require("node:cluster");
const os = require("os");
const totalCpu = os.cpus().length;
const cp = require("child_process");
const ffmpeg = require("ffmpeg-static");

if (cluster.isPrimary) {
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }
} else {
  app.use(cors());
  app.use(express.static("./"));

  app.get("/", async (req, res) => {
    const Link = req.query.url;

    if (Link && StreamAudio.validateID(Link)) {
      try {
        if (fs.existsSync(`music/${Link}.mp3`)) {
          const audio = fs.createReadStream(`music/${Link}.mp3`);
          const data = fs.statSync(`music/${Link}.mp3`);
          res.setHeader("content-type", "audio/mpeg");
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("content-length", data.size);

          audio.pipe(res);
          return;
        }

        const Download = StreamAudio(Link, {
          filter: "audioonly",
          quality: "highestaudio",
        }).pipe(fs.createWriteStream(`music/${Link}.mp3`));

        Download.on("error", () => console.error("error"));
        Download.on("finish", () => {
          console.log(Link);

          const audio = fs.createReadStream(`music/${Link}.mp3`);
          const data = fs.statSync(`music/${Link}.mp3`);
          res.setHeader("content-type", "audio/mpeg");
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("content-length", data.size);

          audio.pipe(res);
        });
      } catch (error) {
        console.log(error.message);
        res.json("error");
      }
    } else {
      res.status(200).json("url not provided");
    }
  });

  app.get("/download/", async (req, res) => {
    const Link = req.query.url;
    const File = req.query.file;

    if (Link) {
      try {
        if (fs.existsSync(`music/${Link}.mp3`)) {
          const audio = fs.createReadStream(`music/${Link}.mp3`);
          const data = fs.statSync(`music/${Link}.mp3`);
          res.setHeader("content-type", "audio/mpeg");
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("content-length", data.size);
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${File}.mp3"`
          );

          audio.pipe(res);
          return;
        }

        const Download = StreamAudio(Link, {
          filter: "audioonly",
          quality: "highestaudio",
        }).pipe(fs.createWriteStream(`music/${Link}.mp3`));

        Download.on("error", () => console.error("error"));
        Download.on("finish", () => {
          console.log(Link);

          const audio = fs.createReadStream(`music/${Link}.mp3`);
          const data = fs.statSync(`music/${Link}.mp3`);
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${File}.mp3"`
          );
          res.setHeader("content-type", "audio/mpeg");
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("content-length", data.size);

          audio.pipe(res);
        });
      } catch (error) {
        console.log(error.message);
        res.json("error");
      }
    } else {
      res.status(200).json("url not provided");
    }
  });

  app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
}
