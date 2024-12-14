class GameMap {
    constructor(container) {
        this.container = container;
        this.blocks = [];
    }

    addBlock(block) {
        this.blocks.push(block);
        this.container.appendChild(block.element);
    }

    removeBlock(block) {
        const index = this.blocks.indexOf(block);
        if (index !== -1) {
            this.blocks.splice(index, 1);
            block.element.remove();
        }
    }

    clear() {
        this.blocks.forEach(block => block.element.remove());
        this.blocks = [];
    }
}