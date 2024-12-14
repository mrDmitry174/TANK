class Bullet {
    constructor(tank) {
        this.owner = tank;
        this.element = document.createElement('div');
        this.element.className = 'bullet';
        
        // Находим маркер на конце дула
        const barrelEnd = tank.element.querySelector('.barrel-end');
        const barrelRect = barrelEnd.getBoundingClientRect();
        
        // Позиция пули = позиция маркера
        this.x = barrelRect.left + barrelRect.width/2;
        this.y = barrelRect.top + barrelRect.height/2;
        
        // Получаем угол поворота
        const totalRotation = tank.rotation + tank.turretRotation;
        const radians = (totalRotation - 90) * Math.PI / 180; // -90 чтобы 0 смотрел вверх
        
        // Направление движения
        this.direction = radians;
        this.speed = 5;
        
        this.isVisible = true;
        this.updateVisibility();
        
        this.updatePosition();
    }

    move() {
        // Движение пули
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = `${this.x - 4}px`;  // Центрируем пулю (8px/2)
        this.element.style.top = `${this.y - 4}px`;   // Центрируем пулю (8px/2)
    }

    destroy() {
        this.element.remove();
    }

    updateVisibility() {
        this.element.style.opacity = this.isVisible ? '1' : '0';
    }

    hide() {
        this.isVisible = false;
        this.updateVisibility();
    }

    show() {
        this.isVisible = true;
        this.updateVisibility();
    }
} 