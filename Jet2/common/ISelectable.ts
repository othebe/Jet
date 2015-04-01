module Selectable {
    // These are the types of selectable objects.
    export enum Type {
        BOARD,
        COMPONENT_INSTANCE,
        PLACED_PART
    }

    // This represents a selectable object.
    export interface ISelectable {
        // Return the type of ISelectable.
        getType(): Type;
    }
}