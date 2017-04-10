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
    var rows = req.body,
        Auth = {
            auth: process.env.GOOGLE_SHEETS_API_KEY,
            spreadsheetId: process.env[rows.catering.toUpperCase() + "_GOOGLE_SHEETS_ID"],
            range: rows.type === "selection" ? "Sheet1!A" + rows.startAt + ":M" + rows.endAt : "Sheet1!A2:M"
        };

    sheets.spreadsheets.values.get(Auth, function (err, data) {
        if (err) {
            return res.status(400).json(err);
        } else {
            var dir, menu, template,
                values = data.values;

            var links = values.map(function (value) {
                menu = {};

                return function (callback) {
                    var text_arr = null;

                    if (rows.catering !== "menu") {
                        menu = {                            
                            ingredients: value[2],
                            allergens: value[3],
                            image_url: value[4],
                            vegan: value[5],
                            dairy: value[6],
                            soy: value[7],
                            wheat: value[8],
                            nut: value[9],
                            gluten: value[10],
                            paleo: value[11],
                            egg: value[12]
                        };

                        if (rows.catering === "label") {
                            menu.type = value[0];

                            if (value[1].indexOf(":") !== -1) {
                                text_arr = value[1].split(":");
                                menu.title = text_arr[0].trim();
                                menu.subtitle = text_arr[1].trim();
                            }
                            else if (value[1].indexOf(";") !== -1) {
                                text_arr = value[1].split(";");
                                menu.title = text_arr[0].trim();
                                menu.line_2 = text_arr[1].trim();
                            }
                            else {
                                menu.title = value[1];
                            }
                        } else {
                            menu.subtitle = value[1];

                            if (value[0].indexOf(";") !== -1) {
                                text_arr = value[0].split(";");
                                menu.title = text_arr[0].trim();
                                menu.line_2 = text_arr[1].trim();
                            }
                            else {
                                menu.title = value[1];
                            }
                        }
                    }

                    template = pug.renderFile("api/templates/menu.pug", menu);

                    pdf.create(template, options).toFile("./public/files/" + menu.title.toLowerCase() + ".jpeg", function (err, data) {
                        if (err) {
                            return callback(err, null);
                        }

                        if (data) {
                            dir = path.parse(data.filename);
                            return callback(null, { title: value[1], file: "files/" + dir.base });
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
