module.exports = {
    "globals": {
        "angular": true,
        "moment": true,
        "_": true,
        "toastr": true,
        "$": true
    },
    "env": {
        "browser": true,
        "commonjs": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};