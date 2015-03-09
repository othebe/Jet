/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IBoardScope extends Jet.Application.IApplicationScope {
        height: Number;
    }

    class BoardComponent {
        private _catalogModelData: Jet.Model.CatalogModelData;

        constructor(
            private _gadgetModelData: Jet.Model.GadgetModelData,
            private _fabricImage: fabric.IImage,
            private _scope: IBoardScope)
        {
            var main = this;

            this._catalogModelData = _scope.catalogModel.getComponent(
                _gadgetModelData.keyname);

            this._fabricImage.on('selected', function () {
                main._scope.selectedGadgetComponent.selected = _gadgetModelData;
                main._scope.$applyAsync();
            });

            // Watch related gadget model data for changes.
            //this._scope.$watch
        }

        public getFabricImage(): fabric.IImage {
            return this._fabricImage;
        }

    }

    export class Board extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/board/board.html";
        private _scope: IBoardScope;
        private _fabricCanvas: fabric.ICanvas;
        private _gDataFabricMap: Map<Jet.Model.GadgetModelData, BoardComponent>;

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;
            
            this._gDataFabricMap = new Map<Jet.Model.GadgetModelData, BoardComponent>();

            this.templateUrl = function () {
                return this._templateUrl;
            }

            this.link = function (scope: IBoardScope, instanceElement: JQuery) {
                main._scope = scope;

                // Initialize fabric canvas.
                main._initializeFabric(instanceElement);

                // Watch gadget model for changes.
                scope.$watch('gadgetModel.components', function (
                    newComponents: { [index: string]: Jet.Model.GadgetModelData },
                    oldComponents: { [index: string]: Jet.Model.GadgetModelData })
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
                var gadgetModelData = gadgetModel.components[key];
                if (!this._gDataFabricMap.has(gadgetModelData)) {
                    this._addComponent(gadgetModelData);
                }
            }
            // TODO (othebe): Check for deleted components.
        }

        // Add a component to the board.
        private _addComponent(gadgetModelData: Jet.Model.GadgetModelData) {
            var main = this;
            var catalogModelData = this.AppContext.getCatalogModel().getComponent(gadgetModelData.keyname);
            var fabricImage = fabric.Image.fromURL(catalogModelData.getSvgUrl(), function (img) {
                var boardComponent = new BoardComponent(gadgetModelData, img, main._scope);
                main._gDataFabricMap.set(gadgetModelData, boardComponent);
                main._fabricCanvas.add(img);
            });            
        }

        // Select a board component.
        private _selectComponent(gadgetModelData: Jet.Model.GadgetModelData) {
            var selectedComponent = this._gDataFabricMap.get(gadgetModelData);
            if (selectedComponent != null) {
                this._fabricCanvas.setActiveObject(selectedComponent.getFabricImage());
            } else {
                this._fabricCanvas.discardActiveObject();
            }
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new Board(AppContext);
            };

            return directive;
        }
    }
} 