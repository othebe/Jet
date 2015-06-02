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

        // Reset gadget.
        resetGadget: () => void;

        // Determines whether board information is showing.
        showBoardInfo: boolean;
    }

    export class ApplicationController {
        static $inject = ['$rootScope', '$scope', 'AppContext'];

        private _enableAutoSave: boolean;

        constructor(private $rootScope: ng.IRootScopeService,
            private $scope: IApplicationScope,
            private AppContext: AppContext)
        {
            var main = this;

            $scope.catalogModel = AppContext.getCatalogModel();
            $scope.gadgetModel = AppContext.getGadgetModel();
            $scope.selection = new Jet.Selection.Manager();
            $scope.perspectiveIndex = 0;
            

            $scope.about = "Gadgetron Jet V2.0";

            $scope.isPerspectiveTouchBased = function () {
                return Perspective.PerspectiveController.isPerspectiveTouchBased($scope.perspectiveIndex);
            };

            $scope.$watch('perspectiveIndex', function () {
                $rootScope.$broadcast("change:perspective", $scope.perspectiveIndex);
            });

            this._enableAutoSave = false;
            $scope.$watch('gadgetModel', function () {
                if (main._enableAutoSave) {
                    AppContext.getSaveStateManager().saveGSpec($scope.gadgetModel);
                }
            }, true);

            $scope.$watch('catalogModel.isLoaded()', function () {
                // TODO (othebe): Need to investigate why a delay is still required
                // even when loading the GSpec after the catalog is initialized.
                // It may be because we need to wait for all directives to load.
                if ($scope.catalogModel.isLoaded()) {
                    setTimeout(function () {
                        main._loadStartupGSpec();
                    }, 500);
                }
            });

            $scope.resetGadget = function () {
                main._resetGadget();
            };
        }

        // Loads existing GSpec on startup.
        private _loadStartupGSpec() {
            var existingGSpec = this.AppContext.getSaveStateManager().loadGSpec();
            if (existingGSpec != null) {
                this.AppContext.getGadgetModel().import_gspec_string(existingGSpec, this.AppContext.getCatalogModel());
                this.$scope.$applyAsync();
            }
            this._enableAutoSave = true;
        }

        // Reset gadget.
        private _resetGadget() {
            // Reset gadget model components.
            this.$scope.gadgetModel.components = {};
            // Reset gadget dimensions.
            var dimensions = InitialData.Board.dimensions;
            this.$scope.gadgetModel.set_corners([
                new Jet.Model.Vertex(dimensions.left, dimensions.top),
                new Jet.Model.Vertex(dimensions.left + dimensions.width, dimensions.top),
                new Jet.Model.Vertex(dimensions.left + dimensions.width, dimensions.top + dimensions.left + dimensions.height),
                new Jet.Model.Vertex(dimensions.left, dimensions.top + dimensions.height)
            ]);
                    
            this.AppContext.getSaveStateManager().clearGSpec();
        }
    }
}