module Jet.Ui {
    // The PCB represents the actual physical board piece.
    // TODO (othebe): It would be a good idea to remove the dependency on Fabric by having
    // an interface for PCB using any graphics object <G>, and an implementation using <fabric.IObject>.
    export class Pcb {
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
} 