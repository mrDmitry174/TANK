class Tank {
    constructor(x, y, gameContainer, game) {
        this.position = { x, y };
        this.rotation = 0;
        this.turretRotation = 0;
        
        // Настройки скоростей
        this.moveSpeed = 0.5;        // Скорость движения
        this.rotationSpeed = 0.3;    // Уменьшаем скорость поворота корпуса
        this.turretSpeed = 0.25;     // Скорость поворота башни
        
        this.gameContainer = gameContainer;
        this.game = game;
        this.element = this.createElement();
        this.isMoving = false;
        this.updatePosition();
        
        this.canShoot = true;  // Флаг возможности стрельбы
        this.reloadTime = 1000; // Задержка 1 секунда
        this.isVisible = true;
        this.updateVisibility();
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.updatePosition();
    }

    createElement() {
        const tank = document.createElement('div');
        tank.className = 'tank';
        tank.innerHTML = `
            <div class="side front"></div>
            <div class="side back"></div>
            <div class="side left"></div>
            <div class="side right"></div>
            <div class="turret">
                <div class="barrel"></div>
                <div class="barrel-end"></div>
            </div>
        `;
        return tank;
    }

    updatePosition() {
        this.element.style.left = this.position.x + 'px';
        this.element.style.top = this.position.y + 'px';
        this.element.style.transform = `rotate(${this.rotation}deg)`;
        
        // Обновляем позицию башни
        const turret = this.element.querySelector('.turret');
        if (turret) {
            turret.style.transform = `translate(-50%, -50%) rotate(${this.turretRotation}deg)`;
        }

        // Проверяем, находится ли танк в кустах
        this.checkBushCollision();
    }

    moveForward() {
        // Уменьшаем количество проверок коллизий
        if (this.lastCollisionCheck && Date.now() - this.lastCollisionCheck < 30) {
            return;
        }
        this.lastCollisionCheck = Date.now();
        
        const radians = (this.rotation - 90) * Math.PI / 180;
        const newX = this.position.x + Math.cos(radians) * this.moveSpeed;
        const newY = this.position.y + Math.sin(radians) * this.moveSpeed;
        
        if (!this.checkCollision(newX, newY)) {
            this.position.x = newX;
            this.position.y = newY;
            this.updatePosition();
            this.startTrackAnimation('forward');
        }
    }

    moveBackward() {
        const radians = (this.rotation - 90) * Math.PI / 180;
        const newX = this.position.x - Math.cos(radians) * this.moveSpeed;  // Используем moveSpeed
        const newY = this.position.y - Math.sin(radians) * this.moveSpeed;
        
        if (!this.checkCollision(newX, newY)) {
            this.position.x = newX;
            this.position.y = newY;
            this.updatePosition();
            this.startTrackAnimation('backward');
        }
    }

    startTrackAnimation(direction) {
        this.element.classList.remove('moving-forward', 'moving-backward');
        this.element.classList.add(`moving-${direction}`);
        this.isMoving = true;
    }

    stopMoving() {
        this.element.classList.remove('moving-forward', 'moving-backward');
        this.isMoving = false;
    }

    checkCollision(newX, newY) {
        // Проверка столкновения с другим танком
        const otherTank = this === this.game.player ? 
                         this.game.enemy : 
                         this.game.player;

        // Проверяем столкновение с танком
        if (CollisionManager.checkTankCollision(
            newX, newY, this.rotation, this.turretRotation,
            otherTank.position.x, otherTank.position.y, 
            otherTank.rotation, otherTank.turretRotation,
            this.gameContainer.offsetWidth, this.gameContainer.offsetHeight
        )) {
            return true;
        }

        // Проверяем столкновение с блоками
        const tankCorners = CollisionManager.getRotatedCorners(
            newX, newY, 
            50, 54,  // Размеры танка
            this.rotation
        );

        for (const block of this.game.map.blocks) {
            // Пропускаем блоки, через которые можно проехать
            if (!Block.COLLIDABLE[block.type]) continue;

            const blockBox = block.getCollisionBox();
            const blockCorners = [
                { x: blockBox.x, y: blockBox.y },
                { x: blockBox.x + blockBox.width, y: blockBox.y },
                { x: blockBox.x + blockBox.width, y: blockBox.y + blockBox.height },
                { x: blockBox.x, y: blockBox.y + blockBox.height }
            ];

            if (CollisionManager.checkRotatedCollision(tankCorners, blockCorners)) {
                return true;
            }
        }

        return false;
    }

    shoot() {
        if (!this.canShoot) return null;
        
        // Бокуем стрельбу
        this.canShoot = false;
        
        // Создаем пулю
        const bullet = new Bullet(this);
        
        // Через секунду разрешаем стрельбу снова
        setTimeout(() => {
            this.canShoot = true;
        }, this.reloadTime);
        
        return bullet;
    }

    hit(side) {
        // Удаляем все предыдущие эффекты попадания
        this.element.querySelectorAll('.side').forEach(side => {
            side.classList.remove('hit');
        });
        
        // Добавляем эффект на нужную сторону
        const sideElement = this.element.querySelector(`.side.${side}`);
        if (sideElement) {
            sideElement.classList.add('hit');
            setTimeout(() => {
                sideElement.classList.remove('hit');
            }, 200);
        }
    }

    rotateLeft() {
        const newRotation = this.rotation - this.rotationSpeed;
        
        // Пробуем повернуть
        this.rotation = newRotation;
        
        // Если есть коллизия, отменяем поворот
        if (this.checkCollision(this.position.x, this.position.y)) {
            this.rotation = this.rotation + this.rotationSpeed;
        }
        
        this.updatePosition();
    }

    rotateRight() {
        const newRotation = this.rotation + this.rotationSpeed;
        
        // Пробуем повернуть
        this.rotation = newRotation;
        
        // Если есть коллизия, отменяем поворот
        if (this.checkCollision(this.position.x, this.position.y)) {
            this.rotation = this.rotation - this.rotationSpeed;
        }
        
        this.updatePosition();
    }

    updateVisibility() {
        this.element.style.opacity = this.isVisible ? '1' : '0.3';  // Делаем полупрозрачным в кустах
    }

    hide() {
        this.isVisible = false;
        this.updateVisibility();
    }

    show() {
        this.isVisible = true;
        this.updateVisibility();
    }

    checkBushCollision() {
        // Проверяем все кусты
        for (const block of this.game.map.blocks) {
            if (block.type !== Block.TYPES.BUSH) continue;

            // Получаем центр танка
            const tankCenter = {
                x: this.position.x + 25,  // Половина ширины танка
                y: this.position.y + 27   // Половина высоты танка
            };

            const blockBox = block.getCollisionBox();
            
            // Проверяем, находится ли центр танка внутри куста
            if (tankCenter.x >= blockBox.x && 
                tankCenter.x <= blockBox.x + blockBox.width &&
                tankCenter.y >= blockBox.y && 
                tankCenter.y <= blockBox.y + blockBox.height) {
                this.hide();
                return;
            }
        }
        this.show();
    }
} 