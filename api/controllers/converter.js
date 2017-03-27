var pdf = require("html-pdf");
var pug = require("pug");
var path = require("path");
var options = {
    height: "720px",
    width: "960px",
    directory: "/public/files"
};

function toPDF(req, res) {
    var menu = req.body;
    console.log(menu);
    var template = pug.renderFile("api/templates/menu.pug", menu);
    
    pdf.create(template, options).toFile("./public/files/menu.pdf", function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json(err);
        }
        console.log(path.parse(data.filename));
        var dir = path.parse(data.filename);
        
        res.json({ filename: "/files/" + dir.base });
    });
}

module.exports = {
    toPDF: toPDF
};