var request = require("request"),
    async = require("async"),
    path = require("path"),
    pdf = require("html-pdf"),
    pug = require("pug"),
    moment = require("moment"),
    options = {
        orientation: "landscape",
        type: "jpeg",
        quality: "100",
        directory: "/public/files",
        timeout: 300000
    };

function download(req, res) {
    var params = req.params;

    if (isNaN(params.menu_id)) {
        return res.status(400).json({error: "Invalid menu id supplied!"});
    }

    async.waterfall([
        getMenuDetails(params.menu_id),
        createMenuTemplate,
        createDishTemplates
    ], function (err, templates) {
        if (err) {
            return res.status(400).send(err);
        }

        templates.map(function (template) {
            template.url = req.headers.host + template.url;
        });

        res.status(200).send(templates);
    });
}

function getMenuDetails(menu_id) {
    var options = {
        uri: "http://staging.ohmygreen.com/api/caterings/menu_details",
        qs: {
            menu_id: menu_id
        }
    };

    return function (callback) {
        request(options, function (err, response, body) {
            if (err) {
                callback(err);
            }

            callback(null, JSON.parse(body));
        });
    };
}

function createMenuTemplate(menuDetails, callback) {
    var menu = {
        template: "menu",
        theme: menuDetails.menu.name,
        day: moment(menuDetails.menu_date).format("dddd"),
        image_url: "https://s3-us-west-2.amazonaws.com/zenbox-media/_default_menu.jpg",
        entrees: [],
        veg_entrees: [],
        sides: []
    };

    menuDetails.dishes.map(function (dish) {
        if (dish.dish_type === "entree") {
            menu.entrees.push(dish.name);
        } else if (dish.dish_type === "veg_entree") {
            menu.veg_entrees.push(dish.name);
        } else if (dish.dish_type === "side") {
            menu.sides.push({title: dish.name, detail: ""});
        }
    });

    var html = pug.renderFile("api/templates/menu.pug", menu),
        file = menu.theme.toLowerCase().replace("/","_");

    return pdf.create(html, options).toFile("./public/files/" + file + ".jpeg", function (err, data) {
        if (err) {
            callback(err);
        }

        var dir = path.parse(data.filename);
        
        callback(null, menuDetails, { type: "menu", title: menu.theme, url: "/files/" + dir.base });
    });
}

function createDishTemplates(menuDetails, menuTemplate, callback) {
    if (!menuDetails.dishes.length) {
        callback(null, menuTemplate);
    }

    var dish_types = {
        entree: "Entree",
        veg_entree: "Vegetarian Entree",
        side: "Side",
        dessert: "Dessert"
    };

    var dishes = menuDetails.dishes.map(function (dish) {
        var dish_menu = {
            template: "dish",
            api: true,
            title: dish.name,
            subtitle: dish.secondary_name,
            type: dish_types[dish.dish_type],
            ingredients: formatIngredients(dish.ingredients),
            allergens: "",
            image_url: "https://s3-us-west-2.amazonaws.com/zenbox-media/_default_menu.jpg",
            vegan: dish.is_vegan || dish.is_vegetarian,
            dairy: !dish.has_milk,
            soy: !dish.has_soy,
            wheat: !dish.has_wheat,
            nut: !dish.has_peanuts || !dish.has_treenuts,
            gluten: dish.is_gluten_free,
            paleo: dish.is_paleo,
            egg: !dish.has_eggs
        };
        
        var html = pug.renderFile("api/templates/menu.pug", dish_menu),
            file = dish_menu.title.toLowerCase().replace("/","_");

        return function (cb) {
            pdf.create(html, options).toFile("./public/files/" + file + ".jpeg", function (err, data) {
                if (err) {
                    cb(err);
                }
                
                var dir = path.parse(data.filename);

                cb(null, { type: "dish", title: dish_menu.title, url: "/files/" + dir.base });
            });
        };
    });

    async.parallel(dishes, function (err, results) {
        if (err) {
            callback(err);
        }

        results.push(menuTemplate);
        results = results.filter(function (result) {
            return result !== null;
        });

        callback(null, results);
    });
}

function formatIngredients(ingredients) {
    var result = "";

    ingredients.forEach(function (ingredient, i) {
        var name = ingredient.name;
        result += name.replace(name[0], name[0].toUpperCase());

        if (i !== (ingredients.length - 1)) {
            result += ", ";
        }
    });

    return result;
}

module.exports = {
    download: download
};
