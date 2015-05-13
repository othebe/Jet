/// <reference path="../abstractBoardComponent.ts" />

module Jet.Ui.Board {
    interface IGadgetBoardComponentScope extends IAbstractBoardComponentScope {
        clickedParts: Array<Model.PlacedPart>;
        componentTouchHandler: TouchHandler;
        dimensions: Point;
        getHorizontalTextTranslation: () => number;
        padding: number;
        pcbData: PcbData;
        rotatingComponents: Array<Model.PlacedPart>;
        rotationTouchHandler: TouchHandler;
        setSelectionToSingle: boolean;
        transformation: Transformation;
    }

    // This represents an image transformation.
    class Transformation {
        public positionFixed: boolean;

        constructor(
            public x: number, public y: number, public rot: number,
            public imgWidth: number, public imgHeight: number,
            private _pcbData: PcbData)
        {
            this._checkPosition();
        }

        // Fix boundaries.
        private _checkPosition() {
            // TODO (othebe)
        }
    }

    export class GadgetBoardComponent extends AbstractBoardComponent {
        private _templateUrl = 'ui/board/gadgetBoard/gadgetBoardComponent.html';

        // Eagle display mapper.
        private _eagleDisplayMapper: EagleDisplayMapper;

        constructor(AppContext: AppContext) {
            super(AppContext);

            // Add extra scope data.
            this.scope.clickedParts = '=';
            this.scope.padding = '=';
            this.scope.pcbData = '=';
            this.scope.rotatingComponents = '=';
            this.scope.setSelectionToSingle = '=';
        }

        /** @override */
        protected onScopeLoaded_(scope: IGadgetBoardComponentScope, instanceElement: JQuery) {
            scope = <IGadgetBoardComponentScope> scope;

            var main = this;

            // Render SVG.
            this._render(scope, instanceElement);

            // Update transformation.
            this._updateTransformation(scope);

            // Set dimensions.
            this._setDimensions(scope);

            // Set touch handler.
            scope.componentTouchHandler = new TouchHandler(
                // Mouse up.
                (touchHandler: TouchHandler) => {
                    this._handleMouseUp(scope, touchHandler);
                },
                // Mouse down.
                (touchHandler: TouchHandler) => {
                    this._handleMouseDown(scope, touchHandler);
                },
                // Mouse move.
                null);

            // Set rotation touch handler.
            scope.rotationTouchHandler = new TouchHandler(
                // Mouse up.
                null,
                // Mouse down.
                (touchHandler: TouchHandler) => {
                    this._handleRotationMouseDown(scope, touchHandler);
                },
                // Mouse move.
                null);

            // Set horizontal translation for text.
            scope.getHorizontalTextTranslation = function () {
                return main._getHorizontalTextTranslation(scope.dimensions.x, instanceElement);
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
                var imgWidthPx = EagleDisplayMapper.mmToPx(eagleDisplayMapper.getWidth());
                var imgHeightPx = EagleDisplayMapper.mmToPx(eagleDisplayMapper.getHeight());
                var dimensions = new Point(imgWidthPx, imgHeightPx);
                scope.dimensions = dimensions;
            }
        }

        public static getDisplayTransformationForComponent(boardComponent: Model.PlacedPart, padding: number, pcbData: PcbData): Transformation {
            var eagleDisplayMapper = boardComponent.get_catalog_data().getEagleDisplayMapper();
            if (eagleDisplayMapper != null) {
                var eaglePoint = new Point(boardComponent.get_xpos(), boardComponent.get_ypos());
                var rot = boardComponent.get_rot();
                var displayPoint = eagleDisplayMapper.convertEagleToDisplayPoint(eaglePoint, rot);
                
                // Eagle flips the y-axis.
                displayPoint.y *= -1;

                return new Transformation(
                    EagleDisplayMapper.mmToPx(displayPoint.x) + padding,
                    EagleDisplayMapper.mmToPx(displayPoint.y) + padding + pcbData.height,
                    rot,
                    eagleDisplayMapper.getWidth(), eagleDisplayMapper.getHeight(),
                    pcbData);
            } else {
                throw Constants.Strings.VIEWBOX_MISSING;
            }
        }

        // Updates transformation in scope.
        private _updateTransformation(scope: IGadgetBoardComponentScope) {
            // This block handles instancs where the scope has not been updated yet, such as
            // when switching perspectives.
            // TODO (othebe): Can this be solved with $applyAsync?
            if (scope.boardComponent == null || scope.padding == null || scope.pcbData == null) {
                scope.transformation = new Transformation(0, 0, 0, 0, 0, null);
                return;
            }
            var transformation = GadgetBoardComponent.getDisplayTransformationForComponent(scope.boardComponent, scope.padding, scope.pcbData);
            if (transformation != null) {
                scope.transformation = transformation;
            }
        }

        // Handle mouse up.
        private _handleMouseUp(scope: IGadgetBoardComponentScope, touchHandler: TouchHandler) {
            var modifier = touchHandler.getEventModifier();

            if (modifier == null) {
                if (scope.setSelectionToSingle) {
                    this.setSelected_(scope, true);
                }
            }
        }

        // Handle mouse down.
        private _handleMouseDown(scope: IGadgetBoardComponentScope, touchHandler: TouchHandler) {
            var modifier = touchHandler.getEventModifier();

            // Add to selection.
            if (modifier == TouchHandlerEventModifier.CTRL) {
                this.addToSelected_(scope);
            }
            // Remove from selection.
            else if (modifier == TouchHandlerEventModifier.SHIFT) {
                this.removeFromSelected_(scope);
            }
            // Set selection.
            else {
                if (!this.isSelected_(scope)) {
                    this.setSelected_(scope, true);
                }
            }

            if (scope.clickedParts.indexOf(scope.boardComponent) < 0) {
                scope.clickedParts.push(scope.boardComponent);
            }
        }

        // Handle rotation mouse move.
        private _handleRotationMouseDown(scope: IGadgetBoardComponentScope, touchHandler: TouchHandler) {
            scope.rotatingComponents.push(scope.boardComponent);
        }

        // Get horizontal translation to center text on image.
        private _getHorizontalTextTranslation(imgWidth: number, instanceElement: JQuery) {
            var text: any = instanceElement.find('.text text')[0];
            var textBBox = text.getBBox();

            return (imgWidth - textBBox.width) / 2.0;
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