/// <reference path="public/typings/angularjs/angular.d.ts" />
/// <reference path="application/applicationcontroller.ts" />
/// <reference path="perspectives/perspectivecontroller.ts" />
/// <reference path="ui/board/board.ts" />
/// <reference path="ui/catalog/catalog.ts" />
/// <reference path="ui/catalogentry/catalogentry.ts" />
/// <reference path="ui/gadgetexplorer/gadgetexplorer.ts" />
/// <reference path="ui/menu/menuBar.ts" />

(function () {
    var app = angular.module('Jet', ['ngMaterial']);

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
    // Menu directive.
    app.directive('menuBar', Jet.Ui.MenuBar.Factory());
    // Gadget explorer.
    app.directive('gadgetExplorer', Jet.Ui.GadgetExplorer.Factory());
    // Board.
    app.directive('board', Jet.Ui.Board.Factory());
})();
                              