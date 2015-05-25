module Jet.Perspective {
    var SubmenuChoice = {
        COMPONENT_LIBRARY: 'component-library',
        COMPONENT_INSPECTOR: 'component-inspector',
        GADGET_INSPECTOR: 'gadget-inspector',
        GADGET_EXPLORER: 'gadget-explorer'
    };

    interface IMinimalistPerspectiveScope extends IPerspectiveScope {
        // Submenu choices.
        submenuChoices: Object;

        // Selected submenu.
        submenuChoice: string;

        // Select submenu.
        selectSubmenu(submenuChoice: string): void;
    }

    export class MinimalistPerspective implements IPerspective {
        private _partialSrc: string = "perspectives/minimalistPerspective/minimalistPerspective.html";

        static $inject = ['$scope', 'AppContext', '$mdToast'];

        constructor(private $scope: IPerspectiveScope, private AppContext: AppContext, private $mdToast: ng.material.MDToastService) {
            var scope = <IMinimalistPerspectiveScope> ($scope);

            // Submenu choices.
            scope.submenuChoices = SubmenuChoice;

            // Default submenu.
            scope.submenuChoice = SubmenuChoice.COMPONENT_LIBRARY;

            // Select submenu.
            scope.selectSubmenu = function (submenuChoice: string) {
                scope.submenuChoice = submenuChoice;
            };

            // Toast stuff.
            this._showToast(scope, $mdToast);
        }

        // Get partial source.
        public getPartialSrc(): string {
            return this._partialSrc;
        }

        // Show welcome toast.
        private _showToast(scope: IMinimalistPerspectiveScope, $mdToast: ng.material.MDToastService) {
            $mdToast.show({
                controller: (scope, $mdToast) => {
                    scope.closeToast = function () {
                        $mdToast.hide();
                    };
                },
                templateUrl: 'perspectives/minimalistPerspective/welcomeToast.html',
                hideDelay: 5000,
                position: 'bottom right'
            });
        }
    }
} 