/// <reference path="../directives.ts" />

// TODO (othebe): This file is growing too big. Move private classes into their own files.
module Jet.Ui {
    interface IBoardScope extends Jet.Application.IApplicationScope {
        height: Number;
	    zoomFactor : number;
        Math: any;

        // Board options.
        // TODO (othebe): These should be moved into their own directive since
        // they are not technically part of the board.
        editGadget(): void;

        // Toggle grid.
        toggleGrid(): void;
    }


    
    interface IBoardComponentScope extends ng.IScope {
        placedPartData?: Jet.Model.PlacedPart;
        componentData?: Jet.Model.ComponentInstance;
    }


    
    // The PCB represents the actual physical board piece.
    // TODO (othebe): It would be a good idea to remove the dependency on Fabric by having
    // an interface for PCB using any graphics object <G>, and an implementation using <fabric.IObject>.
    class Pcb {
        // This is the graphics object that can be drawn.
        private _graphicsObject: fabric.IObject;

        // This is the margin around the PCB.
        private _marginX: number;
        private _marginY: number;

        constructor(private _gadgetModel: Jet.Model.GadgetModel) {
            this._marginX = fabric.util.parseUnit(Constants.Board.PCB_MARGIN);
            this._marginY = fabric.util.parseUnit(Constants.Board.PCB_MARGIN);

            this._constructGraphics();
        }

        // Get the graphics object representing the board.
        public getGraphics(): fabric.IObject {
            return this._graphicsObject;
        }

        // Get the horizontal margin.
        public getHorizontalMargin() {
            return this._marginX;
        }

        // Get the vertical margin.
        public getVerticalMargin() {
            return this._marginY;
        }

        // Determines whether a given graphics object is within the Pcb object.
        // If allowPartial is true, obj is within the Pcb even it is partially contained.
        public containsGraphicsObject(obj: fabric.IObject, allowPartial = true): boolean {
            return false;
        }

        // Construct the graphics object.
        // Complex PCB shapes can be added here, but we just use a rectangle for now.
        private _constructGraphics(): void {
            var bbox = this._gadgetModel.bounding_box();
            this._graphicsObject = new fabric.Rect({
                top: fabric.util.parseUnit(bbox.min_y + 'mm'),
                left: fabric.util.parseUnit(bbox.min_y + 'mm'),
                width: fabric.util.parseUnit((bbox.max_x - bbox.min_x) + 'mm'),
                height: fabric.util.parseUnit((bbox.max_y - bbox.min_y) + 'mm'),
                fill: Jet.Constants.Board.PCB_COLOR,
                selectable: false
            });
        }
    }



    // A board component represents a part that can be placed on the board.
    class BoardComponent {
        private _catalogModelData: Jet.Model.CatalogModelData;
        private _position: { x: number; y: number };
        private _rotation: number;
        private _fabricImage: fabric.IImage;
        private _fabricCanvas: fabric.ICanvas;
        private _boardComponentScope: IBoardComponentScope;
	    private _nameText: fabric.IText;
        private _ENABLE_RESTRAINTS: boolean = false;
        private _displayGroup: fabric.IGroup;
	
        constructor(
            private _componentData: Jet.Model.ComponentInstance,
            private _placedPartData: Jet.Model.PlacedPart,
            private _snabricImage: Snabric.IImage,
            private _snabric: Snabric.ISnabric,
            private _scope: IBoardScope,
            private _pcb: Pcb)
        {
            var main = this;

            this._catalogModelData = _scope.catalogModel.getComponent(_componentData.keyname);

            this._fabricCanvas = this._snabric.getCanvas();
            this._fabricImage = this._snabric.getFImg(this._snabricImage);

            // Default transformations.
            var x = 0;
            var y = 0;
            var rot = 0;

            if (this._placedPartData != null) {
                x = x || this._placedPartData.xpos;
                y = y || this._placedPartData.ypos;
                rot = rot || this._placedPartData.rot;
            }
            this._position = { x: x, y: y };
            this._rotation = rot;

            this._initializeGraphics();

            this._boardComponentScope = this._scope.$new(true);
            this._boardComponentScope.placedPartData = this._placedPartData;
            this._boardComponentScope.componentData = this._componentData;	 

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
	    
            // Watch related gadget model data for changes.
            this._boardComponentScope.$watch('componentData', function (component: Jet.Model.ComponentInstance) {
                main._nameText.setText(main._getDisplayName());
                main._updateGraphics();
            }, true);
        }

