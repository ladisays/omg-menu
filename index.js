var cookieParser = require("cookie-parser"),
    express = require("express"),
    app = express(),
    router = express.Router(),
    bodyParser = require("body-parser"),
    path = require("path"),
    cors = require("cors"),
    morgan = require("morgan"),
    routingService = require("./api/routes")(router),
    env = process.env.NODE_ENV || "development";

if (env === "development") {
    var dotenv = require("node-env-file");
    dotenv(__dirname + "/.env");
}

app.use(morgan("dev"));
app.use(cookieParser());

app.use(cors());


// to support JSON-encoded bodies
app.use(bodyParser.json());

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

// static files
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", routingService);

app.get("/*", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

// Standard error handling
app.use(function (err, req, res) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

var server = app.listen(process.env.PORT || 7777, function() {
    console.log("Server is listening on port %d", server.address().port);
});

module.exports = app;