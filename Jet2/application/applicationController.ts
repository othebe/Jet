﻿module Jet.Application {
    // This represents a selectable object.
    export interface ISelectable {
    }

    export interface IApplicationScope extends ng.IScope {
        // Get catalog model.
        catalogModel: Jet.Model.CatalogModel;

        // Get gadget model.
        gadgetModel: Jet.Model.GadgetModel;

        // Currently selected gadget component. Stored in map for nested
        // directives. Access under 'selected' key.
        // http://jimhoskins.com/2012/12/14/nested-scopes-in-angularjs.html
        selectedGadgetComponent: {selected: Jet.Application.ISelectable};

        about: string;
    }

    export class ApplicationController {
        static $inject = ['$scope', 'AppContext'];

        constructor(private $scope: IApplicationScope, private AppContext: AppContext) {
            $scope.catalogModel = AppContext.getCatalogModel();
            $scope.gadgetModel = AppContext.getGadgetModel();
            $scope.selectedGadgetComponent = { selected: null };
            
            $scope.about = "Gadgetron Jet V2.0";
        }
    }
}