/// <reference path="scripts/typings/angularjs/angular.d.ts" />
/// <reference path="application/applicationcontroller.ts" />
/// <reference path="perspectives/perspectivecontroller.ts" />
/// <reference path="ui/catalog/catalog.ts" />
/// <reference path="ui/catalogentry/catalogentry.ts" />

(function () {
    var app = angular.module('Jet', []);

    // Application context.
    app.service('AppContext', AppContext);

    
    // Application controller.
    app.controller('AppCtrl', Jet.Application.ApplicationController);
    // Perspective controller.
    app.controller('PerspectiveCtrl', Jet.Perspective.PerspectiveController);


    // Catalog directive.
    app.directive('catalog', Jet.Ui.Catalog.Factory());
    // Catalog entry directive.
    app.directive('catalogEntry', Jet.Ui.CatalogEntry.Factory());
})();
                              