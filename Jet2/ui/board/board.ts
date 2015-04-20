/// <reference path="../directives.ts" />
var tmp;
// TODO (othebe): This file is growing too big. Move private classes into their own files.
module Jet.Ui {
    export interface IBoardScope extends Jet.Application.IApplicationScope {
        height: Number;
	    zoomFactor : number;
        Math: any;
        pcb: Pcb;

        // Board options.
        // TODO (othebe): These should be moved into their own directive since
        // they are not technically part of the board.
        editGadget(): void;

        // Toggle grid.
        toggleGrid(): void;
    }



    // This represents a selectable board instance.
    class BoardSelectable implements Selectable.ISelectable {
        /** @override */
        public getType = function () {
            return Selectable.Type.BOARD;
        };

        constructor() { }
    }



    // This represents the OVERALL board, including the PCB and components.
    export class Board extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/board/board.html";
        private _scope: IBoardScope;
        private _snabric: Snabric.ISnabric;
        private _fabricCanvas: fabric.ICanvas;
        private _gDataFabricMap: Map<Selectable.ISelectable, BoardComponent>;
	    private _displayGroupToComponentMap: Map<fabric.IObject, BoardComponent>;
        private _previouslySelected: fabric.IObject[];
        private _isGridVisible: boolean;
        private _gridSize: number = 15;
        private _pcb: Pcb;
	
        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;
            
            this._gDataFabricMap = new Map<Selectable.ISelectable, BoardComponent>();
            this._displayGroupToComponentMap = new Map<fabric.IObject, BoardComponent>();

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

                // Initialize dimensions.
                var pcbGraphics = main._pcb.getGraphics();
                var margin = fabric.util.parseUnit(Constants.Board.PCB_MARGIN);
                main.setDimensions(margin + pcbGraphics.getWidth(), margin + pcbGraphics.getHeight());

                // Watch gadget model for changes.
                scope.$watch('gadgetModel.components', function (
                    newComponents: { [index: string]: Jet.Model.ComponentInstance },
                    oldComponents: { [index: string]: Jet.Model.ComponentInstance })
                {
                    main._updateUi(scope.gadgetModel);
                }, true);
		
                scope.$watch('zoomFactor', function (
                    oldValue: number,
                    newValue: number)
                {
		            main._updateBoardSize();
                }, true);

                // Update board dimensions.
                scope.$watch('gadgetModel.corners', function () {
                    var bbox = scope.gadgetModel.bounding_box();
                    var width = bbox.max_x - bbox.min_x;
                    var height = bbox.max_y - bbox.min_y;
                    main.setDimensions(width, height);
                }, true);

                // Update PCB padding.
                scope.$watch('pcb.getVerticalMargin()', function () {
                    main._updateBoardSize();
                    main._adjustPcbPosition();
                });

                // Perspective change.
		        scope.$on("change:perspective", function(name: ng.IAngularEvent,
							            newPerspective: number) {
		            main._clearUi();
		            main._updateUi(scope.gadgetModel);
		        });

                // Watch the selected gadget model data.
                scope.$watch('selectedGadgetComponent.selected', function () {
                    main._selectComponent(scope.selectedGadgetComponent.selected);
                }, true);

                // Board options.
                // TODO (othebe): See earlier TODO about moving them into a
                // separate directive.
                scope.editGadget = function () {
                    var selectable = new BoardSelectable();
                    scope.selectedGadgetComponent.selected = selectable;
                };

