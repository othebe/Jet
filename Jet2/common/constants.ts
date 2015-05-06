// This module should hold constant data for the application.
module Jet.Constants {
    // Precision points.
    export var PRECISION = 2;

    // Root events.
    export module RootEvent {
        // This sginals that a set of co-ordinates has been restricted.
        export var RESTRICT_COORDINATES = 'restrict-coorinates';
    }

    export module Board {
        // This is the color of the PCB.
        export var PCB_COLOR = '#78AB46';

        // This is the default PCB margin.
        export var PCB_MARGIN = 25;

        // This is the background color for the workspace.
        export var WORKSPACE_BG_COLOR = '#FFFFFF';

        // This is the model unit.
        export var MODEL_UNITS = 'mm';
    }
} 