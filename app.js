//Express variables
var express = require("express");
var http = require("http");
//var https = require("https");
var app = express();
var fs = require("fs");
app.use(express.static("public", { dotfiles: "allow" }));
app.use("*/favicon.ico", express.static("public/favicon.png"));
app.use(express.json());
var porthttp = 3000;
var porthttps = 443;
const pageDir = "./pages";

//Color log variables
var color = require("./exports/clog.js");
var clog = color.clog;

//File reader/writer
var file = require("./exports/files.js");

//Blacklist for ip's who spam
var blacklist = require("./exports/blacklist.js");

//Getting key and certificate
// const privateKey = fs.readFileSync(
//   "/etc/letsencrypt/live/ethanryoung.com/privkey.pem",
//   "utf8"
// );
// const certificate = fs.readFileSync(
//   "/etc/letsencrypt/live/ethanryoung.com/fullchain.pem",
//   "utf8"
// );
// const ca = fs.readFileSync(
//   "/etc/letsencrypt/live/ethanryoung.com/chain.pem",
//   "utf8"
// );
// const credentials = {
//   key: privateKey,
//   cert: certificate,
//   ca: ca,
// };

const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

//Check for valid info
app.use(function (req, res, next) {
  if (1 == 0) {
    //res.redirect("https://" + req.headers.host + req.url);
  } else {
    if (
      typeof req === undefined ||
      typeof req.ip === undefined ||
      typeof req.path === undefined ||
      typeof req.hostname === undefined
    ) {
      req.pause();
      res.status = 400;
      res.end("Invalid request");
    }
    next();
  }
});

// //Kill's request and response if ip is in the blacklist
// app.use(function(req, res, next){
// 	blacklist.check(req, function(isBlackListed){
// 		if(isBlackListed){
// 			clog("Blacklisted ip attempted to contact: "+req.path, color.red);
// 			sendPage("./pages/","blacklist", res);
// 		}
// 		else {
// 			next();
// 		}
// 	});
// });

//Endpoint for contact API
app.post("/api/Contact", (req, res) => {
  console.log(req.body);
});

//Web page index
app.get("/", (req, res) => {
  sendPage(pageDir, "/index", res);
});

//used to direct all pages
app.get("/*", (req, res) => {
  sendPage(pageDir, req.path, res);
});

//sends web page as response
function sendPage(pageDir, path, res) {
  clog("Got page request for: " + pageDir + path, color.yellow);
  file.read(pageDir, path + ".html", function (page) {
    if (page == null) {
      sendError(pageDir, res);
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(page);
      clog("Sent page as response.\n", color.green);
      reqIP = null;
    }
  });
}

//sends 404 page as response
function sendError(pageDir, res) {
  file.read(pageDir, "/404.html", function (page) {
    if (page == null) clog("File reader is broken!!", color.red);
    else {
      res.writeHead(404);
      res.end(page);
      clog("Error:\tpage not found.\n\tReturning 404 page.", color.red);
      file.write(
        "./logs/",
        "404.txt",
        "Timestamp: " +
          Date.now() +
          "\nPage requested: " +
          pageDir +
          path +
          "\nRequesting IP: " +
          reqIP +
          "\n\n",
        true
      );
      reqIP = null;
    }
  });
}

httpServer.listen(
  porthttp,
  clog("HTTP listening on " + porthttp + " for requests.", color.blue)
);
// httpsServer.listen(
//   porthttps,
//   clog("HTTPS listening on " + porthttps + " for requests.", color.red)
// );
