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
            this._catalogModelData = _scope.catalogModel.getComponent(
                _gadgetModelData.keyname);

            // Watch related gadget model data for changes.
        }

    }

    export class Board implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/board/board.html";
        private _scope: IBoardScope;
        private _fabricCanvas: fabric.ICanvas;
        private _gDataFabricMap: Map<Jet.Model.GadgetModelData, BoardComponent>;

        public templateUrl: () => string;
        public link: (scope: IBoardScope, instanceElement: JQuery) => void;

        constructor (private AppContext: AppContext) {
            var main = this;
            
            this._gDataFabricMap = new Map<Jet.Model.GadgetModelData, BoardComponent>();

            this.templateUrl = function () {
                return this._templateUrl;
            }

            this.link = function (scope: IBoardScope, instanceElement: JQuery) {
                // Initialize fabric canvas.
                var canvasElt: HTMLCanvasElement = instanceElement[0].getElementsByTagName('canvas')[0];
                main._fabricCanvas = new fabric.Canvas(canvasElt);
                main._fabricCanvas.setHeight(instanceElement.find('.board-container').innerHeight());
                main._fabricCanvas.setWidth(instanceElement.find('.board-container').innerWidth());

                // Watch gadget model for changes.
                scope.$watch('gadgetModel.components', function (
                    newComponents: { [index: string]: Jet.Model.GadgetModelData },
                    oldComponents: { [index: string]: Jet.Model.GadgetModelData })
                {
                    main._scope = scope;
                    main._updateUi(scope.gadgetModel);
                }, true);
            }
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
                main._fabricCanvas.add(img);

                var boardComponent = new BoardComponent(gadgetModelData, img, main._scope);
                main._gDataFabricMap.set(gadgetModelData, boardComponent);
            });            
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new Board(AppContext);
            }

            return directive;
        }
    }
} 