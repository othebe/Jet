/// <reference path="../directives.ts" />

// TODO (othebe): This file is growing too big. Move private classes into their own files.
module Jet.Ui {
    interface IBoardScope extends Jet.Application.IApplicationScope {
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


    
    interface IBoardComponentScope extends ng.IScope {
        placedPartData?: Jet.Model.PlacedPart;
        componentData?: Jet.Model.ComponentInstance;
        pcb?: Pcb;
    }


    
    // A simple, yet fundamental Point class.
    class Point {
        constructor(public x: number, public y: number) { }

        public setXY(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
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

        // Set the horizontal margin.
        public setHorizontalMargin(margin: number) {
            this._marginX = margin;
        }

        // Set the vertical margin.
        public setVerticalMargin(margin: number) {
            this._marginY = margin;
        }

        // Determines whether a given graphics object is within the Pcb object.
        // If allowPartial is true, the function returns true even if there obj is partially contained.
        public overlapsObject(obj: fabric.IObject, allowPartial: boolean = true): boolean {
            // TODO (othebe): This check should be made more efficient by combining the checks.
            if (allowPartial) {
                return obj.isContainedWithinObject(this._graphicsObject) ||
                    obj.intersectsWithObject(this._graphicsObject) ||
                    this._graphicsObject.isContainedWithinObject(obj);
            }
            // TODO (othebe): Complete when required using isContainedWithinObject.
            else {
                throw (Constants.Strings.UNIMPLEMENTED_METHOD);
            }
        }

        // Determines if there is an intersection between the polygons formed by the Pcb and obj boundaries.
        public intersectsWithObj(obj: fabric.IObject) {
            return this._graphicsObject.intersectsWithObject(obj);
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
        // This is the catalog model data for this board component.
        private _catalogModelData: Jet.Model.CatalogModelData;
        // The associated fabric image.
        private _fabricImage: fabric.IImage;
        // The associated fabric canvas where the image is drawn.
        private _fabricCanvas: fabric.ICanvas;
        // The scope used by the board directive.
        private _boardComponentScope: IBoardComponentScope;
        // The text object displaying the component name.
        private _nameText: fabric.IText;
        // The translation for this component. This is relative to the PCB.
        private _translation: Point;
	
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
            this._translation = new Point(0, 0);

            this._initializeGraphics();

            this._boardComponentScope = this._scope.$new(true);
            this._boardComponentScope.pcb = this._pcb;
            this._boardComponentScope.placedPartData = this._placedPartData;
            this._boardComponentScope.componentData = this._componentData;	 

            // Watch related gadget model data for changes.
            this._boardComponentScope.$watch('placedPartData', function (gadgetModelData: Jet.Model.PlacedPart) {
			    var x = gadgetModelData.xpos;
			    var y = gadgetModelData.ypos;
                var rot = gadgetModelData.rot;

                // This assumes that the data read from the model is correct.
                // TODO (othebe): We may need some defensive coding here in case the model has bad transformation data.
                main._setTranslation(x, y);
                main._setRotation(rot);
                main._updateTextTransformation();
			}, true);
	    
            // Watch related gadget model data for changes.
            this._boardComponentScope.$watch('componentData', function (component: Jet.Model.ComponentInstance) {
                main._nameText.setText(main._getDisplayName());
                main._updateGraphics();
            }, true);

            // Watch for PCB resizes.
            this._boardComponentScope.$watch('pcb.getVerticalMargin()', function () {
                main._alignToPcb();
            });
        }

        // Initialize graphics.
        private _initializeGraphics() {
            // Transform around origin.
            this._fabricImage.originX = 'center';
            this._fabricImage.originY = 'center';

            // Lock scaling.
            this._fabricImage.lockUniScaling = true;
            this._fabricImage.lockScalingX = true;
            this._fabricImage.lockScalingY = true;

            // Default transformations.
            var x = 0;
            var y = 0;
            var rot = 0;

            if (this._placedPartData != null) {
                x = x || this._placedPartData.xpos;
                y = y || this._placedPartData.ypos;
                rot = rot || this._placedPartData.rot;
            }

            // Set initial transformations.
            this._setTranslation(x, y);
            this._setRotation(rot);

            this._setupFabricListeners();

            this._fabricCanvas.add(this._fabricImage);

            this.setText(this._getDisplayName());
            this._fabricCanvas.add(this._nameText);

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
                    fontFamily: "Arial, Helvetica, sans-serif",
                    selectable: false
                });
                nameText.originX = 'center';
                nameText.originY = 'center';
                this._nameText = nameText;
            }

            this._updateTextTransformation();
        }

        // Update transformation for the text.
        private _updateTextTransformation() {
            // Set text translation.
            this._nameText.setTop(this._fabricImage.getTop());
            this._nameText.setLeft(this._fabricImage.getLeft());

            // Set text rotation.
            this._nameText.setAngle(this._fabricImage.getAngle());
        }
	