        // Initialize graphics.
        private _initializeGraphics() {
            // Snabric has already rendered the image at this point, so remove
            // it so we can re-add it as part of a group.
            this._fabricImage.remove();

            this._fabricImage.originX = 'center';
            this._fabricImage.originY = 'center';

            this.setText(this._getDisplayName());

            this._displayGroup = new fabric.Group([this._fabricImage, this._nameText]);

            // Set origin point for image to center.
            this._displayGroup.originX = 'center';
            this._displayGroup.originY = 'center';

            // Lock scaling.
            this._displayGroup.lockUniScaling = true;
            this._displayGroup.lockScalingX = true;
            this._displayGroup.lockScalingY = true;

            // Set initial transformations.
            this._setTranslation(this._position.x, this._position.y);
            this._setRotation(this._rotation);

            this._setupFabricListeners();

            this._fabricCanvas.add(this._displayGroup);

            this._updateGraphics();
        }

        // Gets text for component.
	    private _getDisplayName() {
	        var cname = this._componentData.get_name();
	        if (cname == "") {
		        cname = "<no name>";
	        }
	        if (this._componentData.get_placed_part_count() > 1) {
		        return cname + "." + this._placedPartData.get_ref();
	        } else {
		        return cname;
	        }
        }

        // Sets the display text.
        public setText(text: string, options?) {
            // Set text content.
            if (this._nameText != null) {
                this._nameText.setText(text);
            } else {
                var nameText = new fabric.Text(text, {
                    fill: 'red',
                    fontSize: 20,
                    fontWeight: 'bold',
                    fontFamily: "Arial, Helvetica, sans-serif"
                });
                nameText.originX = 'center';
                nameText.originY = 'center';
                this._nameText = nameText;
            }

            this._updateTextTransformation();
        }

        // Update transformation for the text.
        private _updateTextTransformation() {
            var offsetX = 0;
            var offsetY = 0;

            // Set text offset.
            this._nameText.setTop(offsetY + this._fabricImage.getTop());
            this._nameText.setLeft(offsetX + this._fabricImage.getLeft());

            // TODO (othebe): Rotate relative to fImg;
        }

	    public setLeft(x:number) {
	        this._displayGroup.setLeft(x);
        }

	    public setTop(x:number) {
	        this._displayGroup.setTop(x);
        }

	    public setAngle(x:number) {
	        this._displayGroup.setAngle(x);
	    }
	
        private _setupFabricListeners() {
            var main = this;

            // Handle image selection.
            this._displayGroup.on('selected', function () {
                main._scope.selectedGadgetComponent.selected = main._placedPartData;
                main._scope.$applyAsync();
            });

            this._displayGroup.on('modified', function () {
            });

            // Handle image translation.
            this._displayGroup.on('moving', function () {
		        main._updateLocation();
            });

            // Handle image rotation.
            this._displayGroup.on('rotating', function () {
                main._updateRotation();
                // TODO (othebe): Enable restriction checking.
            });
        }

        public getDisplayGroup(): fabric.IGroup {
            return this._displayGroup;
        }

        // Gets the component instance.
        public getComponentInstance(): Jet.Model.ComponentInstance {
            return this._componentData;
        }

        // Compares a fabric object with the graphic representation of this object.
        public compareFabricObject(fObj: fabric.IObject): boolean {
            return fObj == this._fabricImage || fObj == this._displayGroup;
        }

	    private _updateLocation() {
            var center = this._getCenter();

            // Restrain if enabling boundary checking.
            if (this._ENABLE_RESTRAINTS) {
                // Check valid horizontal movement.
                if (this._isValidXPosition()) {
                    this._position.x = center.x;
                }

                // Check valid vertical movement.
                if (this._isValidYPosition()) {
                    this._position.y = center.y;
                }

                // Restrain movement if necessary.
                var restrainMovement = this._position.x != center.x ||
                    this._position.y != center.y;
                if (restrainMovement) {
                    this._setTranslation(this._position.x, this._position.y);
                }
            } else {
                this._position.x = center.x;
                this._position.y = center.y;
            }

            this._placedPartData.xpos = this._position.x;
            this._placedPartData.ypos = this._position.y;
            this._scope.$applyAsync();
	    }

	    private _updateRotation() {
	        this._placedPartData.rot = this._displayGroup.getAngle() - Math.floor(this._displayGroup.getAngle()/360.0)*360.0; // There's a bug(?) in fabric that can produce rotations > 360 degrees.  This fixes it.
	        this._nameText.setAngle(-this._displayGroup.getAngle());
            this._scope.$applyAsync();
	    }

