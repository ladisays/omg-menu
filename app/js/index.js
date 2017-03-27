// defining modules
angular.module("templatePDF.services", []);
angular.module("templatePDF.directives", []);
angular.module("templatePDF.controllers", []);

// Load all services

// Load all directives

// Load all controllers

var templatePDF = angular.module("templatePDF", [
    "ui.router",
    "templatePDF.services",
    "templatePDF.directives",
    "templatePDF.controllers"
]);

templatePDF.config(function ($locationProvider) {
    $locationProvider.html5Mode(true);
});

templatePDF.run(function ($rootScope, $http) {
    $rootScope.menu = {};
    $rootScope.creating = false;
    $rootScope.create = function (menu) {
        $rootScope.creating = true;
        $http.post("/api/convert", menu).then(function (res) {
            $rootScope.creating = false;
            $rootScope.downloadLink = res.data.filename;
            $rootScope.menu = {};
            return;
        }, function (err) {
            $rootScope.creating = false;
            return err;
        });
    };
});