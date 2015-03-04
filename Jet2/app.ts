/// <reference path="public/typings/angularjs/angular.d.ts" />
/// <reference path="application/applicationController.ts" />
/// <reference path="perspectives/perspectiveController.ts" />
/// <reference path="ui/board/board.ts" />
/// <reference path="ui/catalog/catalog.ts" />
/// <reference path="ui/catalogentry/catalogEntry.ts" />
/// <reference path="ui/componentinspector/componentInspector.ts" />
/// <reference path="ui/componentinspector/componentNameInspector.ts" />
/// <reference path="ui/componentinspector/componentTransformationInspector.ts" />
/// <reference path="ui/gadgetexplorer/gadgetExplorer.ts" />
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
    // Component inspector.
    app.directive('componentInspector', Jet.Ui.ComponentInspector.Factory());
    // Component name inspector.
    app.directive('componentNameInspector', Jet.Ui.ComponentNameInspector.Factory());
    // Component transformation inspector.
    app.directive('componentTransformationInspector', Jet.Ui.ComponentTransformationInspector.Factory());
})();
                              