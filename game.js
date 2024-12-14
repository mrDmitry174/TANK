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
        // Не проверяем попадание, если пуля принадлежит этому же танку
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
            const rotation = tank.rotation % 360;  // Нормализуем угол поворота
            
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
}

// Запуск игры после загрузки
window.addEventListener('DOMContentLoaded', () => {
    console.log('Creating game in Telegram Mini App');
    const game = new Game();
}); 