// This contains the strings used within the application.
module Jet.Constants {
    export module Strings {
        // A GSpec string has been imported succesfully.
        export var GSPEC_IMPORT_SUCCESS = "GSpec imported succesfully.";

        // A method that needs to be implemented, either as a TODO, or abstraction.
        export var UNIMPLEMENTED_METHOD = "This method needs to be implemented.";

        // A name cannot be displayed since multiple components are selected.
        export var MULTIPLE_COMPONENTS_SELECTED = "Multiple components selected.";

        // Viewbox not present for the given SVG.
        export var VIEWBOX_MISSING = function (svgUrl) {
            return "The viewbox is missing for: " + svgUrl;
        };
    }
} 