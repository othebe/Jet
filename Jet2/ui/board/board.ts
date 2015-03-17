/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IBoardScope extends Jet.Application.IApplicationScope {
        height: Number;
    }

    interface IBoardComponentScope extends ng.IScope {
        placedPartData?: Jet.Model.PlacedPart;
    }

    class BoardComponent {
        private _catalogModelData: Jet.Model.CatalogModelData;
        private _position: { x: number; y: number };
        private _boardComponentScope: IBoardComponentScope;

        private _ENABLE_RESTRAINTS: boolean = false;

        constructor(
            private _componentData: Jet.Model.ComponentInstance,
            private _placedPartData: Jet.Model.PlacedPart,
            private _fabricImage: fabric.IImage,
            private _fabricCanvas: fabric.ICanvas,
            private _scope: IBoardScope)
        {
            var main = this;

            this._catalogModelData = _scope.catalogModel.getComponent(
                _componentData.keyname);

            this._position = { x: this._placedPartData.xpos, y: this._placedPartData.ypos };

            this._boardComponentScope = this._scope.$new(true);
            this._boardComponentScope.placedPartData = this._placedPartData;

            this._setupFabricListeners();

            // Watch related gadget model data for changes.
            this._boardComponentScope.$watch('placedPartData', function (gadgetModelData: Jet.Model.PlacedPart) {
                var x = gadgetModelData.xpos;
                var y = gadgetModelData.ypos;
                var rot = gadgetModelData.rot;

                if (main._ENABLE_RESTRAINTS) {
                    // TODO (othebe): Enable restrains once the positioning
                    // is confirmed.
                } else {
                    main._setTranslation(x, y);
                    main._setRotation(rot);
                }
            }, true); 
        }

        private _setupFabricListeners() {
            var main = this;

            // Set origin point for image to center.
            this._fabricImage.originX = 'center';
            this._fabricImage.originY = 'center';

            // Lock scaling.
            this._fabricImage.lockUniScaling = true;
            this._fabricImage.lockScalingX = true;
            this._fabricImage.lockScalingY = true;

            // Handle image selection.
            this._fabricImage.on('selected', function () {
                main._scope.selectedGadgetComponent.selected = main._componentData;
                main._scope.$applyAsync();
            });

            this._fabricImage.on('modified', function () {
            });

            // Handle image translation.
            this._fabricImage.on('moving', function () {
                var center = main._getCenter();

                // Restrain if enabling boundary checking.
                if (main._ENABLE_RESTRAINTS) {
                    // Check valid horizontal movement.
                    if (main._isValidXPosition()) {
                        main._position.x = center.x;
                    }

                    // Check valid vertical movement.
                    if (main._isValidYPosition()) {
                        main._position.y = center.y;
                    }

                    // Restrain movement if necessary.
                    var restrainMovement = main._position.x != center.x ||
                        main._position.y != center.y;
                    if (restrainMovement) {
                        main._setTranslation(main._position.x, main._position.y);
                    }
                } else {
                    main._position.x = center.x;
                    main._position.y = center.y;
                }

                main._placedPartData.xpos = main._position.x;
                main._placedPartData.ypos = main._position.y;
                main._scope.$applyAsync();
            });

            // Handle image rotation.
            this._fabricImage.on('rotating', function () {
                main._placedPartData.rot = main._fabricImage.getAngle();
                main._scope.$applyAsync();

                // TODO (othebe): Enable restriction checking.
            });
        }

        public getFabricImage(): fabric.IImage {
            return this._fabricImage;
        }

        // Returns the center co-ordinates of the image.
        private _getCenter(): { x: number; y: number } {
            return {
                x: this._fabricImage.getLeft(),
                y: this._fabricImage.getTop()
            };
        }

        // Check valid x position for image.
        // TODO (othebe): Might be incomplete.
        private _isValidXPosition(): boolean {
            var bbox = this._fabricImage.getBoundingRect();
            var canvasWidth = this._fabricCanvas.getWidth();

            return !(bbox.left < 0 || bbox.left + bbox.width > canvasWidth);
        }

        // Check valid y position for image.
        // TODO (othebe): Might be incomplete.
        private _isValidYPosition(): boolean {
            var bbox = this._fabricImage.getBoundingRect();
            var canvasHeight = this._fabricCanvas.getHeight();

            return !(bbox.top < 0 || bbox.top + bbox.height > canvasHeight);
        }

        // Set translation of image on canvas.
        private _setTranslation(x: number, y: number) {
            this._fabricImage.setLeft(x);
            this._fabricImage.setTop(y);
        }

        // Set rotation of image on canvas.
        private _setRotation(angle: number) {
            this._fabricImage.setAngle(angle);
        }
    }

    export class Board extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/board/board.html";
        private _scope: IBoardScope;
        private _fabricCanvas: fabric.ICanvas;
        private _gDataFabricMap: Map<Jet.Model.PlacedPart, BoardComponent>;

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;
            
            this._gDataFabricMap = new Map<Jet.Model.PlacedPart, BoardComponent>();

            this.templateUrl = function () {
                return this._templateUrl;
            }

            this.scope = {
                catalogModel: '=',
                gadgetModel: '=',
                selectedGadgetComponent: '='
            };

            this.link = function (scope: IBoardScope, instanceElement: JQuery) {
                main._scope = scope;

                // Initialize fabric canvas.
                main._initializeFabric(instanceElement);

                // Watch gadget model for changes.
                scope.$watch('gadgetModel.components', function (
                    newComponents: { [index: string]: Jet.Model.ComponentInstance },
                    oldComponents: { [index: string]: Jet.Model.ComponentInstance })
                {
                    main._updateUi(scope.gadgetModel);
                }, true);

                // Watch the selected gadget model data.
                scope.$watch('selectedGadgetComponent.selected', function () {
                    main._selectComponent(scope.selectedGadgetComponent.selected);
                }, true);
            }
        }

        // Initialize FabricJS canvas.
        private _initializeFabric(instanceElement: JQuery) {
            var main = this;

            // Initialize fabric canvas.
            var canvasElt: HTMLCanvasElement = instanceElement[0].getElementsByTagName('canvas')[0];
            this._fabricCanvas = new fabric.Canvas(canvasElt);
            this._fabricCanvas.setHeight(instanceElement.find('.board-container').innerHeight());
            this._fabricCanvas.setWidth(instanceElement.find('.board-container').innerWidth());

            // Setup canvas events.
            this._fabricCanvas.on('mouse:down', function () {
                if (main._fabricCanvas.getActiveObject() == null) {
                    main._scope.selectedGadgetComponent.selected = null;
                    main._scope.$applyAsync();
                }
            });
        }

        // Update components displayed on the board.
        private _updateUi(gadgetModel: Jet.Model.GadgetModel) {
            // Check for new components.
            for (var key in gadgetModel.components) {
                var componentData = gadgetModel.components[key];
                var placedParts = componentData.getPlacedParts();

                for (var placedPartData in placedParts) {
                    if (!this._gDataFabricMap.has(placedPartData)) {
                        this._addComponent(componentData, placedPartData);
                    }
                }
            }
            // TODO (othebe): Check for deleted components.
        }

        // Add a component to the board.
        private _addComponent(componentData: Jet.Model.ComponentInstance, placedPartData: Jet.Model.PlacedPart) {
            var main = this;
            
            var catalogModelData = this.AppContext.getCatalogModel().getComponent(componentData.keyname);
            var fabricImage = fabric.Image.fromURL(catalogModelData.getSvgUrl(), function (img) {
                var boardComponent = new BoardComponent(componentData, placedPartData, img, main._fabricCanvas, main._scope);
                main._gDataFabricMap.set(placedPartData, boardComponent);
                main._fabricCanvas.add(img);
            });  
            
            this._extractImg(catalogModelData.getSvgUrl());          
        }

        private _extractImg(src: string) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', src, true);
            xhr.onload = function () {
                if (xhr.readyState == 4) {
                    var xml = xhr.responseXML;
                }
            };
            xhr.send();
        }

        // Select a board component.
        private _selectComponent(selected: Jet.Application.ISelectable) {
            //var selectedComponent = this._gDataFabricMap.get(selected);
            //if (selectedComponent != null) {
            //    this._fabricCanvas.setActiveObject(selectedComponent.getFabricImage());
            //} else {
            //    this._fabricCanvas.discardActiveObject();
            //}
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new Board(AppContext);
            };

            return directive;
        }
    }
} 