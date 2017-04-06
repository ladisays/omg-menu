// defining modules
angular.module("templatePDF.services", []);
angular.module("templatePDF.directives", []);
angular.module("templatePDF.controllers", []);

// Load all services
require("./services/notify");

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

templatePDF.run(function ($rootScope, $http, $location, Notify) {
    $rootScope.host = $location.absUrl();
    $rootScope.sheet = {
        type: "selection"
    };
    $rootScope.submitting = false;
    $rootScope.downloadLinks = [];
    $rootScope.submit = function (sheet) {
        if (sheet.type === "selection" && (!sheet.startAt || !sheet.endAt)) {
            Notify.error("Please, put in your values");
            return;
        }

        if (sheet.type === "selection" && (isNaN(sheet.startAt) || isNaN(sheet.endAt))) {
            Notify.error("You have supplied invalid values");
            return;
        }

        $rootScope.submitting = true;
        $rootScope.downloadLinks = [];
        $http.post("/api/convert", sheet)
        .then(function (res) {
            $rootScope.submitting = false;
            $rootScope.downloadLinks = res.data;
            Notify.success($rootScope.downloadLinks.length > 1 ? "The files were successfully created!" : "The file was created successfully!");
            $rootScope.sheet = {};
        }, function () {
            $rootScope.submitting = false;
            Notify.error("An error occurred during conversion. Please, try again later.");
        });
    };
});