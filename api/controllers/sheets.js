var pdf = require("html-pdf"),
    async = require("async"),
    pug = require("pug"),
    path = require("path"),
    google = require("googleapis"),
    sheets = google.sheets("v4"),
    options = {
        orientation: "landscape",
        type: "jpeg",
        quality: "100",
        directory: "/public/files",
        timeout: 300000
    };

function reader(req, res) {
    var rows = req.body;

    sheets.spreadsheets.values.get({
        auth: process.env.GOOGLE_SHEETS_API_KEY,
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: "Sheet1!A" + rows.startAt + ":J" + rows.endAt
    }, function (err, data) {
        if (err) {
            res.status(400).json(err);
        } else {
            var dir, menu, template,
                values = data.values;

            var links = values.map(function (value) {
                menu = {};

                return function (callback) {
                    menu = {
                        type: value[0],
                        title: value[1],
                        ingredients: value[2],
                        allergens: value[3]
                    };

                    template = pug.renderFile("api/templates/menu.pug", menu);

                    pdf.create(template, options).toFile("./public/files/" + menu.title.toLowerCase() + ".jpeg", function (err, data) {
                        if (err) {
                            return callback(err, null);
                        }

                        if (data) {
                            dir = path.parse(data.filename);
                            return callback(null, { title: value[1], file: "/files/" + dir.base });
                        } else {
                            return callback(null, null);
                        }
                    });
                };
            });

            async.parallel(links, function (err, result) {
                if (err) {
                    return res.status(400).json(err);
                }
                return res.status(200).json(result);
            });
        }
    });
}

module.exports = {
    reader: reader
};
