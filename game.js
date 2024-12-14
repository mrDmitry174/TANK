// Инициализация Telegram Mini App
const tg = window.Telegram.WebApp;

class Game {
    constructor() {
        // Инициализируем Telegram Mini App
        tg.ready();
        tg.expand();

        this.gameContainer = document.querySelector('.game-container');
        // Создаем карту
        this.map = new GameMap(this.gameContainer);
        // Создаем редактор для карты
        this.mapEditor = new MapEditor(this.map);
        this.blocks = [];
        this.bullets = [];
        
        // Создаем игрока внизу карты
        const startY = this.gameContainer.offsetHeight - 100;
        const startX = this.gameContainer.offsetWidth / 2;
        this.player = new Tank(startX, startY, this.gameContainer, this);
        this.gameContainer.appendChild(this.player.element);
        
        // Создаем противника вверху карты
        const enemyY = 100;
        const enemyX = this.gameContainer.offsetWidth / 2;
        this.enemy = new Tank(enemyX, enemyY, this.gameContainer, this);
        this.enemy.element.classList.add('enemy'); // Добавляем класс для стилизации
        this.enemy.rotation = 180; // Разворачиваем противника к игроку
        this.enemy.updatePosition();
        this.gameContainer.appendChild(this.enemy.element);
        
        // Создаем управление
        this.controls = new Controls(this);
        
        // Инициализация сетевых параметров
        this.playerId = null;
        this.roomId = null;
        this.isHost = false;
        this.gameState = 'waiting';
        
        // Подключаемся к серверу
        this.connectToServer();
        
        this.init();
    }

    init() {
        console.log('Game initialized');
        this.gameLoop();
    }

    gameLoop() {
        this.controls.handleMovement();
        this.updateBullets();
        requestAnimationFrame(() => this.gameLoop());
    }

    addBullet(bullet) {
        this.bullets.push(bullet);
        this.gameContainer.appendChild(bullet.element);
    }

    updateBullets() {
        for (const bullet of this.bullets) {
            bullet.move();
            
            // Проверяем все столкновения пули
            if (CollisionManager.checkBulletCollisions(bullet, this)) {
                bullet.destroy();
                this.bullets = this.bullets.filter(b => b !== bullet);
                continue;
            }
            
            // Удаляем пули за пределами поля
            if (bullet.x < 0 || bullet.x > this.gameContainer.offsetWidth ||
                bullet.y < 0 || bullet.y > this.gameContainer.offsetHeight) {
                bullet.destroy();
                this.bullets = this.bullets.filter(b => b !== bullet);
            }
        }
    }

    checkBulletHit(bullet, tank) {
        // Не проверяем попадание, если пуля принадлежи этому же танку
        if (bullet.owner === tank) {
            return false;
        }

        const tankRect = tank.element.getBoundingClientRect();
        
        // Проверяем столкновение
        if (bullet.x >= tankRect.left && bullet.x <= tankRect.right &&
            bullet.y >= tankRect.top && bullet.y <= tankRect.bottom) {
            
            // Определяем сторону попадания
            const centerX = tankRect.left + tankRect.width / 2;
            const centerY = tankRect.top + tankRect.height / 2;
            
            // Вычисляем расстояния до каждой стороны
            const distToLeft = Math.abs(bullet.x - tankRect.left);
            const distToRight = Math.abs(bullet.x - tankRect.right);
            const distToTop = Math.abs(bullet.y - tankRect.top);
            const distToBottom = Math.abs(bullet.y - tankRect.bottom);
            
            // Находим минимальное расстояние
            const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
            
            // Определяем сторону с учетом поворота танка
            let side;
            const rotation = tank.rotation % 360;  // Номализуем угол поворота
            
            if (minDist === distToLeft) {
                side = rotation === 90 ? 'front' : 
                       rotation === 270 ? 'back' : 
                       rotation === 0 ? 'left' : 'right';
            }
            else if (minDist === distToRight) {
                side = rotation === 90 ? 'back' : 
                       rotation === 270 ? 'front' : 
                       rotation === 0 ? 'right' : 'left';
            }
            else if (minDist === distToTop) {
                side = rotation === 0 ? 'front' : 
                       rotation === 180 ? 'back' : 
                       rotation === 90 ? 'right' : 'left';
            }
            else {
                side = rotation === 0 ? 'back' : 
                       rotation === 180 ? 'front' : 
                       rotation === 90 ? 'left' : 'right';
            }
            
            // Применяем эффект
            tank.hit(side);
            return true;
        }
        return false;
    }

