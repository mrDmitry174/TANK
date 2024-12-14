class Controls {
    constructor(game) {
        this.game = game;
        this.setupKeyboardControls();
        this.setupMobileControls();
    }

    setupKeyboardControls() {
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

    setupMobileControls() {
        // Движение
        const moveUp = document.querySelector('.move-up');
        const moveDown = document.querySelector('.move-down');
        const moveLeft = document.querySelector('.move-left');
        const moveRight = document.querySelector('.move-right');
        
        // Обработка касаний для движения
        this.setupMobileButton(moveUp, () => this.game.player.moveForward());
        this.setupMobileButton(moveDown, () => this.game.player.moveBackward());
        this.setupMobileButton(moveLeft, () => this.game.player.rotateLeft());
        this.setupMobileButton(moveRight, () => this.game.player.rotateRight());

        // Башня и стрельба
        const rotateLeft = document.querySelector('.rotate-left');
        const rotateRight = document.querySelector('.rotate-right');
        const shoot = document.querySelector('.shoot');

        // Обработка касаний для башни
        this.setupMobileButton(rotateLeft, () => this.rotateTurretLeft());
        this.setupMobileButton(rotateRight, () => this.rotateTurretRight());
        this.setupMobileButton(shoot, () => this.shoot());
    }

    setupMobileButton(button, callback) {
        let interval;
        
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            callback();
            interval = setInterval(callback, 100);
        });

        button.addEventListener('touchend', () => {
            clearInterval(interval);
            if (callback === this.game.player.moveForward || 
                callback === this.game.player.moveBackward) {
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