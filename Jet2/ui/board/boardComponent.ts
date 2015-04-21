module Jet.Ui {
    interface IBoardComponentScope extends ng.IScope {
        placedPartData?: Jet.Model.PlacedPart;
        componentData?: Jet.Model.ComponentInstance;
        pcb?: Pcb;
    }



    // A board component represents a part that can be placed on the board.
    export class BoardComponent {
        // This is the Fabric origin we use.
        private _FABRIC_ORIGIN = 'center';

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
        // The translation for this component as stored in the model.
        private _translation: Point;
        // The rotation for this component as stored in the model.
        private _rotation: number;
        // Eagle origin coordinates.
        private _eagleOrigin: Point;
        // Eagle <==> Display mapper.
        private _eagleDisplayMapper: EagleDisplayMapper;

        // Debug coordinate mapper.
        private _debugOrigins: fabric.ILine;

        constructor(
            private _componentData: Jet.Model.ComponentInstance,
            private _placedPartData: Jet.Model.PlacedPart,
            private _snabricImage: Snabric.IImage,
            private _snabric: Snabric.ISnabric,
            private _scope: IBoardScope,
            private _pcb: Pcb) {
            var main = this;

            this._catalogModelData = _scope.catalogModel.getComponent(_componentData.keyname);

            this._fabricCanvas = this._snabric.getCanvas();
            this._fabricImage = this._snabric.getFImg(this._snabricImage);
            this._translation = new Point(0, 0);
            this._rotation = 0;

            this._initializeEagleOrigins();
            this._eagleDisplayMapper = new EagleDisplayMapper(
                this._fabricImage.getHeight(),
                this._fabricImage.getWidth(),
                this._eagleOrigin.x,
                this._eagleOrigin.y,
                this._FABRIC_ORIGIN,
                this._FABRIC_ORIGIN);

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
                main._setRotation(rot);
                main._setTranslation(x, y);
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

        // DEBUG.
        private _drawOrigins() {
            if (this._eagleDisplayMapper == null) return;

            if (this._debugOrigins != null) {
                this._debugOrigins.remove();
            }

            // Calculate offset based on PCB geometry.
            var offsetLeft = this._pcb.getGraphics().left;
            var offsetTop = this._pcb.getGraphics().top;

            var displayOrigin = this._eagleDisplayMapper.convertEagleToDisplayPoint(this._translation, this._placedPartData.get_rot());

            this._debugOrigins = new fabric.Line([
                this._translation.x + offsetLeft,
                this._translation.y + offsetTop,
                displayOrigin.x + offsetLeft,
                displayOrigin.y + offsetTop
            ], { stroke: 'red' });
            this._fabricCanvas.add(this._debugOrigins);
            this._debugOrigins.selectable = false;
            this._debugOrigins.bringToFront();
        }

        // Initialize graphics.
        private _initializeGraphics() {
            // Transform around origin.
            this._fabricImage.originX = this._FABRIC_ORIGIN;
            this._fabricImage.originY = this._FABRIC_ORIGIN;

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

        // Setup listeners in Fabric that update the model.
        private _setupFabricListeners() {
            var main = this;

            // Handle image selection.
            this._fabricImage.on('selected', function () {
                main._scope.selectedGadgetComponent.selected = main._placedPartData;
                main._scope.selectedGadgetComponent.eagleDisplayMapper = main._eagleDisplayMapper;
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
            });
        }

        // Initialize Eagle origins.
        private _initializeEagleOrigins() {
            var svgElement = this._snabricImage.getSvgElement();
            var viewbox = svgElement.getAttribute('viewBox').split(' ');

            this._eagleOrigin = new Point(parseInt(viewbox[0]), parseInt(viewbox[1]));
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

                // Lock scaling.
                nameText.lockUniScaling = true;
                nameText.lockScalingX = true;
                nameText.lockScalingY = true;

                nameText.originX = this._FABRIC_ORIGIN;
                nameText.originY = this._FABRIC_ORIGIN;
                this._nameText = nameText;
            }

            // Handle clicks on text.
            this._nameText.on('mousedown', function () {
                this._fabricCanvas.setActiveObject(this._fabricImage);
            }.bind(this));
            
            // Move the image with the text.

            this._nameText.on('moving', function () {

                var translation = this.getRelativeTranslation(this._nameText.getLeft(), this._nameText.getTop());
                var eagleCoords = this._eagleDisplayMapper.convertDisplayToEaglePoint(translation, this._placedPartData.get_rot());
                this._setTranslation(eagleCoords.x, eagleCoords.y);
                this._fabricImage.fire('moving');
            }.bind(this));

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
            
            // Restrict movement and model for an invalid translation.
            if (!this._isValidTranslation()) {
                // Restrict model.
                this._placedPartData.set_xpos(this._translation.x);
                this._placedPartData.set_ypos(this._translation.y);
                this._placedPartData.set_rot(this._rotation);
                this._scope.$applyAsync();

                // Restrict canvas image.
                this._setRotation(this._rotation);
                this._setTranslation(this._translation.x, this._translation.y);
                this._fabricImage.setCoords(); 

                // A necessary evil to force the component explorer to update with the restricted coordinates.
                // This can be bypassed by adding a field to the placedPart that can be changed/watched instead.
                this._scope.$root.$emit(Jet.Constants.RootEvent.RESTRICT_COORDINATES);           
            }
            // Update model.
            else {
                var displayCoords = this.getRelativeTranslation(this._fabricImage.getLeft(), this._fabricImage.getTop());
                var eagleCoords = this._eagleDisplayMapper.convertDisplayToEaglePoint(displayCoords, this._fabricImage.angle);

                this._translation.setXY(eagleCoords.x, eagleCoords.y);
                this._rotation = this._fabricImage.angle;
                this._placedPartData.set_xpos(eagleCoords.x);
                this._placedPartData.set_ypos(eagleCoords.y);
                this._scope.$applyAsync();
            }
        }

        // Updates the rotation data in the model.
        private _updateRotation() {
            this._placedPartData.rot = this._fabricImage.getAngle() - Math.floor(this._fabricImage.getAngle() / 360.0) * 360.0; // There's a bug(?) in fabric that can produce rotations > 360 degrees.  This fixes it.
            this._updateTranslation();
            this._scope.$applyAsync();
        }
	
        // Returns the center co-ordinates of the image relative to the PCB.
        public getRelativeTranslation(x: number, y: number): Point {
            var offsetLeft = this._pcb.getGraphics().left;
            var offsetTop = this._pcb.getGraphics().top;

            return new Point(
                x - offsetLeft,
                y - offsetTop
            );
        }

        // Check valid coordinates.
        private _isValidTranslation(): boolean {
            return this._pcb.overlapsObject(this._fabricImage);
        }

        // Set translation of image on canvas relative to the PCB based on Eagle coordinates. This applies offset of the PCB position.
        private _setTranslation(x: number, y: number) {
            var displayCoords = this._eagleDisplayMapper.convertEagleToDisplayPoint(new Point(x, y), this._fabricImage.getAngle());

            // Calculate offset based on PCB geometry.
            var offsetLeft = this._pcb.getGraphics().left;
            var offsetTop = this._pcb.getGraphics().top;

            // Set new translations.
            var newLeft = displayCoords.x + offsetLeft;
            var newTop = displayCoords.y + offsetTop;

            this._fabricImage.setLeft(newLeft);
            this._fabricImage.setTop(newTop);
            this._fabricImage.setCoords();

            // Revert to old translations.
            if (!this._isValidTranslation()) {
                this._updateTranslation();
            }
            // Update to new translations.
            else {
                this._checkBoundary();
                this._translation.setXY(x, y);
                this._rotation = this._fabricImage.getAngle();
            }

            // Update accompanying text.
            if (this._nameText != null) {
                this._updateTextTransformation();
            }

            this._drawOrigins();
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
}