        // Setup listeners in Fabric that update the model.
        private _setupFabricListeners() {
            var main = this;

            // Handle image selection.
            this._fabricImage.on('selected', function () {
                main._scope.selectedGadgetComponent.selected = main._placedPartData;
                main._scope.$applyAsync();
            });

            this._fabricImage.on('modified', function () {
            });

            // Handle image translation.
            this._fabricImage.on('moving', function () {
                main._updateTranslation();
                main._updateTextTransformation();

                // Check overall board boundary.
                main._checkBoundary();
            });

            // Handle image rotation.
            this._fabricImage.on('rotating', function () {
                main._updateRotation();
                main._updateTextTransformation();
                // TODO (othebe): Enable restriction checking.
            });
        }

        public getFabricImage(): fabric.IObject {
            return this._fabricImage;
        }

        // Gets the component instance.
        public getComponentInstance(): Jet.Model.ComponentInstance {
            return this._componentData;
        }

        // Compares a fabric object with the graphic representation of this object.
        public compareFabricObject(fObj: fabric.IObject): boolean {
            return fObj == this._fabricImage;
        }

        // Aligns the graphics according to the PCB margins.
        private _alignToPcb() {
            this._setTranslation(this._placedPartData.xpos, this._placedPartData.ypos);
        }

        // Updates the translation data in the model.
        private _updateTranslation() {
            this._fabricImage.setCoords();
            var translation = this._getRelativeTranslation();

            // Restrict movement and model for an invalid translation.
            if (!this._isValidTranslation()) {
                // Restrict canvas image.
                this._setTranslation(this._translation.x, this._translation.y);
                this._fabricImage.setCoords();

                // Restrict model.
                this._placedPartData.xpos = this._translation.x;
                this._placedPartData.ypos = this._translation.y;
                this._scope.$applyAsync();
            }
            // Update model.
            else {
                this._translation.setXY(translation.x, translation.y);
                this._placedPartData.xpos = this._translation.x;
                this._placedPartData.ypos = this._translation.y;
                this._scope.$applyAsync();
            }
	    }

        // Updates the rotation data in the model.
        private _updateRotation() {
            this._placedPartData.rot = this._fabricImage.getAngle() - Math.floor(this._fabricImage.getAngle() / 360.0) * 360.0; // There's a bug(?) in fabric that can produce rotations > 360 degrees.  This fixes it.
            this._scope.$applyAsync();
	    }

        // Updates both the translation and rotation data in the model based on the actual graphics.
	    public updateTransformation() {
	        this._updateRotation();
	        this._updateTranslation();
	    }
	
        // Returns the center co-ordinates of the image relative to the PCB.
        private _getRelativeTranslation(): Point {
            var offsetLeft = this._pcb.getGraphics().left;
            var offsetTop = this._pcb.getGraphics().top;

            return new Point(
                this._fabricImage.getLeft() - offsetLeft,
                this._fabricImage.getTop() - offsetTop
            );
        }

        // Check valid coordinates.
        private _isValidTranslation(): boolean {
            return this._pcb.overlapsObject(this._fabricImage);
        }

        // Set translation of image on canvas relative to the PCB. This considers the offset of the PCB position.
        private _setTranslation(x: number, y: number) {
            // Store previous co-ordinates to revert if the new translation is invalid.
            var oldLeft = this._fabricImage.getLeft();
            var oldTop = this._fabricImage.getTop();

            // Calculate offset based on PCB geometry.
            var offsetLeft = this._pcb.getGraphics().left;
            var offsetTop = this._pcb.getGraphics().top;

            // Set new translations.
            var newLeft = x + offsetLeft;
            var newTop = y + offsetTop;
            this._fabricImage.setLeft(newLeft);
            this._fabricImage.setTop(newTop);
            this._fabricImage.setCoords();

            // Revert to old translations.
            if (!this._isValidTranslation()) {
                this._fabricImage.setLeft(this._translation.x);
                this._fabricImage.setTop(this._translation.y);

                this._updateTranslation();
            }
            // Update to new translations.
            else {
                var translation = this._getRelativeTranslation();
                this._translation.setXY(translation.x, translation.y);
            }

            // Update accompanying text.
            if (this._nameText != null) {
                this._updateTextTransformation();
            }
        }

        // Set rotation of image on canvas.
        private _setRotation(angle: number) {
            this._fabricImage.setAngle(angle);
        }

        // Updates the graphics for this board component.
        private _updateGraphics() {
            this._fabricCanvas.renderAll();
        }

        // Checks the board canvas boundary. Expands the canvas dimensions if the image exceeds the available space.
        private _checkBoundary() {
            if (this._pcb.intersectsWithObj(this._fabricImage)) {
                var requiredLen = Math.max(this._fabricImage.getWidth(), this._fabricImage.getHeight());
                var availableLen = Math.max(this._pcb.getHorizontalMargin(), this._pcb.getVerticalMargin());

                // Increase the canvas size.
                if (requiredLen >= availableLen) {
                    var dLen = requiredLen - availableLen;
                    var padding = fabric.util.parseUnit(Constants.Board.PCB_MARGIN);
                    this._pcb.setHorizontalMargin(this._pcb.getHorizontalMargin() + dLen + padding);
                    this._pcb.setVerticalMargin(this._pcb.getVerticalMargin() + dLen + padding);
                }
            }
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
