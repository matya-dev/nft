class NFTRoulette {
    constructor() {
        this.userData = this.loadUserData();
        this.isSpinning = false;
        this.nftCollection = [];
        this.animationId = null;
        this.currentSpeed = 0;
        this.currentPosition = 0;
        this.init();
    }

    // Загрузка данных пользователя
    loadUserData() {
        const userCookie = this.getCookie('nft_user');
        if (userCookie) {
            try {
                return JSON.parse(userCookie);
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
            }
        }
        
        return {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            username: 'Игрок' + Math.floor(Math.random() * 1000),
            balance: 1000,
            registrationDate: new Date().toISOString(),
            stats: {
                totalSpins: 0,
                totalNFTWon: 0,
                mostExpensiveNFT: 0
            },
            inventory: []
        };
    }

    // Сохранение данных
    saveUserData() {
        this.setCookie('nft_user', JSON.stringify(this.userData), 365);
    }

    // Работа с куки
    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
    }

    getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === name) return decodeURIComponent(value);
        }
        return null;
    }

    // Загрузка NFT коллекции - БЕЗ ПРОВЕРКИ!
    async loadNFTCollection() {
        console.log('🚀 Загрузка NFT коллекции...');
        
        const basePath = 'NFT/';
        
        this.nftCollection = [
            { id: 1, name: 'ice', image: `${basePath}ice/ice.gif`, value: 75, rarity: 'common', fallback: '❄️' },
            { id: 2, name: 'calendar', image: `${basePath}calendar/calendar.gif`, value: 350, rarity: 'rare', fallback: '📅' },
            { id: 3, name: 'cake', image: `${basePath}cake/cake.gif`, value: 350, rarity: 'rare', fallback: '🎂' },
            { id: 4, name: 'lol', image: `${basePath}lol/lol.gif`, value: 350, rarity: 'rare', fallback: '😄' },
            { id: 5, name: 'happybday', image: `${basePath}happybday/happybday.gif`, value: 350, rarity: 'rare', fallback: '🎉' },
            { id: 6, name: 'socks', image: `${basePath}socks/socks.gif`, value: 7500, rarity: 'medium', fallback: '🧦' },
            { id: 7, name: 'scelet', image: `${basePath}scelet/scelet.gif`, value: 7500, rarity: 'medium', fallback: '💀' },
            { id: 8, name: 'cat', image: `${basePath}cat/cat.gif`, value: 7500, rarity: 'medium', fallback: '🐱' },
            { id: 9, name: 'cap', image: `${basePath}cap/cap.gif`, value: 175000, rarity: 'high', fallback: '🧢' },
            { id: 10, name: 'cigar', image: `${basePath}cigar/cigar.gif`, value: 175000, rarity: 'high', fallback: '💨' },
            { id: 11, name: 'shard', image: `${basePath}shard/shard.gif`, value: 175000, rarity: 'high', fallback: '💎' },
            { id: 12, name: 'pepe', image: `${basePath}pepe/pepe.gif`, value: 5000000, rarity: 'legendary', fallback: '🐸' },
            { id: 13, name: 'hearth', image: `${basePath}hearth/hearth.gif`, value: 5000000, rarity: 'legendary', fallback: '❤️' }
        ];

        console.log('✅ NFT коллекция загружена');
        return Promise.resolve(); // Сразу завершаем
    }

    // Инициализация
    async init() {
        console.log('🎮 Инициализация NFT Roulette');
        
        // Загружаем NFT без проверок
        await this.loadNFTCollection();
        
        // Сразу показываем загрузку
        this.showLoadingScreen();
    }

    // Экран загрузки
    showLoadingScreen() {
        console.log('📱 Показываем экран загрузки');
        const startTime = Date.now();
        const loadingTime = 1500; // Фиксированная загрузка 1.5 секунды
        
        const updateTime = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            document.getElementById('loading-time').textContent = elapsed.toFixed(2) + 's';
            
            if (elapsed * 1000 < loadingTime) {
                requestAnimationFrame(updateTime);
            } else {
                this.completeLoading();
            }
        };
        
        updateTime();
    }

    // Завершение загрузки
    completeLoading() {
        console.log('✅ Загрузка завершена!');
        document.getElementById('loading').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        this.setupEventListeners();
        this.updateUI();
    }

    // Настройка обработчиков
    setupEventListeners() {
        console.log('⚙️ Настройка обработчиков событий');
        
        document.getElementById('roulette-btn').addEventListener('click', () => {
            this.showSection('roulette-section');
            this.setupRoulette();
        });
        
        document.getElementById('inventory-btn').addEventListener('click', () => {
            this.showSection('inventory-section');
            this.updateInventory();
        });
        
        document.getElementById('profile-btn').addEventListener('click', () => {
            this.showSection('profile-section');
            this.updateProfile();
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            this.showSection('main-menu');
            this.stopRoulette();
        });
        
        document.getElementById('back-btn-inventory').addEventListener('click', () => {
            this.showSection('main-menu');
        });
        
        document.getElementById('back-btn-profile').addEventListener('click', () => {
            this.showSection('main-menu');
        });

        document.getElementById('spin-btn').addEventListener('click', () => {
            this.startSpin();
        });

        document.getElementById('save-username').addEventListener('click', () => {
            this.saveUsername();
        });
    }

    // Показать раздел
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    // Настройка рулетки - ИСПОЛЬЗУЕМ GIF!
    setupRoulette() {
        console.log('🎰 Настройка рулетки с GIF');
        const strip = document.getElementById('roulette-strip');
        strip.innerHTML = '';
        
        const totalItems = 100;
        for (let i = 0; i < totalItems; i++) {
            const nft = this.nftCollection[Math.floor(Math.random() * this.nftCollection.length)];
            const item = document.createElement('div');
            item.className = 'roulette-item';
            item.dataset.nftId = nft.id;
            
            // ВСЕГДА ИСПОЛЬЗУЕМ GIF! Если не загрузится - браузер покажет fallback
            item.innerHTML = `
                <img src="${nft.image}" alt="${nft.name}" class="nft-image">
                <div class="nft-name">${nft.name}</div>
            `;
            
            strip.appendChild(item);
        }
        
        this.currentPosition = 0;
        strip.style.transform = `translateX(${this.currentPosition}px)`;
        this.currentSpeed = 0;
        console.log('✅ Рулетка готова');
    }

    // Запуск вращения
    startSpin() {
        if (this.isSpinning) return;
        
        if (this.userData.balance < 10) {
            this.showNotification('Ошибка', 'Недостаточно средств!', 'error');
            return;
        }

        this.userData.balance -= 10;
        this.userData.stats.totalSpins++;
        this.isSpinning = true;
        
        const spinBtn = document.getElementById('spin-btn');
        spinBtn.disabled = true;
        
        this.currentSpeed = 50;
        this.animateRoulette();
        
        setTimeout(() => {
            this.stopSpin();
        }, 3000 + Math.random() * 3000);
    }

    // Анимация рулетки
    animateRoulette() {
        const strip = document.getElementById('roulette-strip');
        
        this.currentPosition -= this.currentSpeed;
        strip.style.transform = `translateX(${this.currentPosition}px)`;
        
        if (Math.abs(this.currentPosition) > 12000) {
            this.currentPosition = 0;
        }
        
        if (this.isSpinning) {
            this.animationId = requestAnimationFrame(() => this.animateRoulette());
        }
    }

    // Остановка вращения
    stopSpin() {
        this.isSpinning = false;
        
        const slowDown = () => {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 1.5;
                if (this.currentSpeed < 0) this.currentSpeed = 0;
                
                this.animateRoulette();
                
                if (this.currentSpeed > 0) {
                    setTimeout(slowDown, 50);
                } else {
                    this.determineWinner();
                    const spinBtn = document.getElementById('spin-btn');
                    spinBtn.disabled = false;
                }
            }
        };
        
        slowDown();
    }

    // Остановка рулетки
    stopRoulette() {
        this.isSpinning = false;
        this.currentSpeed = 0;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    // Определение победителя
    determineWinner() {
        const strip = document.getElementById('roulette-strip');
        const items = strip.getElementsByClassName('roulette-item');
        const centerX = window.innerWidth / 2;
        
        let closestItem = null;
        let minDistance = Infinity;
        
        for (let item of items) {
            const itemRect = item.getBoundingClientRect();
            const itemCenterX = itemRect.left + itemRect.width / 2;
            const distance = Math.abs(itemCenterX - centerX);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        }
        
        if (!closestItem) return;
        
        const nftId = parseInt(closestItem.dataset.nftId);
        const wonNFTData = this.nftCollection.find(nft => nft.id === nftId);
        
        if (!wonNFTData) return;
        
        closestItem.classList.add('winning');
        
        const wonNFT = {
            id: Date.now(),
            name: wonNFTData.name,
            image: wonNFTData.image,
            value: wonNFTData.value,
            rarity: wonNFTData.rarity,
            fallback: wonNFTData.fallback,
            dateWon: new Date().toISOString()
        };
        
        this.userData.inventory.push(wonNFT);
        this.userData.stats.totalNFTWon++;
        
        if (wonNFT.value > this.userData.stats.mostExpensiveNFT) {
            this.userData.stats.mostExpensiveNFT = wonNFT.value;
        }
        
        this.saveUserData();
        this.updateUI();
        this.showWinNotification(wonNFT);
        
        setTimeout(() => {
            closestItem.classList.remove('winning');
        }, 1000);
    }

    // Уведомление о выигрыше
    showWinNotification(nft) {
        let type = 'win';
        let title = '🎉 Поздравляем!';
        let description = `Вы выиграли ${nft.name.toUpperCase()}!`;
        
        if (nft.value >= 1000000) {
            type = 'legendary';
            title = '🚀 ЛЕГЕНДАРНО!';
            description = `ВЫ ВЫИГРАЛИ ${nft.name.toUpperCase()}!`;
        } else if (nft.value >= 100000) {
            type = 'epic';
            title = '💎 ЭПИЧЕСКИЙ ВЫИГРЫШ!';
            description = `${nft.name.toUpperCase()} - ${this.formatPrice(nft.value)} $`;
        } else if (nft.value >= 5000) {
            title = '⭐ ОТЛИЧНЫЙ ВЫИГРЫШ!';
            description = `${nft.name.toUpperCase()} - ${this.formatPrice(nft.value)} $`;
        } else {
            description = `${nft.name.toUpperCase()} - ${this.formatPrice(nft.value)} $`;
        }
        
        this.showNotification(title, description, type, nft.image, nft.fallback);
    }

    // Система уведомлений
    showNotification(title, description, type = 'win', image = null, fallback = null) {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        
        let iconContent = '';
        if (image) {
            iconContent = `<img src="${image}" alt="${title}" class="notification-icon">`;
        } else if (fallback) {
            iconContent = `<div class="notification-icon">${fallback}</div>`;
        } else {
            iconContent = `<div class="notification-icon">🎁</div>`;
        }
        
        notification.innerHTML = `
            <div class="notification-content">
                ${iconContent}
                <div class="notification-text">
                    <div class="notification-title">${title}</div>
                    <div class="notification-desc">${description}</div>
                </div>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        notifications.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                this.removeNotification(notification);
            }
        }, 4000);
    }

    removeNotification(notification) {
        notification.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }

    // Форматирование цены
    formatPrice(price) {
        if (price >= 1000000) {
            return (price / 1000000).toFixed(1) + 'M';
        } else if (price >= 1000) {
            return (price / 1000).toFixed(1) + 'K';
        }
        return price;
    }

    // Обновление инвентаря
    updateInventory() {
        const grid = document.getElementById('inventory-grid');
        const totalNFT = document.getElementById('total-nft');
        
        grid.innerHTML = '';
        totalNFT.textContent = this.userData.inventory.length;
        
        const sortedInventory = [...this.userData.inventory].sort((a, b) => b.value - a.value);
        
        sortedInventory.forEach((nft, index) => {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot has-nft';
            
            slot.innerHTML = `
                <img src="${nft.image}" alt="${nft.name}" class="nft-image">
                <div class="nft-name">${nft.name}</div>
                <div class="nft-value">${this.formatPrice(nft.value)} $</div>
                <button class="sell-btn" data-index="${this.userData.inventory.indexOf(nft)}">Продать</button>
            `;
            
            grid.appendChild(slot);
        });
        
        document.querySelectorAll('.sell-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.sellNFT(index);
            });
        });
        
        const emptySlots = Math.max(6, 12 - this.userData.inventory.length);
        for (let i = 0; i < emptySlots; i++) {
            const empty = document.createElement('div');
            empty.className = 'inventory-slot empty';
            empty.innerHTML = '⚫<br><small>Пусто</small>';
            grid.appendChild(empty);
        }
    }

    // Продажа NFT
    sellNFT(index) {
        const nft = this.userData.inventory[index];
        if (confirm(`Продать ${nft.name} за ${this.formatPrice(nft.value)} $?`)) {
            this.userData.balance += nft.value;
            this.userData.inventory.splice(index, 1);
            
            if (this.userData.inventory.length === 0) {
                this.userData.stats.mostExpensiveNFT = 0;
            } else if (nft.value === this.userData.stats.mostExpensiveNFT) {
                this.userData.stats.mostExpensiveNFT = Math.max(...this.userData.inventory.map(n => n.value));
            }
            
            this.saveUserData();
            this.updateUI();
            this.updateInventory();
            this.showNotification('💰 Продажа', `${nft.name} продан за ${this.formatPrice(nft.value)} $!`, 'win');
        }
    }

    // Сохранение имени
    saveUsername() {
        const newUsername = document.getElementById('profile-username').value.trim();
        if (newUsername && newUsername.length >= 3) {
            this.userData.username = newUsername;
            this.saveUserData();
            this.updateUI();
            this.showNotification('✅ Успех', 'Имя пользователя сохранено!', 'win');
        } else {
            this.showNotification('❌ Ошибка', 'Имя должно содержать минимум 3 символа', 'error');
        }
    }

    // Обновление профиля
    updateProfile() {
        document.getElementById('profile-username').value = this.userData.username;
        document.getElementById('profile-balance').textContent = this.formatPrice(this.userData.balance) + ' $';
        document.getElementById('registration-date').textContent = 
            new Date(this.userData.registrationDate).toLocaleDateString('ru-RU');
        document.getElementById('total-spins').textContent = this.userData.stats.totalSpins;
        document.getElementById('total-nft-won').textContent = this.userData.stats.totalNFTWon;
        document.getElementById('most-expensive').textContent = this.formatPrice(this.userData.stats.mostExpensiveNFT) + ' $';
    }

    // Обновление интерфейса
    updateUI() {
        document.getElementById('balance').textContent = this.formatPrice(this.userData.balance);
        document.getElementById('username').textContent = this.userData.username;
        this.updateProfile();
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== NFT ROULETTE ЗАПУЩЕН ===');
    new NFTRoulette();
});
