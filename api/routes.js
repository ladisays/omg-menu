var controllers = require("./controllers/index");

function routes(router) {
    router.route("/status")
    .get(function (req, res) {
        res.json({
            message: "Good!"
        });
    });

    router.route("/convert")
    .post(controllers.sheets.reader);

    router.use(function (req, res) {
        res.status(404).send({ message: "Sorry! Route not found." });
    });

    return router;
}

module.exports = routes;
