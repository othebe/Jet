// Add-on to the existing Fabric.js typescript definition.

declare module fabric {
    export interface IStaticCanvas extends IObservable {
        setBackgroundColor(rgbaStr: any, callback: () => any, options?): ICanvas;
        setZoom(value: number): ICanvas;
        zoomToPoint(point: any, value: number): ICanvas;
    }
}