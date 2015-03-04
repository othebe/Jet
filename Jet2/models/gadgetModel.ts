class GadgetModel {
	// This is the component dictionary
	// You can use this to iterate over if you have too
	components: { [index: string]: GadgetModel.Component; } = {};
	
	// This is the component catalog. It has the prototypes for all the kinds of components
	private catalog: any;
	
	// Testing constructor. It adds three of the first kind of part in the catalog.
	constructor (catalog: any) {
		this.catalog = catalog;
		var kind = Object.keys(this.catalog.components())[0];
		
		this.add_component ("part1", kind,  5,  5);
		this.add_component ("part2", kind, 10, 10);
		this.add_component ("part3", kind, 10, 20);
	}
	
	// Add component. This adds a component of the keyname type. The name must be a unique ID.
	add_component (name: string, 
					 keyname: string,
					 xpos: number = 0.0,
					 ypos: number = 0.0,
					 rot:  number = 0.0) {
		if (Object.keys(this.components).indexOf(name) > -1) {
			throw new Error("Adding component with duplicate name: " + name);
		}
		
		Object.keys(this.components).push(name);
		this.components[name] = new GadgetModel.Component(name, keyname, xpos, ypos, rot);
	}
	
	// Gets the info of a component by name.
	component (name: string) {
		// Is there really no good way to copy an object by value?
		return JSON.parse(JSON.stringify( this.components[name] ));
	}
	
	// Move a component.
	move_component (name: string, xpos: number, ypos: number, rot?: number) {
		this.components[name].xpos = xpos;
		this.components[name].ypos = ypos;
		if (rot) {
			this.components[name].rot  = rot;
		}
	}
	
	// Returns list of component names
	component_names (): string[] {
		return Object.keys(this.components);
	}
}

module GadgetModel {
	
	// Basic component info class
    export class Component {
		name: string;
		keyname: string;
		xpos: number;
		ypos: number;
		rot: number;
		
		// Basic constructor

		constructor (name: string, 
					 keyname: string,
					 xpos: number = 0.0,
					 ypos: number = 0.0,
					 rot:  number = 0.0) {
			this.name = name;
			this.keyname = keyname;
			this.xpos = xpos;
			this.ypos = ypos;
			this.rot = rot;
						 
		} 
	}
}