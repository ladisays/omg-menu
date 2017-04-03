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
    $rootScope.sheet = {};
    $rootScope.submitting = false;
    $rootScope.submit = function (sheet) {
        $rootScope.submitting = true;
        $http.post("/api/convert", sheet)
        .then(function (res) {
            $rootScope.submitting = false;
            $rootScope.downloadLinks = res.data;
            $rootScope.sheet = {};
        }, function () {
            $rootScope.submitting = false;
        });
    };
});