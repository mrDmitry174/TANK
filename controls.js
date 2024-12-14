class Controls {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.lastRotation = 0;
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
                'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if(['KeyW', 'KeyS'].includes(e.code)) {
                this.game.player.stopMoving();
            }
        });
    }
    
    handleMovement() {
        const player = this.game.player;
        
        // Движение вперед/назад
        if (this.keys['KeyW']) {
            player.moveForward();
        } else if (this.keys['KeyS']) {
            player.moveBackward();
        }
        
        // Поворот корпуса (только если не происходит противоположный поворот)
        if (this.keys['KeyA'] && !this.keys['KeyD']) {
            player.rotateLeft();
            this.lastRotation = 'left';
        } else if (this.keys['KeyD'] && !this.keys['KeyA']) {
            player.rotateRight();
            this.lastRotation = 'right';
        }
        
        // Поворот башни
        if (this.keys['KeyQ']) {
            player.turretRotation = (player.turretRotation - player.turretSpeed) % 360;
            player.updatePosition();
        }
        if (this.keys['KeyE']) {
            player.turretRotation = (player.turretRotation + player.turretSpeed) % 360;
            player.updatePosition();
        }
        
        // Стрельба
        if (this.keys['Space']) {
            const bullet = player.shoot();
            if (bullet) {
                this.game.addBullet(bullet);
            }
        }
    }
} 