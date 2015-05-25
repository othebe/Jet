/// <reference path="../common/appContext.ts" />

module Jet.Perspective {
    export interface IPerspectiveScope extends ng.IScope {
        // Current perspective.
        perspective: IPerspective;

        // Expose Selectable.
        Selectable: any;
    }

    export class PerspectiveController {
        static $inject = ['$scope', 'AppContext', '$mdToast'];

        // Allowed perspectives.
        // TODO: Generate this array dynamically.
        private _perspectives: Array<(scope: IPerspectiveScope, appContext: AppContext, mdToast: ng.material.MDToastService) => IPerspective> = [
            function (scope, appContext) {
                return new Jet.Perspective.WorkspacePerspective(scope, appContext);
            },
            function (scope, appContext) {
                return new Jet.Perspective.DebugPerspective(scope, appContext);
            },
            function (scope, appContext) {
                return new Jet.Perspective.NBPerspective(scope, appContext);
            },
            function (scope, appContext) {
                return new Perspective.BoardPerspective(scope, appContext);
            },
            function (scope, appContext, mdToast) {
                return new Perspective.MinimalistPerspective(scope, appContext, mdToast);
            }
        ];

        constructor(private $scope: IPerspectiveScope, private appContext: AppContext, private $mdToast: ng.material.MDToastService, private $animate: any) {
            var main = this;

            var scope = $scope;

            $scope.$on("change:perspective", function (name: ng.IAngularEvent, newPerspective: number) {
                scope.perspective = main._perspectives[newPerspective](scope, appContext, $mdToast);
            });
        }

        public static isPerspectiveTouchBased(ndx: number): boolean {
            // TODO (othebe): This is based on _perspectives. We need to remove the check based on index
            // positioning inside _perspectives and use typeof instead.
            var touchBased = [4];

            return touchBased.indexOf(ndx) >= 0;
        }
    }
}