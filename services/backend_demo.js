// node backend_demo.js
// C:/Users/anton/ngrok http 3000

/* Importing Libraries */
var express = require("express");
var bodyParser = require("body-parser");
var jsonwebtoken = require("jsonwebtoken");

const key = "N6SzPexDQdXCR5Y03YcXaJ9a2Vrni0cmpscl6+qNLdg=";
const secret = Buffer.from(key, "base64");
const bearerPrefix = "Bearer ";

function verifyAndDecode(header) {
    if (header.startsWith(bearerPrefix)) {
        try {
            const token = header.substring(bearerPrefix.length);
            return jsonwebtoken.verify(token, secret, { algorithms: ["HS256"] });
        } catch (e) {
            return console.log("Invalid JWT");
        }
    }
}

/* Express Step 1: Creating an express application */
var app = express();
//set port
var port = 3000;

/* Express Step 2: Start Server */
app.listen(port, () => {
    console.log("Server listening on port " + port);
});

// Express Step 3: Use body-parser library to help parse incoming request bodies
app.use(bodyParser.json());

/* This is included because its allows extenion to run external javascript. 
If you are interested in learning more, check out: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS */
app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
    );
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    // Note that the origin of an extension iframe will be null
    // so the Access-Control-Allow-Origin has to be wildcard.
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

function simpleHash({ xStart, yStart, xEnd, yEnd }) {
    return (
        xStart.toString() + yStart.toString() + xEnd.toString() + yEnd.toString()
    );
}

pathsDict = {
    10102020: {
        xStart: 10,
        yStart: 10,
        xEnd: 20,
        yEnd: 20,
        color: "#00ff00",
        size: "2",
    },
};

app.post("/post_paths", (req, res) => {
    const payload = verifyAndDecode(req.headers.authorization);
    var paths = req.body["paths"];
    for (var i in paths) {
        var hash = simpleHash(paths[i]);
        if (!(hash in pathsDict)) {
            pathsDict[hash] = paths[i];
        }
    }
    res.status(200);
    res.send("Success");
});
app.get("/get_paths", (req, res) => {
    const payload = verifyAndDecode(req.headers.authorization);
    console.log(pathsDict);
    res.send(pathsDict);
});