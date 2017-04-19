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
            return res.status(400).json({ message: "There seems to be an authentication issue.", error: err });
        }

        if (!data.values || !data.values.length) {
            return res.status(404).json({ message: "No values were returned! "});
        }

        var dir, menu, template, file,
            values = data.values;

        var links = values.map(function (value) {
            menu = {};
            file = null;

            return function (callback) {
                var i, text_arr = null;

                if (rows.catering === "dish" || rows.catering === "dressing") {
                    if (!value[0] || !value[1] || !value[2]) {
                        return callback(null, null);
                    }

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
                            menu.title = value[0];
                        }
                    }
                }
                else if (rows.catering === "topping") {
                    if (!value[1]) {
                        return callback(null, null);
                    }

                    menu.cards = [];

                    for (i = 0; i < value.length; i++) {
                        menu.cards.push(delimit(";", value[i], menu, "topping"));
                    }
                }
                else {
                    if (!value[0] || !value[1] || !value[4] || !value[5]) {
                        return callback(null, null);
                    }

                    var item = {};

                    menu = {
                        day: value[0],
                        description: value[2],
                        image_url: value[3] || "https://s3-us-west-2.amazonaws.com/zenbox-media/_default_menu.jpg",
                        entree: value[4],
                        veg_entree: value[5],
                        sides: []
                    };

                    delimit(";", value[1], menu, "menu");

                    if (value.length > 6) {
                        for (i = 6; i < value.length; i++) {
                            menu.sides.push(delimit(":", value[i], item, "menu", true));
                        }
                    }
                }

                menu.template = rows.catering;

                if (menu.template === "topping") {
                    menu.title = rows.type === "selection" ? "Toppings_" + rows.startAt + "_" + rows.endAt : "Toppings_all";
                }

                file = rows.catering.indexOf("menu") !== -1 ? menu.theme.toLowerCase().replace("/","_") : menu.title.toLowerCase().replace("/","_");

                template = pug.renderFile("api/templates/menu.pug", menu);


                pdf.create(template, options).toFile("./public/files/" + file + ".jpeg", function (err, data) {
                    if (err) {
                        return callback(err, null);
                    }

                    if (data) {
                        var title = value[1];
                        dir = path.parse(data.filename);

                        if (rows.catering === "dressing") {
                            title = value[0];
                        }

                        return callback(null, { title: title, file: "files/" + dir.base });
                    } else {
                        return callback(null, null);
                    }
                });
            };
        });

        async.parallel(links, function (err, result) {
            if (err) {
                return res.status(400).json({ message: "There was an error with the conversion.", error: err });
            }
            
            result = result.filter(function (link) {
                return link !== null;
            });
            
            if (!result.length) {
                return res.status(404).json({ message: "Empty data returned! Please, check the spreadsheet." });
            }

            return res.status(200).json(result);
        });
    });
}

function delimit(delimiter, val, obj, template, side) {
    var _arr, toppings, tt;

    if (side) {
        if (val.indexOf(delimiter) !== -1) {
            _arr = val.split(delimiter);

            obj.title = _arr[0].trim();
            obj.detail = _arr[1].trim();
        }
        else {
            obj = {
                title: val,
                detail: ""
            };
        }

        return obj;
    }
    else {
        if (template === "menu") {
            if (val.indexOf(delimiter) !== -1) {
                _arr = val.split(delimiter);
                obj.theme = _arr[0].trim();
                obj.line_2 = _arr[1].trim();
            }
            else {
                obj.theme = val;
            }

            return obj;
        }

        if (template === "topping") {
            toppings = [];

            if (val.indexOf(delimiter) !== -1) {
                _arr = val.split(delimiter);

                _arr.forEach(function (item) {

                    if (item.indexOf(":") !== -1) {
                        tt = item.split(":");
                        toppings.push({
                            title: tt[0].trim(),
                            ingredients: tt[1].trim()
                        });
                    }
                    else {
                        toppings.push({ title: item.trim() });
                    }
                });

            } else {
                toppings.push({ title: val });
            }
            
            return toppings;
        }
    }
}

module.exports = {
    reader: reader
};
