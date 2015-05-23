module Jet.Application {
    export interface IApplicationScope extends ng.IScope {
        // Get catalog model.
        catalogModel: Jet.Model.CatalogModel;

        // Get gadget model.
        gadgetModel: Jet.Model.GadgetModel;

        // Current UI selection.
        selection: Jet.Selection.Manager;

        // About us!
        about: string;

        // Perspective index.
        perspectiveIndex: number;

        // Determines if perspective is touch-based.
        isPerspectiveTouchBased: () => boolean;

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
            $scope.perspectiveIndex = 4;

            $scope.about = "Gadgetron Jet V2.0";

            $scope.isPerspectiveTouchBased = function () {
                return Perspective.PerspectiveController.isPerspectiveTouchBased($scope.perspectiveIndex);
            };

            $scope.$watch('perspectiveIndex', function () {
                $rootScope.$broadcast("change:perspective", $scope.perspectiveIndex);
            });
        }
    }
}