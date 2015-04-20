﻿module Jet.Application {
    export interface IApplicationScope extends ng.IScope {
        // Get catalog model.
        catalogModel: Jet.Model.CatalogModel;

        // Get gadget model.
        gadgetModel: Jet.Model.GadgetModel;

        // Currently selected gadget component. Stored in map for nested
        // directives.
        // 'selected' : Currently selected ISelectable.
        // 'eagleDisplayMapper' : Eagle <==> Display coordinate mapper.
        // http://jimhoskins.com/2012/12/14/nested-scopes-in-angularjs.html
        selectedGadgetComponent: { selected: Selectable.ISelectable; eagleDisplayMapper: EagleDisplayMapper };

        about: string;

        selectPerspective(id: number): void;

        // Determines whether board information is showing.
        showBoardInfo: boolean;
    }

    export class ApplicationController {
        static $inject = ['$rootScope', '$scope', 'AppContext'];

        constructor(private $rootScope: ng.IRootScopeService,
		    private $scope: IApplicationScope,
		    private AppContext: AppContext) {
            $scope.catalogModel = AppContext.getCatalogModel();
            $scope.gadgetModel = AppContext.getGadgetModel();
            $scope.selectedGadgetComponent = { selected: null, eagleDisplayMapper: null };
            
            $scope.about = "Gadgetron Jet V2.0";

	        $scope.selectPerspective = function(id:number) {
		        $rootScope.$broadcast("change:perspective", id);
	        }
        }
    }
}