                // Toggle grid.
                // TODO (othebe): Set an option for toggling grid size.
                scope.toggleGrid = function () {
                    main._isGridVisible = !main._isGridVisible;
                    main._setGridVisibility(main._isGridVisible);
                };
            }
        }

        // Set dimensions of the PCB based on the width and height. The values
        // passed to the function are in mm units.
        public setDimensions(width: number, height: number) {
            var graphicsObj = this._pcb.getGraphics();
            graphicsObj.setHeight(fabric.util.parseUnit(height + 'mm'));
            graphicsObj.setWidth(fabric.util.parseUnit(width + 'mm'));

            this._updateBoardSize();
        }

        // Updates the UI based on the zoom and PCB dimensions.
        private _updateBoardSize() {
            var effZoom = this._scope.zoomFactor;

            var graphicsObj = this._pcb.getGraphics();

            // Get PCB margins.
            var pcbMarginH = this._pcb.getHorizontalMargin();
            var pcbMarginV = this._pcb.getVerticalMargin();

            // Calculate canvas dimensions.
            var width = graphicsObj.getWidth() + (2 * pcbMarginH);
            var height = graphicsObj.getHeight() + (2 * pcbMarginV);
    
            this._fabricCanvas.setHeight(height * effZoom); 
            this._fabricCanvas.setWidth(width * effZoom);

            this._fabricCanvas.setZoom(this._scope.zoomFactor);

            this._setGridVisibility(this._isGridVisible);
        }

        // Adjust PCB position to put it in the middle.
        private _adjustPcbPosition() {
            var graphics = this._pcb.getGraphics();
            graphics.left = this._pcb.getHorizontalMargin();
            graphics.top = this._pcb.getVerticalMargin();
            graphics.setCoords();
        }

        // Set grid visibility.
        private _setGridVisibility(isVisible: boolean) {
            var graphicsObj = this._pcb.getGraphics();

            // Get PCB margins.
            var pcbMarginH = this._pcb.getHorizontalMargin();
            var pcbMarginV = this._pcb.getVerticalMargin();

            // Calculate canvas dimensions.
            var width = graphicsObj.getWidth() + (2 * pcbMarginH);
            var height = graphicsObj.getHeight() + (2 * pcbMarginV);

            this._snabric.setGridVisibility(isVisible, {
                width: width,
                height: height,
                tileSize: this._gridSize
            });
        }
	
        // Initialize FabricJS canvas.
        private _initializeFabric(instanceElement: JQuery) {
            var main = this;

            // Setup Snabric.
            var canvasElt: HTMLCanvasElement = instanceElement[0].getElementsByTagName('canvas')[0];
            this._snabric = new Snabric(canvasElt);

            // Initialize fabric canvas.
            this._fabricCanvas = this._snabric.getCanvas();
            main._scope.zoomFactor = 1;

            // Initialize grid to OFF.
            this._snabric.setGridVisibility(false);
            this._isGridVisible = false;

            // Disable selection.
            this._fabricCanvas.selection = false;

            // Set background color.
            this._fabricCanvas.setBackgroundColor(Constants.Board.WORKSPACE_BG_COLOR,
                this._fabricCanvas.renderAll.bind(this._fabricCanvas));

	        main._scope.Math = Math; // Have to get Math into the scope, so it's visible in the binding.
		
            // Setup canvas events.
            this._fabricCanvas.on('mouse:down', function () {
                if (main._fabricCanvas.getActiveObject() == null) {
                    main._scope.selectedGadgetComponent.selected = null;
                    main._scope.$applyAsync();
                }
            });

            this._fabricCanvas.on('selection:created', function () {
                main._fabricCanvas.discardActiveGroup();
                // TODO (othebe): Selection disabled for now since there's a lot of bugs to fix here.
		        //if (main._fabricCanvas.getActiveGroup() != null) {
		        //    main._fabricCanvas.getActiveGroup().perPixelTargetFind = true;
		        //}
	        });
	    
	        // Handle group rotation and movement. First, just before the
	        // selection cleared, grab the list of canvas objects that were
	        // selected.
            // TODO (othebe): Needs fixing.
	        this._fabricCanvas.on('before:selection:cleared', function() {
		        //if (main._fabricCanvas.getActiveGroup() != null) {
		        //    main._previouslySelected = main._fabricCanvas.getActiveGroup().getObjects();
		        //} else {
		        //    main._previouslySelected = null;
		        //}
	        });
	    
	        // Then, after the selection is destroyed, propogate the location
	        // back to the BoardObject.  We have to do it in two stages,
	        // because when the object is selected, it's in a group and its
	        // coordinates are relative to the group's origin.
            // TODO (othebe): Needs fixing.
	        this._fabricCanvas.on('selection:cleared', function() {
		        //if (main._previouslySelected != null) {
		        //    for (var i = 0; i < main._previouslySelected.length; i++) {
			    //        main._displayGroupToComponentMap.get(main._previouslySelected[i]).updateTransformation();
		        //    }
		        //}
		        //main._previouslySelected = null;
	        });

            // Handle the delete key on the canvas.
            this._snabric.handleKeyPress = function (e: KeyboardEvent) {
                var key = e.keyCode || e.which;
                if (key == 46) {
                    var active = this._fCanvas.getActiveGroup() || this._fCanvas.getActiveObject();
                    if (active != null) {
                        // Update gadget model.
                        main._gDataFabricMap.forEach((boardComponent) => {
                            if (boardComponent.compareFabricObject(active)) {
                                var componentData = boardComponent.getComponentInstance();
                                main._scope.gadgetModel.delete_component(componentData.get_name());
                                main._scope.$applyAsync();
                            }
                        });
                        // Update Ui.
                        this.remove(active);
                    }
                }
            };

            // Display the PCB.
            this._scope.pcb = new Pcb(main._scope.gadgetModel);
            this._pcb = this._scope.pcb;
            var graphics = this._pcb.getGraphics();
            this._snabric.getCanvas().add(graphics);
            this._adjustPcbPosition();
        }

	    private _clearUi() {
	        this._fabricCanvas.clear();
	        this._displayGroupToComponentMap.clear();
	        this._gDataFabricMap.clear();
	    }

        // Update components displayed on the board.
        private _updateUi(gadgetModel: Jet.Model.GadgetModel) {
            // Check for new components.
            for (var key in gadgetModel.components) {
                var componentData = gadgetModel.components[key];

                var placedParts = componentData.get_placed_parts();
                for (var ndx = 0; ndx < placedParts.length; ndx++) {
                    var placedPartData = placedParts[ndx];
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

            this._snabric.loadFromUrl(catalogModelData.getSvgUrl(), (sImg) => {
                var boardComponent = new BoardComponent(componentData, placedPartData, sImg, main._snabric, main._scope, main._pcb);
                main._gDataFabricMap.set(placedPartData, boardComponent);
                main._displayGroupToComponentMap.set(boardComponent.getFabricImage(), boardComponent);
            }); 
        }

        // Select a board component.
        private _selectComponent(selected: Selectable.ISelectable) {
            var selectedComponent = this._gDataFabricMap.get(selected);
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
