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