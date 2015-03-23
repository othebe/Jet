/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IBoardScope extends Jet.Application.IApplicationScope {
        height: Number;
	zoomFactor : Number;
	Math: any;
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
            this._boardComponentScope.$watch('placedPartData',
					     function (gadgetModelData: Jet.Model.PlacedPart) {
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
                main._scope.selectedGadgetComponent.selected = main._placedPartData;
                main._scope.$applyAsync();
            });

            this._fabricImage.on('modified', function () {
            });

            // Handle image translation.
            this._fabricImage.on('moving', function () {
		//console.log("Moving " + this);
		main._updateLocation();
            });

            // Handle image rotation.
            this._fabricImage.on('rotating', function () {
		//console.log("Rotating " + this);
                main._updateRotation();
                // TODO (othebe): Enable restriction checking.
            });
        }

        public getFabricImage(): fabric.IImage {
            return this._fabricImage;
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

	    //console.log("Setting location of " + this + " to " + this._position.x + ", " + this._position.y)
            this._placedPartData.xpos = this._position.x;
            this._placedPartData.ypos = this._position.y;
            this._scope.$applyAsync();
	}

	private _updateRotation() {
	    //console.log("Setting rotation of " + this + " to " + this._fabricImage.getAngle())
	    this._placedPartData.rot = this._fabricImage.getAngle() - Math.floor(this._fabricImage.getAngle()/360.0)*360.0; // There's a bug(?) in fabric that can produce rotations > 360 degrees.  This fixes it.
            this._scope.$applyAsync();
	}

	public updateGeometry() {
	    this._updateRotation();
	    this._updateLocation();
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
        private _gDataFabricMap: Map<Jet.Application.ISelectable, BoardComponent>;
	private _imgToComponentMap: Map<fabric.IObject, BoardComponent>;
	private _checkResize: boolean;
	private _boardContainer;
	private _previouslySelected: fabric.IObject [];
	
        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;
            
            this._gDataFabricMap = new Map<Jet.Application.ISelectable, BoardComponent>();
            this._imgToComponentMap = new Map<fabric.IObject, BoardComponent>();

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
		
		scope.$watch('zoomFactor', function (oldValue :number,
						     newValue :number) {
		    main._fabricCanvas.setZoom(newValue);
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

	private _updateBoardSize(){
	    //console.log("Setting size to " +  $(this._boardContainer).innerWidth() + " x " + $(this._boardContainer).innerHeight());
	    this._fabricCanvas.setHeight($(this._boardContainer).innerHeight());
	    this._fabricCanvas.setWidth($(this._boardContainer).innerWidth());
	}
	
        // Initialize FabricJS canvas.
        private _initializeFabric(instanceElement: JQuery) {
            var main = this;

            // Initialize fabric canvas.
            var canvasElt: HTMLCanvasElement = instanceElement[0].getElementsByTagName('canvas')[0];
            this._fabricCanvas = new fabric.Canvas(canvasElt);
	    this._boardContainer = instanceElement.find('.board-container')[0];
	    this._updateBoardSize();
	    main._scope.zoomFactor = 1;
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
	    this._fabricCanvas.on('before:selection:cleared',
				  function() {
				      //console.log("Before selection cleared");
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
	    this._fabricCanvas.on('selection:cleared',
				  function() {
				      //console.log("Selection cleared");
				      if (main._previouslySelected != null) {
					  for (var i = 0; i < main._previouslySelected.length; i++) {
					      main._imgToComponentMap.get(main._previouslySelected[i]).updateGeometry();
					  }
				      }
				      main._previouslySelected = null;
				  });

	    // this._fabricCanvas.on('selection:created',
	    // 			  function() {
	    // 			      console.log("Selection created");
	    // 			  });
	    
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
	    this._imgToComponentMap.clear();
	    this._gDataFabricMap.clear();
	}


	
        // Update components displayed on the board.
        private _updateUi(gadgetModel: Jet.Model.GadgetModel) {
            // Check for new components.
            for (var key in gadgetModel.components) {
                var componentData = gadgetModel.components[key];

                var placedParts = componentData.getPlacedParts();
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

            var fabricImage = fabric.Image.fromURL(catalogModelData.getSvgUrl(),
						   function (img) {
						       var boardComponent = new BoardComponent(componentData, placedPartData, img, main._fabricCanvas, main._scope);
						       main._gDataFabricMap.set(placedPartData, boardComponent);
						       main._imgToComponentMap.set(img, boardComponent);
						       img.setTop(placedPartData.ypos);
						       img.setLeft(placedPartData.xpos);
						       img.setAngle(placedPartData.rot);
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
