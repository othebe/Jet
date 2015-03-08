module Jet.Application {
    export interface IApplicationScope extends ng.IScope {
        // Get catalog model.
        catalogModel: Jet.Model.CatalogModel;

        // Get gadget model.
        gadgetModel: Jet.Model.GadgetModel;

        // Currently selected gadget component. Stored in map for nested
        // directives. Access under 'selected' key.
        selectedGadgetComponent: {selected: Jet.Model.GadgetModelData};

        test: boolean;
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