class GameMap {
    constructor(container) {
        this.container = container;
        this.blocks = [];
        this.element = this.createElement();
        this.container.appendChild(this.element);
    }

    createElement() {
        const map = document.createElement('div');
        map.className = 'game-map';
        return map;
    }

    addBlock(x, y, type) {
        const existingBlock = this.blocks.find(block => 
            block.x === x && block.y === y
        );
        
        if (existingBlock) {
            return null;
        }

        const block = new Block(x, y, type);
        this.blocks.push(block);
        this.element.appendChild(block.element);
        return block;
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