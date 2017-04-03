(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

templatePDF.run(function ($rootScope, $http, Notify) {
    $rootScope.sheet = {};
    $rootScope.submitting = false;
    $rootScope.downloadLinks = [];
    $rootScope.submit = function (sheet) {
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
},{"./services/notify":2}],2:[function(require,module,exports){
angular.module("templatePDF.services")
.factory("Notify", function () {
    return {
        success: function (text) {
            toastr.success(text, "Success");
        },
        error: function (text) {
            toastr.error(text, "Error");
        }
    };
});
},{}]},{},[1]);