    handleServerMessage(data) {
        switch(data.type) {
            case 'gameStart':
                this.startGame(data);
                break;
            case 'playerUpdate':
                this.updateOpponent(data);
                break;
            case 'shoot':
                this.handleEnemyShoot(data);
                break;
            case 'hit':
                this.handleHit(data);
                break;
            case 'gameState':
                this.updateGameState(data);
                break;
            case 'opponentDisconnected':
                this.handleOpponentDisconnect();
                break;
        }
    }

    connectToServer() {
        // Подключаемся к нашему серверу на Glitch
        this.ws = new WebSocket('wss://cuddly-knotty-box.glitch.me/ws');
        
        this.ws.onopen = () => {
            console.log('Connected to server');
            this.showWaitingScreen();
            
            // Увеличиваем ин��ервал с 50мс до 100мс
            setInterval(() => {
                if (this.gameState === 'playing') {
                    this.sendPlayerState();
                }
            }, 100);
        };
        
        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.handleDisconnect();
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.handleDisconnect();
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data);
        };
    }

    startGame(data) {
        this.playerId = data.playerId;
        this.roomId = data.roomId;
        this.isHost = data.position === 'bottom';
        
        // Скрываем экран ожидания
        this.hideWaitingScreen();
        
        // Позиционируем танки
        if (this.isHost) {
            this.player.setPosition(this.gameContainer.offsetWidth / 2, this.gameContainer.offsetHeight - 100);
            this.enemy.setPosition(this.gameContainer.offsetWidth / 2, 100);
        } else {
            this.player.setPosition(this.gameContainer.offsetWidth / 2, 100);
            this.enemy.setPosition(this.gameContainer.offsetWidth / 2, this.gameContainer.offsetHeight - 100);
            this.player.rotation = 180;
        }
        
        this.gameState = 'playing';
        this.startGameLoop();
    }

    sendPlayerState() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'playerState',
                x: this.player.position.x,
                y: this.player.position.y,
                rotation: this.player.rotation,
                turretRotation: this.player.turretRotation
            }));
        }
    }

    updateOpponent(data) {
        this.enemy.position.x = data.x;
        this.enemy.position.y = data.y;
        this.enemy.rotation = data.rotation;
        this.enemy.turretRotation = data.turretRotation;
        this.enemy.updatePosition();
    }

    showWaitingScreen() {
        document.querySelector('.waiting-screen').style.display = 'flex';
    }

    hideWaitingScreen() {
        document.querySelector('.waiting-screen').style.display = 'none';
    }

    handleDisconnect() {
        console.log('Disconnected from server');
        // Показываем сообщение об отключении
        document.querySelector('.waiting-screen .message').textContent = 'Соединение потеряно. Переподключение...';
        document.querySelector('.waiting-screen').style.display = 'flex';
        
        // Пробуем переодключиться через 3 секунды
        setTimeout(() => {
            this.connectToServer();
        }, 3000);
    }

    handleOpponentDisconnect() {
        console.log('Opponent disconnected');
        // Показываем сообщение
        document.querySelector('.waiting-screen .message').textContent = 'Противник отключился. Ожидание нового игрока...';
        document.querySelector('.waiting-screen').style.display = 'flex';
        
        // Сбрасываем состояние игры
        this.gameState = 'waiting';
    }
}

// Запуск игры после загрузки
window.addEventListener('DOMContentLoaded', () => {
    console.log('Creating game in Telegram Mini App');
    const game = new Game();
}); 