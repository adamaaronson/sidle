import Block from './Block'
import Player from './Player'

export default class Level {
    player: Player
    blocks: Block[]

    constructor(player: Player, blocks: Block[]) {
        this.player = player
        this.blocks = blocks
    }

    get entities() {
        return [
            this.player,
            ...this.blocks
        ]
    }

    update(timestamp: number) {
        this.player.update(timestamp, this.blocks)
    }
}