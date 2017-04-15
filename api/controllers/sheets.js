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
    var sheet, rows = req.body,
        Auth = {
            auth: process.env.GOOGLE_SHEETS_API_KEY,
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        };
    
    if (rows.catering.indexOf("menu") !== -1) {
        sheet = "Menus for Printing";
    }

    else if (rows.catering === "dish") {
        sheet = "Dishes";
    }

    else if (rows.catering === "dressing") {
        sheet = "Dressings";
    }

    else if (rows.catering === "topping") {
        sheet = "Toppings";
    }

    else {
        sheet = "";
    }

    if (rows.type === "selection") {
        Auth.range = sheet + "!C" + rows.startAt + ":P" + rows.endAt;
    }
    else {
        Auth.range = sheet + "!C2:P";
    }

    sheets.spreadsheets.values.get(Auth, function (err, data) {
        if (err) {
            return res.status(400).json(err);
        } else {
            var dir, menu, template, file,
                values = data.values;

            var links = values.map(function (value) {
                menu = {};
                file = null;

                return function (callback) {
                    if (!value[0] || !value[1] || !value[2]) {
                        return callback(null, null);
                    }

                    var text_arr = null;

                    if (rows.catering === "dish" || rows.catering === "dressing") {
                        menu = {                            
                            ingredients: value[2],
                            allergens: value[3],
                            image_url: value[4] || "https://s3-us-west-2.amazonaws.com/zenbox-media/_default_menu.jpg",
                            vegan: value[5],
                            dairy: value[6],
                            soy: value[7],
                            wheat: value[8],
                            nut: value[9],
                            gluten: value[10],
                            paleo: value[11],
                            egg: value[12]
                        };

                        if (rows.catering === "dish") {
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
                    else {
                        var i, item = {};

                        menu = {
                            day: value[0],
                            description: value[2],
                            image_url: value[3] || "https://s3-us-west-2.amazonaws.com/zenbox-media/_default_menu.jpg",
                            items: []
                        };

                        if (value[1].indexOf(";") !== -1) {
                            text_arr = value[1].split(";");
                            menu.theme = text_arr[0].trim();
                            menu.line_2 = text_arr[1].trim();
                        }
                        else {
                            menu.theme = value[1];
                        }

                        for (i = 4; i < value.length; i++) {
                            if (value[i].indexOf(":") !== -1) {
                                text_arr = value[i].split(":");
                                item.title = text_arr[0].trim();
                                item.detail = text_arr[1].trim();
                            }
                            else {
                                item = {
                                    title: value[i],
                                    detail: ""
                                };
                            }

                            menu.items.push(item);
                        }
                    }

                    menu.template = rows.catering;

                    file = rows.catering.indexOf("menu") !== -1 ? menu.theme.toLowerCase() : menu.title.toLowerCase();

                    template = pug.renderFile("api/templates/menu.pug", menu);

                    pdf.create(template, options).toFile("./public/files/" + file + ".jpeg", function (err, data) {
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
                result = result.filter(function (link) {
                    return link !== null;
                });

                return res.status(200).json(result);
            });
        }
    });
}

module.exports = {
    reader: reader
};
