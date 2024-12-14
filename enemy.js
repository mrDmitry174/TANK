class Enemy extends Tank {
    constructor(x, y, gameContainer) {
        super(x, y, gameContainer);
        this.speed = 1.5;
        this.reloadTime = 1000;
    }

    update(player) {
        // Вычисляем направление к игроку
        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const angleToPlayer = Math.atan2(dy, dx) * 180 / Math.PI;

        // Поворачиваем корпус к игроку
        const angleDiff = angleToPlayer - this.rotation;
        const newRotation = this.rotation + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 2);
        
        // Проверяем коллизию при повороте корпуса
        const oldRotation = this.rotation;
        this.rotation = newRotation;
        if (super.checkCollision(this.position.x, this.position.y)) {
            this.rotation = oldRotation;
        }

        // Поворачиваем башню с проверкой коллизии
        const turretAngleDiff = angleToPlayer - (this.rotation + this.turretRotation);
        const newTurretRotation = this.turretRotation + Math.sign(turretAngleDiff) * Math.min(Math.abs(turretAngleDiff), 2);
        
        // Проверяем коллизию при повороте башни
        const oldTurretRotation = this.turretRotation;
        this.turretRotation = newTurretRotation;
        if (super.checkCollision(this.position.x, this.position.y)) {
            this.turretRotation = oldTurretRotation;
        }

        // Двигаемся к игроку если он далеко
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 200) { // Держим дистанцию
            const radians = this.rotation * Math.PI / 180;
            const newX = this.position.x + Math.cos(radians) * this.speed;
            const newY = this.position.y + Math.sin(radians) * this.speed;
            
            if (!super.checkCollision(newX, newY)) {
                this.position.x = newX;
                this.position.y = newY;
            }
        }

        // Стреляем если можем и цель в прицеле
        if (this.canShoot && Math.abs(turretAngleDiff) < 5) {
            const bullet = super.shoot();
            if (bullet) {
                this.gameContainer.game.bullets.push(bullet);
            }
        }

        this.updatePosition();
    }

    checkCollision(x, y) {
        return CollisionSystem.checkTankCollision(this, x, y, this.gameContainer);
    }
} 