class MapEditor {
    constructor(map) {
        this.map = map;
        this.currentTool = Block.TYPES.GROUND;
        this.isEditing = false;
        this.grid = 40; // Размер сетки
        this.setupUI();
    }

    setupUI() {
        // Создаем панель инструментов
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'editor-toolbar';
        
        // Кнопка включения/выключения редактора
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Редактор карты';
        toggleBtn.className = 'editor-btn toggle';
        toggleBtn.addEventListener('click', () => this.toggleEditor());
        this.toolbar.appendChild(toggleBtn);

        // Кнопки для разных типов блоков
        const blockButtons = [
            { type: Block.TYPES.GROUND, text: 'Грунт' },
            { type: Block.TYPES.BRICK, text: 'Кирпич' },
            { type: Block.TYPES.STEEL, text: 'Сталь' },
            { type: Block.TYPES.WATER, text: 'Вода' },
            { type: Block.TYPES.BUSH, text: 'Кусты' }
        ];

        blockButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.className = 'editor-btn block-type';
            button.dataset.type = btn.type;
            button.addEventListener('click', () => this.setTool(btn.type));
            this.toolbar.appendChild(button);
        });

        // Кнопка очистки
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Очистить';
        clearBtn.className = 'editor-btn clear';
        clearBtn.addEventListener('click', () => this.map.clear());
        this.toolbar.appendChild(clearBtn);

        document.body.appendChild(this.toolbar);

        // Обработчик клика по карте
        this.map.element.addEventListener('click', (e) => {
            if (!this.isEditing) return;

            const rect = this.map.element.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.grid) * this.grid;
            const y = Math.floor((e.clientY - rect.top) / this.grid) * this.grid;

            this.map.addBlock(x, y, this.currentTool);
        });
    }

    toggleEditor() {
        this.isEditing = !this.isEditing;
        this.toolbar.classList.toggle('active');
        this.map.element.classList.toggle('editing');
    }

    setTool(type) {
        this.currentTool = type;
        // Подсвечиваем активную кнопку
        this.toolbar.querySelectorAll('.block-type').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
    }
} 