/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IBoardScope extends Jet.Application.IApplicationScope {
        height: Number;
	zoomFactor : number;
	Math: any;
    }
    

    interface IBoardComponentScope extends ng.IScope {
        placedPartData?: Jet.Model.PlacedPart;
        componentData?: Jet.Model.ComponentInstance;
    }

    class BoardComponent {
        private _catalogModelData: Jet.Model.CatalogModelData;
        private _position: { x: number; y: number };
        private _rotation: number;
        private _fabricImage: fabric.IImage;
        private _fabricCanvas: fabric.ICanvas;
        private _boardComponentScope: IBoardComponentScope;
	    private _nameText: fabric.IText;
        private _ENABLE_RESTRAINTS: boolean = false;
	    private _displayGroup : fabric.IGroup;
	
        constructor(
            private _componentData: Jet.Model.ComponentInstance,
            private _placedPartData: Jet.Model.PlacedPart,
            private _snabricImage: Snabric.IImage,
            private _snabric: Snabric.ISnabric,
            private _scope: IBoardScope)
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
                main._fabricCanvas.renderAll();
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

        // Set translation of image on canvas.
        private _setTranslation(x: number, y: number) {
            this.setLeft(x);
            this.setTop(y);
        }

        // Set rotation of image on canvas.
        private _setRotation(angle: number) {
            this.setAngle(angle);
        }
    }

    export class Board extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/board/board.html";
        private _scope: IBoardScope;
        private _snabric: Snabric.ISnabric;
        private _fabricCanvas: fabric.ICanvas;
        private _gDataFabricMap: Map<Jet.Application.ISelectable, BoardComponent>;
	    private _displayGroupToComponentMap: Map<fabric.IObject, BoardComponent>;
	    private _checkResize: boolean;
	    private _boardContainer;
	    private _previouslySelected: fabric.IObject [];
	
        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;
            
            this._gDataFabricMap = new Map<Jet.Application.ISelectable, BoardComponent>();
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

		        scope.$on("change:perspective", function(name: ng.IAngularEvent,
							            newPerspective: number) {
		            main._clearUi();
		            main._updateUi(scope.gadgetModel);
		        });

                // Watch the selected gadget model data.
                scope.$watch('selectedGadgetComponent.selected', function () {
                    main._selectComponent(scope.selectedGadgetComponent.selected);
                }, true);

            }
        }

	    private _updateBoardSize() {
	        var effZoom : number = 1.0;
	        if (this._scope.zoomFactor >= 1.0) {
		        effZoom = this._scope.zoomFactor;
	        }
	        // subtracting 20 leaves a boarder around the board and ensures
	        // that the scroll bars disappear when we scroll over 100% and then
	        // come down back below 100%
	        this._fabricCanvas.setHeight(($(this._boardContainer).innerHeight()-20) * effZoom); 
	        this._fabricCanvas.setWidth(($(this._boardContainer).innerWidth()-20) * effZoom);
	        this._fabricCanvas.setZoom(this._scope.zoomFactor);
	        this._fabricCanvas.zoomToPoint(new fabric.Point(0,0), this._scope.zoomFactor);
	    }

	
        // Initialize FabricJS canvas.
        private _initializeFabric(instanceElement: JQuery) {
            var main = this;

            // Setup Snabric.
            var canvasElt: HTMLCanvasElement = instanceElement[0].getElementsByTagName('canvas')[0];
            this._snabric = new Snabric(canvasElt);

            // Initialize fabric canvas.
            this._fabricCanvas = this._snabric.getCanvas();
	        this._boardContainer = instanceElement.find('.board-container')[0];
	        main._scope.zoomFactor = 1;
            this._updateBoardSize();

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
	    
	        // Watch for resize events and adjust canvas size accordingly.  Use
	        // a timer to keep from doing it over and over as the user drags
	        // around the corner of the window.
	        main._checkResize = true;
	        $(window).on("resize",function(){
		        if(main._checkResize){
		            main._updateBoardSize();
		            main._checkResize = false;
		            setTimeout(function(){
			        main._checkResize = true;
			        main._updateBoardSize();
		            },500)
		        }
	        });
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
                var boardComponent = new BoardComponent(componentData, placedPartData, sImg, main._snabric, main._scope);
                main._gDataFabricMap.set(placedPartData, boardComponent);
                main._displayGroupToComponentMap.set(boardComponent.getDisplayGroup(), boardComponent);
                boardComponent.setTop(placedPartData.xpos);
                boardComponent.setLeft(placedPartData.ypos);
                boardComponent.setAngle(placedPartData.rot);
                main._updateBoardSize();
            }); 
        }

        // Select a board component.
        private _selectComponent(selected: Jet.Application.ISelectable) {
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
