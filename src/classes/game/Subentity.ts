import Entity, { EntitySettings } from './Entity';

class Subentity extends Entity {
    anchor: Entity;

    constructor(anchor: Entity, settings?: EntitySettings) {
        super(settings);
        this.anchor = anchor;
    }

    get left() {
        return this.anchor.left + Math.round(this.position.x);
    }

    get right() {
        return this.anchor.left + Math.round(this.position.x + this.size.x);
    }

    get top() {
        return this.anchor.top + Math.round(this.position.y);
    }

    get bottom() {
        return this.anchor.top + Math.round(this.position.y + this.size.y);
    }
}

export default Subentity;
