﻿/// <reference path="../abstractBoardComponent.ts" />

module Jet.Ui.Board {
    interface IGadgetBoardComponentScope extends IAbstractBoardComponentScope {
        clickedParts: Array<Model.PlacedPart>;
        componentTouchHandler: TouchHandler;
        dimensions: Point;
        getHorizontalTextTranslation: () => number;
        padding: number;
        pcbData: PcbData;
        setSelectionToSingle: boolean;
        transformation: Transformation;
    }

    // This represents an image transformation.
    class Transformation {
        public positionFixed: boolean;

        constructor(
            public x: number, public y: number, public rot: number,
            private _imgWidth: number, private _imgHeight: number,
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
                (touchHandler: TouchHandler) => {
                    this._handleMouseMove(scope, touchHandler);
                }
            );

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

        // Updates transformation in scope.
        private _updateTransformation(scope: IGadgetBoardComponentScope) {
            var placedPart = scope.boardComponent;
            var eagleDisplayMapper = placedPart.get_catalog_data().getEagleDisplayMapper();
            if (eagleDisplayMapper != null) {
                var eaglePoint = new Point(placedPart.get_xpos(), placedPart.get_ypos());
                var rot = placedPart.get_rot();
                var displayPoint = eagleDisplayMapper.convertEagleToDisplayPoint(eaglePoint, rot);
                var padding = scope.padding;

                // Eagle flips the y-axis.
                displayPoint.y *= -1;

                scope.transformation = new Transformation(
                    EagleDisplayMapper.mmToPx(displayPoint.x) + padding,
                    EagleDisplayMapper.mmToPx(displayPoint.y) + scope.pcbData.height + padding,
                    rot,
                    eagleDisplayMapper.getWidth(), eagleDisplayMapper.getHeight(),
                    scope.pcbData);

                // If the position was fixed, update the model accordingly.
                if (scope.transformation.positionFixed) {
                    // TODO (othebe)
                }
                
            } else {
                throw Constants.Strings.VIEWBOX_MISSING;
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

            scope.clickedParts.push(scope.boardComponent);
        }

        // Handle rotation mouse move.
        private _handleMouseMove(scope: IGadgetBoardComponentScope, touchHandler: TouchHandler) {
            // TODO (othebe): This actually handles the rotation control. The control needs to be
            // placed in a separate directive so this code can live there instead.
            var origin = new Point(0, 0);
            var rotation = touchHandler.getRotationAboutPoint(origin);

            if (rotation != null) {
                this.rotateBoardComponentBy_(scope.boardComponent, rotation);
            }
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