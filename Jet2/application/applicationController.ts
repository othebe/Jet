module Jet.Application {
    export interface IApplicationScope extends ng.IScope {
        // Get catalog model.
        catalogModel: Jet.Model.CatalogModel;

        // Get gadget model.
        gadgetModel: Jet.Model.GadgetModel;

        // Current UI selection.
        selection: Jet.Selection.Manager;

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
            $scope.selection = new Jet.Selection.Manager();
            
            $scope.about = "Gadgetron Jet V2.0";

	        $scope.selectPerspective = function(id:number) {
		        $rootScope.$broadcast("change:perspective", id);
	        }
        }
    }
}
