class CollisionManager {
    static getRotatedCorners(x, y, width, height, angle) {
        const rad = angle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const centerX = x + width/2;
        const centerY = y + height/2;

        // Только углы корпуса танка
        return [
            { // Верхний левый
                x: centerX + (-width/2 * cos - height/2 * sin),
                y: centerY + (-width/2 * sin + height/2 * cos)
            },
            { // Верхний правый
                x: centerX + (width/2 * cos - height/2 * sin),
                y: centerY + (width/2 * sin + height/2 * cos)
            },
            { // Нижний правый
                x: centerX + (width/2 * cos + height/2 * sin),
                y: centerY + (width/2 * sin - height/2 * cos)
            },
            { // Нижний левый
                x: centerX + (-width/2 * cos + height/2 * sin),
                y: centerY + (-width/2 * sin - height/2 * cos)
            }
        ];
    }

    static checkRotatedCollision(corners1, corners2) {
        for (let shape of [corners1, corners2]) {
            for (let i = 0; i < shape.length; i++) {
                const p1 = shape[i];
                const p2 = shape[(i + 1) % shape.length];
                
                const normal = {
                    x: p2.y - p1.y,
                    y: p1.x - p2.x
                };

                let min1 = Infinity, max1 = -Infinity;
                let min2 = Infinity, max2 = -Infinity;

                for (const p of corners1) {
                    const dot = p.x * normal.x + p.y * normal.y;
                    min1 = Math.min(min1, dot);
                    max1 = Math.max(max1, dot);
                }

                for (const p of corners2) {
                    const dot = p.x * normal.x + p.y * normal.y;
                    min2 = Math.min(min2, dot);
                    max2 = Math.max(max2, dot);
                }

                if (max1 < min2 || max2 < min1) {
                    return false;
                }
            }
        }
        return true;
    }

    static checkTankCollision(tank1X, tank1Y, tank1Rotation, tank1TurretRotation, 
                            tank2X, tank2Y, tank2Rotation, tank2TurretRotation, 
                            gameWidth, gameHeight) {
        const tankWidth = 50;
        const tankHeight = 54;
        const tracksOffset = 7;

        // Проверка границ
        if (tank1X - tracksOffset < 0 || 
            tank1Y < 0 || 
            tank1X + tankWidth + tracksOffset > gameWidth || 
            tank1Y + tankHeight > gameHeight) {
            return true;
        }

        // Быстрая проверка расстояния
        const dx = (tank1X + tankWidth/2) - (tank2X + tankWidth/2);
        const dy = (tank1Y + tankHeight/2) - (tank2Y + tankHeight/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > tankWidth + tankHeight) {
            return false;
        }

        // Проверяем только корпуса танков
        const fullWidth = tankWidth + 2 * tracksOffset;
        const tank1Corners = this.getRotatedCorners(tank1X - tracksOffset, tank1Y, fullWidth, tankHeight, tank1Rotation);
        const tank2Corners = this.getRotatedCorners(tank2X - tracksOffset, tank2Y, fullWidth, tankHeight, tank2Rotation);

        return this.checkRotatedCollision(tank1Corners, tank2Corners);
    }

    static checkBulletCollisions(bullet, game) {
        // Сначала показываем пулю (на случай, если она была скрыта)
        bullet.show();

        // Проверяем столкновение с блок��ми
        for (const block of game.map.blocks) {
            const blockBox = block.getCollisionBox();
            
            if (this.checkPointInRect({ x: bullet.x, y: bullet.y }, blockBox)) {
                // Если это куст - скрываем пулю и продолжаем
                if (block.type === Block.TYPES.BUSH) {
                    bullet.hide();
                    continue;
                }
                // Если это вода - просто пропускаем
                if (block.type === Block.TYPES.WATER) {
                    continue;
                }
                // Для остальных блоков - наносим урон
                if (block.hit(1)) {
                    game.map.blocks = game.map.blocks.filter(b => b !== block);
                }
                return true;
            }
        }

        // Проверяем столкновение с танками
        const tanks = [game.player, game.enemy];
        for (const tank of tanks) {
            if (tank === bullet.owner) continue;

            const tankCorners = this.getRotatedCorners(
                tank.position.x, 
                tank.position.y, 
                50, 54, 
                tank.rotation
            );

            if (this.checkPointInPolygon({ x: bullet.x, y: bullet.y }, tankCorners)) {
                // Определяем сторону попадания
                const tankCenter = {
                    x: tank.position.x + 25,
                    y: tank.position.y + 27
                };

                // Получаем угол между пулей и танком
                const dx = bullet.x - tankCenter.x;
                const dy = bullet.y - tankCenter.y;
                let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                // Корректируем угол относительно поворота танка
                angle = (angle - tank.rotation + 360) % 360;

                // Определяем сторону попадания
                let side;
                if (angle >= 315 || angle < 45) side = 'right';
                else if (angle >= 45 && angle < 135) side = 'back';
                else if (angle >= 135 && angle < 225) side = 'left';
                else side = 'front';

                tank.hit(side);
                return true;
            }
        }

        return false;
    }

    static checkPointInRect(point, rect) {
        return point.x >= rect.x 
            && point.x <= rect.x + rect.width
            && point.y >= rect.y 
            && point.y <= rect.y + rect.height;
    }

    static checkPointInPolygon(point, corners) {
        let inside = false;
        for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
            const xi = corners[i].x, yi = corners[i].y;
            const xj = corners[j].x, yj = corners[j].y;

            const intersect = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
} 