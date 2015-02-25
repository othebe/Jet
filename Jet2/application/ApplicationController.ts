module Jet.Application {
    interface IApplicationScope extends ng.IScope {
        // Get catalog model.
        catalogModel: Jet.Model.CatalogModel;
    }

    export class ApplicationController {
        static $inject = ['$scope'];

        // Application context.
        private _appContext: AppContext;

        constructor(private $scope: IApplicationScope) {
            this._appContext = new AppContext();

            $scope.catalogModel = this._appContext.getCatalogModel();
        }
    }
} 