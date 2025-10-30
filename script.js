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

    // Загрузка NFT коллекции с ПРОВЕРКОЙ GIF
    async loadNFTCollection() {
        console.log('=== НАЧАЛО ЗАГРУЗКИ NFT ===');
        
        const basePath = 'NFT/';
        
        this.nftCollection = [
            { id: 1, name: 'ice', image: `${basePath}ice/ice.gif`, value: 75, rarity: 'common' },
            { id: 2, name: 'calendar', image: `${basePath}calendar/calendar.gif`, value: 350, rarity: 'rare' },
            { id: 3, name: 'cake', image: `${basePath}cake/cake.gif`, value: 350, rarity: 'rare' },
            { id: 4, name: 'lol', image: `${basePath}lol/lol.gif`, value: 350, rarity: 'rare' },
            { id: 5, name: 'happybday', image: `${basePath}happybday/happybday.gif`, value: 350, rarity: 'rare' },
            { id: 6, name: 'socks', image: `${basePath}socks/socks.gif`, value: 7500, rarity: 'medium' },
            { id: 7, name: 'scelet', image: `${basePath}scelet/scelet.gif`, value: 7500, rarity: 'medium' },
            { id: 8, name: 'cat', image: `${basePath}cat/cat.gif`, value: 7500, rarity: 'medium' },
            { id: 9, name: 'cap', image: `${basePath}cap/cap.gif`, value: 175000, rarity: 'high' },
            { id: 10, name: 'cigar', image: `${basePath}cigar/cigar.gif`, value: 175000, rarity: 'high' },
            { id: 11, name: 'shard', image: `${basePath}shard/shard.gif`, value: 175000, rarity: 'high' },
            { id: 12, name: 'pepe', image: `${basePath}pepe/pepe.gif`, value: 5000000, rarity: 'legendary' },
            { id: 13, name: 'hearth', image: `${basePath}hearth/hearth.gif`, value: 5000000, rarity: 'legendary' }
        ];

        // ПРОВЕРКА КАЖДОГО GIF ФАЙЛА
        const checkPromises = this.nftCollection.map(async (nft) => {
            console.log(`🔍 Проверяем: ${nft.image}`);
            
            try {
                const exists = await this.checkImageExists(nft.image);
                if (exists) {
                    console.log(`✅ GIF НАЙДЕН: ${nft.image}`);
                    nft.imageLoaded = true;
                } else {
                    console.log(`❌ GIF НЕ НАЙДЕН: ${nft.image}`);
                    nft.imageLoaded = false;
                    nft.fallback = this.getFallbackEmoji(nft.rarity);
                }
            } catch (error) {
                console.log(`⚠️ ОШИБКА ПРОВЕРКИ: ${nft.image}`, error);
                nft.imageLoaded = false;
                nft.fallback = this.getFallbackEmoji(nft.rarity);
            }
        });

        // Ждем проверки всех файлов (макс 5 секунд)
        await Promise.race([
            Promise.all(checkPromises),
            new Promise(resolve => setTimeout(resolve, 5000))
        ]);

        console.log('=== ЗАВЕРШЕНИЕ ПРОВЕРКИ NFT ===');
        console.log('Результаты:', this.nftCollection.map(nft => ({
            name: nft.name,
            image: nft.image,
            loaded: nft.imageLoaded
        })));
    }

    // ПРОВЕРКА СУЩЕСТВОВАНИЯ ИЗОБРАЖЕНИЯ
    checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            
            // Таймаут 3 секунды
            setTimeout(() => resolve(false), 3000);
        });
    }

    // Fallback emoji
    getFallbackEmoji(rarity) {
        const emojis = {
            common: '❄️',
            rare: '🎁',
            medium: '⭐',
            high: '💎',
            legendary: '👑'
        };
        return emojis[rarity] || '🎁';
    }

    // Инициализация
    async init() {
        console.log('🚀 ИНИЦИАЛИЗАЦИЯ NFT ROULETTE');
        await this.loadNFTCollection();
        this.showLoadingScreen();
    }

    // Экран загрузки
    showLoadingScreen() {
        console.log('📱 ПОКАЗЫВАЕМ ЭКРАН ЗАГРУЗКИ');
        const startTime = Date.now();
        const loadingTime = 2000; // 2 секунды
        
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
        console.log('✅ ЗАГРУЗКА ЗАВЕРШЕНА, ПОКАЗЫВАЕМ ИНТЕРФЕЙС');
        document.getElementById('loading').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        this.setupEventListeners();
        this.updateUI();
    }

    // Настройка обработчиков
    setupEventListeners() {
        console.log('⚙️ НАСТРОЙКА ОБРАБОТЧИКОВ');
        
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

    // Настройка рулетки с REAL GIF
    setupRoulette() {
        console.log('🎰 НАСТРОЙКА РУЛЕТКИ С GIF');
        const strip = document.getElementById('roulette-strip');
        strip.innerHTML = '';
        
        const totalItems = 100;
        for (let i = 0; i < totalItems; i++) {
            const nft = this.nftCollection[Math.floor(Math.random() * this.nftCollection.length)];
            const item = document.createElement('div');
            item.className = 'roulette-item';
            item.dataset.nftId = nft.id;
            
            // ИСПОЛЬЗУЕМ REAL GIF ЕСЛИ ОНИ ЗАГРУЗИЛИСЬ
            if (nft.imageLoaded) {
                console.log(`🎮 Используем GIF для: ${nft.name}`);
                item.innerHTML = `
                    <img src="${nft.image}" alt="${nft.name}" class="nft-image" 
                         onerror="this.style.display='none'; this.parentElement.innerHTML += '<div class=\\'nft-image\\'>${this.getFallbackEmoji(nft.rarity)}</div>'">
                    <div class="nft-name">${nft.name}</div>
                `;
            } else {
                console.log(`🔴 Используем fallback для: ${nft.name}`);
                item.innerHTML = `
                    <div class="nft-image">${nft.fallback}</div>
                    <div class="nft-name">${nft.name}</div>
                `;
            }
            
            strip.appendChild(item);
        }
        
        this.currentPosition = 0;
        strip.style.transform = `translateX(${this.currentPosition}px)`;
        this.currentSpeed = 0;
        console.log('🎰 РУЛЕТКА ГОТОВА');
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
            imageLoaded: wonNFTData.imageLoaded,
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
        
        this.showNotification(title, description, type, nft.image, nft.fallback, nft.imageLoaded);
    }

    // Система уведомлений
    showNotification(title, description, type = 'win', image = null, fallback = null, imageLoaded = false) {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        
        let iconContent = '';
        if (imageLoaded && image) {
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
            
            if (nft.imageLoaded) {
                slot.innerHTML = `
                    <img src="${nft.image}" alt="${nft.name}" class="nft-image" 
                         onerror="this.style.display='none'; this.parentElement.innerHTML = '${nft.fallback}<br>${nft.name}<br>${this.formatPrice(nft.value)} $<br><button class=\\'sell-btn\\' data-index=\\'${this.userData.inventory.indexOf(nft)}\\'>Продать</button>'">
                    <div class="nft-name">${nft.name}</div>
                    <div class="nft-value">${this.formatPrice(nft.value)} $</div>
                    <button class="sell-btn" data-index="${this.userData.inventory.indexOf(nft)}">Продать</button>
                `;
            } else {
                slot.innerHTML = `
                    <div class="nft-image">${nft.fallback}</div>
                    <div class="nft-name">${
