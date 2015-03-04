module Jet.Application {
    export interface IApplicationScope extends ng.IScope {
        // Get catalog model.
        catalogModel: Jet.Model.CatalogModel;

        // Get application information.
        about: string;
    }

    export class ApplicationController {
        static $inject = ['$scope', 'AppContext'];

        constructor(private $scope: IApplicationScope, private AppContext: AppContext) {
            $scope.catalogModel = AppContext.getCatalogModel();
            $scope.about = "Gadgetron Jet V2.0";
        }
    }
} 