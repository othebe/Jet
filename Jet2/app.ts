/// <reference path="public/typings/angularjs/angular.d.ts" />
/// <reference path="public/typings/fabricjs/fabricjs.d.ts" />
/// <reference path="public/typings/snapsvg/snapsvg.d.ts" />
/// <reference path="public/typings/angular-material/angular-material.d.ts" />
/// <reference path="public/libraries/snabric/snabric.d.ts" />
/// <reference path="common/fabric.d.ts" />
/// <reference path="application/applicationController.ts" />
/// <reference path="perspectives/perspectiveController.ts" />
/// <reference path="ui/board/board.ts" />
/// <reference path="ui/catalog/catalog.ts" />
/// <reference path="ui/catalogEntry/catalogEntry.ts" />
/// <reference path="ui/componentInspector/componentInspector.ts" />
/// <reference path="ui/componentInspector/componentNameInspector.ts" />
/// <reference path="ui/componentInspector/componentTransformationInspector.ts" />
/// <reference path="ui/gadgetExplorer/gadgetExplorer.ts" />
/// <reference path="ui/gadgetExplorer/gadgetExplorerEntry.ts" />
/// <reference path="ui/gadgetInspector/gadgetInspector.ts" />
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
	// Gadget explorer entry.
    app.directive('gadgetExplorerEntry', Jet.Ui.GadgetExplorerEntry.Factory());
    // Gadget inspector entry.
    app.directive('gadgetInspector', Jet.Ui.GadgetInspector.Factory());
	// Board.
	app.directive('board', Jet.Ui.Board.Factory());
	// Component inspector.
	app.directive('componentInspector', Jet.Ui.ComponentInspector.Factory());
	// Component name inspector.
	app.directive('componentNameInspector', Jet.Ui.ComponentNameInspector.Factory());
	// Component transformation inspector.
	app.directive('componentTransformationInspector', Jet.Ui.ComponentTransformationInspector.Factory());
})();
