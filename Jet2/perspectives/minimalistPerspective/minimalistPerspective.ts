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

        static $inject = ['$scope', 'AppContext'];

        constructor(private $scope: IPerspectiveScope, private AppContext: AppContext) {
            var scope = <IMinimalistPerspectiveScope> ($scope);

            // Submenu choices.
            scope.submenuChoices = SubmenuChoice;

            // Default submenu.
            scope.submenuChoice = SubmenuChoice.COMPONENT_LIBRARY;

            // Select submenu.
            scope.selectSubmenu = function (submenuChoice: string) {
                scope.submenuChoice = submenuChoice;
            };
        }

        // Get partial source.
        public getPartialSrc(): string {
            return this._partialSrc;
        }
    }
} 