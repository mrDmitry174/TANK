class Block {
    static TYPES = {
        GROUND: 'ground',       // Грунт (3 попадания)
        BRICK: 'brick',         // Кирпич (5 попаданий)
        STEEL: 'steel',         // Сталь (10 попаданий)
        WATER: 'water',         // Вода
        BUSH: 'bush'           // Кусты
    };

    static COLLIDABLE = {
        [Block.TYPES.GROUND]: true,   // Нельзя проехать
        [Block.TYPES.BRICK]: true,    // Нельзя проехать
        [Block.TYPES.STEEL]: true,    // Нельзя проехать
        [Block.TYPES.WATER]: true,    // Нельзя проехать
        [Block.TYPES.BUSH]: false     // Можно проехать
    };

    static HEALTH = {
        [Block.TYPES.GROUND]: 3,
        [Block.TYPES.BRICK]: 5,
        [Block.TYPES.STEEL]: 10,
        [Block.TYPES.WATER]: Infinity,  // Нельзя разрушить
        [Block.TYPES.BUSH]: Infinity    // Нельзя разрушить
    };

    constructor(x, y, type = Block.TYPES.GROUND) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 40;
        this.maxHealth = Block.HEALTH[type];
        this.health = this.maxHealth;
        this.element = this.createElement();
        this.updatePosition();
    }

    createElement() {
        const block = document.createElement('div');
        block.className = `block ${this.type}`;
        return block;
    }

    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    getCollisionBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.size,
            height: this.size
        };
    }

    hit(damage = 1) {
        if (this.health === Infinity) return false;
        
        this.health -= damage;
        this.updateAppearance();
        
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }

    updateAppearance() {
        // Обновляем внешний вид в зависимости от оставшегося здоровья
        const healthPercent = (this.health / this.maxHealth) * 100;
        this.element.style.opacity = 0.5 + (healthPercent / 200); // От 0.5 до 1
        
        // Добавляем класс для текущего состояния
        this.element.className = `block ${this.type} health-${Math.ceil(this.health)}`;
    }

    destroy() {
        this.element.remove();
        // Можно добавить эффект разрушения или анимацию
    }
} 