	    public updateGeometry() {
	        this._updateRotation();
	        this._updateLocation();
	    }
	
        // Returns the center co-ordinates of the image.
        private _getCenter(): { x: number; y: number } {
            return {
                x: this._displayGroup.getLeft(),
                y: this._displayGroup.getTop()
            };
        }

        // Check valid x position for image.
        // TODO (othebe): Might be incomplete.
        private _isValidXPosition(): boolean {
            var bbox = this._displayGroup.getBoundingRect();
            var canvasWidth = this._fabricCanvas.getWidth();

            return !(bbox.left < 0 || bbox.left + bbox.width > canvasWidth);
        }

        // Check valid y position for image.
        // TODO (othebe): Might be incomplete.
        private _isValidYPosition(): boolean {
            var bbox = this._displayGroup.getBoundingRect();
            var canvasHeight = this._fabricCanvas.getHeight();

            return !(bbox.top < 0 || bbox.top + bbox.height > canvasHeight);
        }

        // Set translation of image on canvas. This considers the offset of the PCB position.
        private _setTranslation(x: number, y: number) {
            var offsetLeft = this._pcb.getGraphics().left;
            var offsetTop = this._pcb.getGraphics().top;

            this.setLeft(x + offsetLeft);
            this.setTop(y + offsetTop);
        }

        // Set rotation of image on canvas.
        private _setRotation(angle: number) {
            this.setAngle(angle);
        }

        // Updates the graphics for this board component.
        private _updateGraphics() {
            this._fabricCanvas.renderAll();

        }
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
                    main._snabric.setGridVisibility(main._isGridVisible, {
                        tileSize: 15
                    });
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

            if (this._isGridVisible) {
                this._snabric.setGridVisibility(true, {
                    width: width,
                    height: height,
                    tileSize: this._gridSize
                });
            }
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

            // Set background color.
            this._fabricCanvas.setBackgroundColor('rgba(255, 255, 255, 1.0)',
                this._fabricCanvas.renderAll.bind(this._fabricCanvas));

	        main._scope.Math = Math; // Have to get Math into the scope, so it's visible in the binding.
		
            // Setup canvas events.
            this._fabricCanvas.on('mouse:down', function () {
                if (main._fabricCanvas.getActiveObject() == null) {
                    main._scope.selectedGadgetComponent.selected = null;
                    main._scope.$applyAsync();
                }
            });

	        this._fabricCanvas.on('selection:created', function() {
		        if (main._fabricCanvas.getActiveGroup() != null) {
		            main._fabricCanvas.getActiveGroup().perPixelTargetFind = true;
		        }
	        });
	    
	        // Handle group rotation and movement. First, just before the
	        // selection cleared, grab the list of canvas objects that were
	        // selected.
	        this._fabricCanvas.on('before:selection:cleared', function() {
		        if (main._fabricCanvas.getActiveGroup() != null) {
		            main._previouslySelected = main._fabricCanvas.getActiveGroup().getObjects();
		        } else {
		            main._previouslySelected = null;
		        }
	        });
	    
	        // Then, after the selection is destroyed, propogate the location
	        // back to the BoardObject.  We have to do it in two stages,
	        // because when the object is selected, it's in a group and its
	        // coordinates are relative to the group's origin.
	        this._fabricCanvas.on('selection:cleared', function() {
		        if (main._previouslySelected != null) {
		            for (var i = 0; i < main._previouslySelected.length; i++) {
			        main._displayGroupToComponentMap.get(main._previouslySelected[i]).updateGeometry();
		            }
		        }
		        main._previouslySelected = null;
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
            this._pcb = new Pcb(main._scope.gadgetModel);
            var graphics = this._pcb.getGraphics();
            graphics.left = this._pcb.getHorizontalMargin();
            graphics.top = this._pcb.getVerticalMargin();
            main._snabric.getCanvas().add(graphics);
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
                main._displayGroupToComponentMap.set(boardComponent.getDisplayGroup(), boardComponent);
                boardComponent.setTop(placedPartData.xpos);
                boardComponent.setLeft(placedPartData.ypos);
                boardComponent.setAngle(placedPartData.rot);
            }); 
        }

        // Select a board component.
        private _selectComponent(selected: Selectable.ISelectable) {
            var selectedComponent = this._gDataFabricMap.get(selected);
            if (selectedComponent != null) {
                this._fabricCanvas.setActiveObject(selectedComponent.getDisplayGroup());
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
