/// <reference path="../abstractBoardComponent.ts" />

module Jet.Ui.Board {
    interface IGadgetBoardComponentScope extends IAbstractBoardComponentScope {
        center: Point;
        dimensions: Point;
        padding: number;
        transformation: Transformation;

        handleMouseDown: (MouseEvent) => void;
    }

    class Transformation {
        constructor(public x: number, public y: number, public rot: number) { }
    }

    export class GadgetBoardComponent extends AbstractBoardComponent {
        private _templateUrl = 'ui/board/gadgetBoard/gadgetBoardComponent.html';

        // Eagle display mapper.
        private _eagleDisplayMapper: EagleDisplayMapper;

        constructor(AppContext: AppContext) {
            super(AppContext);

            // Add extra scope data.
            this.scope.padding = '=';
        }

        /** @override */
        protected onScopeLoaded_(scope: IGadgetBoardComponentScope, instanceElement: JQuery) {
            scope = <IGadgetBoardComponentScope> scope;

            // Render SVG.
            this._render(scope, instanceElement);

            // Update transformation.
            this._updateTransformation(scope);

            // Set dimensions.
            this._setDimensions(scope);

            // Handle mouse down.
            scope.handleMouseDown = (e: MouseEvent) => {
                this._handleMouseDown(e, scope);
            }
        }

        /** @override */
        protected updateUi_(scope: IGadgetBoardComponentScope) {
            // Update transformation.
            this._updateTransformation(scope);
        }

        // Renders image.
        private _render(scope: IGadgetBoardComponentScope, instanceElement: JQuery) {
            /* Render helpers. */
            var _renderImage = function () {
                instanceElement.find('g.img')[0].innerHTML = scope.boardComponent.get_catalog_data().getSvgData();
            }.bind(this);

            var _renderText = function () {
            }.bind(this);

            // Render image.
            _renderImage();
            // Renter text.
            _renderText();
        }

        // Set image dimensions in scope.
        private _setDimensions(scope: IGadgetBoardComponentScope) {
            var placedPart = scope.boardComponent;
            var eagleDisplayMapper = placedPart.get_catalog_data().getEagleDisplayMapper();
            if (eagleDisplayMapper != null) {
                var dimensions = new Point(eagleDisplayMapper.getWidth(), eagleDisplayMapper.getHeight());
                scope.dimensions = dimensions;
            }
        }

        // Updates transformation in scope.
        private _updateTransformation(scope: IGadgetBoardComponentScope) {
            var placedPart = scope.boardComponent;
            var eagleDisplayMapper = placedPart.get_catalog_data().getEagleDisplayMapper();
            if (eagleDisplayMapper != null) {
                var eaglePoint = new Point(placedPart.get_xpos(), placedPart.get_ypos());
                var rot = placedPart.get_rot();
                var displayPoint = eagleDisplayMapper.convertEagleToDisplayPoint(eaglePoint, rot);
                var padding = scope.padding;

                scope.transformation = new Transformation(displayPoint.x + padding, displayPoint.y + padding, rot);
            } else {
                throw Constants.Strings.VIEWBOX_MISSING;
            }
        }

        // Handle mouse down.
        private _handleMouseDown(e: MouseEvent, scope: IGadgetBoardComponentScope) {
            this.setSelected_(scope, true);
        }

        /** @override */
        public templateUrl() {
            return this._templateUrl;
        }

        /** @override */
        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new GadgetBoardComponent(AppContext);
            }

            return directive;
        }
    }
} 