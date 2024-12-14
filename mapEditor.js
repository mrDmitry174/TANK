class MapEditor {
    constructor(map) {
        this.map = map;
        this.currentTool = 'ground';
        this.isEditing = false;
        this.setupUI();
    }

    setupUI() {
        this.editorPanel = document.querySelector('.editor-panel');
        const buttons = this.editorPanel.querySelectorAll('.editor-btn');
        
        buttons.forEach(button => {
            if (button.classList.contains('clear')) {
                button.addEventListener('click', () => this.map.clear());
            } else {
                button.addEventListener('click', () => {
                    this.currentTool = button.dataset.tool;
                    buttons.forEach(b => b.classList.remove('active'));
                    button.classList.add('active');
                });
            }
        });

        // Обработка кликов по карте
        this.map.container.addEventListener('click', (e) => {
            if (!this.isEditing) return;
            
            const rect = this.map.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.addBlock(x, y);
        });

        // Включение/выключение режима редактирования
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE') {
                this.isEditing = !this.isEditing;
                this.map.container.classList.toggle('editing');
                this.editorPanel.style.display = this.isEditing ? 'block' : 'none';
            }
        });
    }

    addBlock(x, y) {
        const block = new Block(x, y, this.currentTool);
        this.map.addBlock(block);
    }
} 