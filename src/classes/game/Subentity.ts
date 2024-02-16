import Entity, { EntitySettings } from './Entity';

class Subentity extends Entity {
    anchor: Entity;

    constructor(anchor: Entity, settings?: EntitySettings) {
        super(settings);
        this.anchor = anchor;
    }

    get left() {
        return this.anchor.left + (this as Entity).left;
    }

    get right() {
        return this.anchor.left + (this as Entity).right;
    }

    get top() {
        return this.anchor.top + (this as Entity).top;
    }

    get bottom() {
        return this.anchor.top + (this as Entity).bottom;
    }
}

export default Subentity;
