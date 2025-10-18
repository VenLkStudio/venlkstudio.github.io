//  конфигурация для гитхаба
const CONFIG = {
    GITHUB_USERNAME: 'VenLkStudio', // Замените на ваш GitHub username
    CACHE_TIME: 5 * 60 * 1000, // 5 минут кэш
    BLACKLIST: [
        'venlkstudio.github.io', 'VenLkStudio' 
    ],
    LABELS: {
        ARCHIVED: {
            text: 'Архивирован',
            icon: 'archive',
            color: '#6c757d'
        },
        LONG_INACTIVE: {
            text: 'Давно не обновлялся',
            icon: 'schedule',
            color: '#ffc107',
            daysThreshold: 180
        },
        VERY_OLD: {
            text: 'Очень старый',
            icon: 'history',
            color: '#dc3545',
            daysThreshold: 365
        },
        NEW: {
            text: 'Новый',
            icon: 'new_releases',
            color: '#28a745',
            daysThreshold: 30
        },
        POPULAR: {
            text: 'Популярный',
            icon: 'trending_up',
            color: '#17a2b8',
            starsThreshold: 10
        },
        ACTIVE: {
            text: 'Активный',
            icon: 'bolt',
            color: '#40e0d0',
            daysThreshold: 7
        }
    }
};

//  это для переключения между вкладками

const pages = {
    home: document.getElementById('homePage'),
    projects: document.getElementById('projectsPage'),
    telegram: document.getElementById('telegramPage')
};

const navLinks = {
    home: document.getElementById('homeLink'),
    projects: document.getElementById('projectsLink'),
    telegram: document.getElementById('telegramLink')
};

const pageTitle = document.getElementById('pageTitle');
const searchInput = document.getElementById('searchInput');
const projectsGrid = document.getElementById('projectsGrid');
const notFound = document.getElementById('notFound');
const loading = document.getElementById('loading');
const refreshBtn = document.getElementById('refreshBtn');
const dynamicPages = document.getElementById('dynamicPages');

// название для страниц (которые, кстати, не работают)
const pageTitles = {
    home: 'Главная страница',
    projects: 'Последние обновлённые проекты'
};

let projectsCache = null;
let cacheTimestamp = null;

// работа с гитхабом
async function fetchGitHubRepos() {
    try {
        const response = await fetch(`https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?sort=updated&per_page=30`);
        if (!response.ok) throw new Error('GitHub API error');
        const repos = await response.json();
        
        // Фильтруем форки, чёрный список и сортируем по дате обновления
        const filteredRepos = repos
            .filter(repo => !repo.fork && !CONFIG.BLACKLIST.includes(repo.name))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        return filteredRepos;
    } catch (error) {
        console.error('Ошибка загрузки репозиториев:', error);
        return [];
    }
}

async function fetchRepoDetails(owner, repo) {
    try {
        const [repoData, releases, readme, issues] = await Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${repo}`).then(r => r.json()),
            fetch(`https://api.github.com/repos/${owner}/${repo}/releases`).then(r => r.json()).catch(() => []),
            fetch(`https://api.github.com/repos/${owner}/${repo}/readme`).then(r => r.json()).catch(() => null),
            fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=20`).then(r => r.json()).catch(() => [])
        ]);
        
        return { repoData, releases, readme, issues };
    } catch (error) {
        console.error('Ошибка загрузки деталей репозитория:', error);
        return null;
    }
}

// создание карточки проекта

function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C': '#555555',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'TypeScript': '#2b7489',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Shell': '#89e051',
        'Vue': '#41b883',
        'React': '#61dafb',
    };
    return colors[language] || '#858585';
}

// форматирование даты

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
    return date.toLocaleDateString('ru-RU');
}

// получение меток по типо архивирован, активный, новый и т.д.

function getRepoLabels(repo) {
    const labels = [];
    const now = new Date();
    const updatedDate = new Date(repo.updated_at);
    const createdDate = new Date(repo.created_at);
    const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
    const daysSinceCreation = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    
    // Архивирован
    if (repo.archived) {
        labels.push(CONFIG.LABELS.ARCHIVED);
    }
    
    // Активный (обновлён недавно)
    if (daysSinceUpdate <= CONFIG.LABELS.ACTIVE.daysThreshold && !repo.archived) {
        labels.push(CONFIG.LABELS.ACTIVE);
    }
    
    // Новый проект
    if (daysSinceCreation <= CONFIG.LABELS.NEW.daysThreshold && !repo.archived) {
        labels.push(CONFIG.LABELS.NEW);
    }
    
    // Популярный
    if (repo.stargazers_count >= CONFIG.LABELS.POPULAR.starsThreshold) {
        labels.push(CONFIG.LABELS.POPULAR);
    }
    
    // Очень старый (больше года без обновлений)
    if (daysSinceUpdate >= CONFIG.LABELS.VERY_OLD.daysThreshold && !repo.archived) {
        labels.push(CONFIG.LABELS.VERY_OLD);
    }
    // Давно не обновлялся (6+ месяцев, но меньше года)
    else if (daysSinceUpdate >= CONFIG.LABELS.LONG_INACTIVE.daysThreshold && !repo.archived) {
        labels.push(CONFIG.LABELS.LONG_INACTIVE);
    }
    
    return labels;
}

// здесь эта карточка проекта на сайт добавляется

function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.project = repo.name;
    
    // Пытаемся найти иконку в репозитории
    const iconUrl = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/icon.png`;
    const fallbackIcon = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/logo.png`;
    
    card.innerHTML = `
        <div class="project-image-container">
            <div class="animated-bg"></div>
            <img src="${iconUrl}" 
                 alt="${repo.name}" 
                 class="project-image"
                 onerror="this.onerror=null; this.src='${fallbackIcon}'; this.onerror=function(){this.style.display='none';}">
        </div>
        <div class="project-content">
            <div class="project-meta">
                <div class="project-badge">
                    <span class="material-symbols-outlined">schedule</span>
                    <span>${formatDate(repo.updated_at)}</span>
                </div>
            </div>
            <h2 class="project-title">${repo.name}</h2>
            <p class="project-description">${repo.description || 'Без описания'}</p>
            ${repo.language ? `
                <div class="project-language">
                    <span class="language-dot" style="background-color: ${getLanguageColor(repo.language)}"></span>
                    <span>${repo.language}</span>
                </div>
            ` : ''}
        </div>
    `;
    
    card.addEventListener('click', () => openProjectPage(repo));
    
    return card;
}

// загрузка проектов

async function loadProjects(forceRefresh = false) {
    // Проверяем кэш
    if (!forceRefresh && projectsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CONFIG.CACHE_TIME)) {
        displayProjects(projectsCache);
        return;
    }
    
    loading.classList.add('visible');
    projectsGrid.innerHTML = '';
    notFound.classList.remove('visible');
    
    const repos = await fetchGitHubRepos();
    
    if (repos.length === 0) {
        loading.classList.remove('visible');
        notFound.classList.add('visible');
        notFound.querySelector('p').textContent = 'Не удалось загрузить проекты из GitHub';
        return;
    }
    
    projectsCache = repos;
    cacheTimestamp = Date.now();
    
    displayProjects(repos);
}

function displayProjects(repos) {
    loading.classList.remove('visible');
    projectsGrid.innerHTML = '';
    
    repos.forEach(repo => {
        const card = createProjectCard(repo);
        projectsGrid.appendChild(card);
    });
    
    // Применяем цвета к карточкам
    setTimeout(() => initializeCardColors(), 100);
}

//  создание страницы проекта

async function openProjectPage(repo) {
    const pageId = `project-${repo.name}`;
    let projectPage = document.getElementById(pageId);
    
    if (!projectPage) {
        projectPage = await createProjectPage(repo);
        dynamicPages.appendChild(projectPage);
    }
    
    // Скрываем все страницы
    document.querySelectorAll('.page, .project-page').forEach(p => p.classList.remove('active'));
    
    // Показываем страницу проекта
    projectPage.classList.add('active');
    pageTitle.textContent = repo.name;
    
    // Убираем активность с навигации
    Object.values(navLinks).forEach(link => link.classList.remove('active'));
}

async function createProjectPage(repo) {
    const page = document.createElement('div');
    page.className = 'project-page';
    page.id = `project-${repo.name}`;
    
    // Получаем детали проекта
    const details = await fetchRepoDetails(repo.owner.login, repo.name);
    const releases = details?.releases || [];
    const readme = details?.readme || null;
    const issues = details?.issues || [];
    
    const openIssues = issues.filter(i => i.state === 'open');
    const closedIssues = issues.filter(i => i.state === 'closed');
    
    const iconUrl = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/icon.png`;
    
    page.innerHTML = `
        <a href="#" class="back-button" onclick="event.preventDefault(); window.siteAPI.backToProjects()">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Назад к проектам</span>
        </a>
        
        <div class="project-header">
            <div class="project-header-content">
                <img src="${iconUrl}" alt="${repo.name}" class="project-icon-large" onerror="this.style.display='none'">
                <h2>${repo.name}</h2>
                <p>${repo.description || 'Без описания'}</p>
                <div class="project-links">
                    <a href="${repo.html_url}" target="_blank" class="btn">
                        <span class="material-symbols-outlined">open_in_new</span>
                        <span>GitHub</span>
                    </a>
                    ${repo.homepage ? `
                        <a href="${repo.homepage}" target="_blank" class="btn">
                            <span class="material-symbols-outlined">language</span>
                            <span>Сайт</span>
                        </a>
                    ` : ''}
                    <a href="${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip" class="btn">
                        <span class="material-symbols-outlined">download</span>
                        <span>Скачать</span>
                    </a>
                </div>
            </div>
        </div>
        
        <div class="tabs">
            <button class="tab active" data-tab="overview">Обзор</button>
            <button class="tab" data-tab="versions">Версии (${releases.length})</button>
            <button class="tab" data-tab="issues">Issues (${openIssues.length})</button>
            <button class="tab" data-tab="stats">Статистика</button>
            <button class="tab" data-tab="readme">README</button>
        </div>
        
        <div class="tab-content active" id="overview-${repo.name}">
            <div class="content-section">
                <h3>Информация о проекте</h3>
                <ul>
                    <li><strong>Создан:</strong> ${new Date(repo.created_at).toLocaleDateString('ru-RU')}</li>
                    <li><strong>Обновлен:</strong> ${formatDate(repo.updated_at)}</li>
                    <li><strong>Язык:</strong> ${repo.language || 'Не указан'}</li>
                    <li><strong>Лицензия:</strong> ${repo.license?.name || 'Не указана'}</li>
                    <li><strong>Ветка по умолчанию:</strong> ${repo.default_branch}</li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3>Активность</h3>
                <ul>
                    <li><strong>⭐ Звёзд:</strong> ${repo.stargazers_count}</li>
                    <li><strong>👁️ Наблюдателей:</strong> ${repo.watchers_count}</li>
                    <li><strong>🔱 Форков:</strong> ${repo.forks_count}</li>
                    <li><strong>⚠️ Открытых issues:</strong> ${repo.open_issues_count}</li>
                </ul>
            </div>
        </div>
        
        <div class="tab-content" id="versions-${repo.name}">
            <div class="content-section">
                <h3>Релизы проекта</h3>
                ${releases.length > 0 ? `
                    <div class="version-list">
                        ${releases.map(release => `
                            <div class="version-item">
                                <div class="version-header">
                                    <span class="version-tag">${release.tag_name}</span>
                                    <span class="version-date">${new Date(release.published_at).toLocaleDateString('ru-RU')}</span>
                                </div>
                                <h4>${release.name || release.tag_name}</h4>
                                <p>${release.body || 'Нет описания'}</p>
                                <a href="${release.html_url}" target="_blank" class="btn" style="margin-top: 12px;">
                                    <span class="material-symbols-outlined">download</span>
                                    <span>Скачать релиз</span>
                                </a>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>Релизов пока нет</p>'}
            </div>
        </div>
        
        <div class="tab-content" id="issues-${repo.name}">
            <div class="content-section">
                <h3>Issues и обсуждения</h3>
                ${issues.length > 0 ? `
                    <div style="margin-bottom: 16px;">
                        <span style="color: var(--fg-secondary);">
                            Открыто: <strong style="color: #28a745;">${openIssues.length}</strong> | 
                            Закрыто: <strong style="color: #dc3545;">${closedIssues.length}</strong>
                        </span>
                    </div>
                    <div class="version-list">
                        ${issues.map(issue => {
                            const createdDate = new Date(issue.created_at);
                            const now = new Date();
                            const daysAgo = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
                            
                            return `
                            <div class="issue-item" onclick="window.open('${issue.html_url}', '_blank')">
                                <div class="issue-header">
                                    <span class="issue-state ${issue.state}">
                                        <span class="material-symbols-outlined">
                                            ${issue.state === 'open' ? 'radio_button_checked' : 'check_circle'}
                                        </span>
                                        ${issue.state === 'open' ? 'Открыто' : 'Закрыто'}
                                    </span>
                                    <div class="issue-content">
                                        <div class="issue-title">
                                            <span class="issue-number">#${issue.number}</span>
                                            <span>${issue.title}</span>
                                        </div>
                                        ${issue.body ? `<div class="issue-body">${issue.body}</div>` : ''}
                                        <div class="issue-meta">
                                            <div class="issue-meta-item">
                                                <span class="material-symbols-outlined">person</span>
                                                <span>${issue.user.login}</span>
                                            </div>
                                            <div class="issue-meta-item">
                                                <span class="material-symbols-outlined">schedule</span>
                                                <span>${daysAgo === 0 ? 'Сегодня' : daysAgo === 1 ? 'Вчера' : `${daysAgo} дн. назад`}</span>
                                            </div>
                                            ${issue.comments > 0 ? `
                                                <div class="issue-meta-item">
                                                    <span class="material-symbols-outlined">comment</span>
                                                    <span>${issue.comments}</span>
                                                </div>
                                            ` : ''}
                                        </div>
                                        ${issue.labels.length > 0 ? `
                                            <div class="issue-labels">
                                                ${issue.labels.map(label => `
                                                    <span class="issue-label" style="background-color: #${label.color}">
                                                        ${label.name}
                                                    </span>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <span class="material-symbols-outlined">inbox</span>
                        <p>Issues не найдены</p>
                    </div>
                `}
            </div>
        </div>
        
        <div class="tab-content" id="stats-${repo.name}">
            <div class="content-section">
                <h3>Статистика репозитория</h3>
                <ul>
                    <li><strong>Размер:</strong> ${(repo.size / 1024).toFixed(2)} MB</li>
                    <li><strong>Основной язык:</strong> ${repo.language || 'Не указан'}</li>
                    <li><strong>Видимость:</strong> ${repo.private ? 'Приватный' : 'Публичный'}</li>
                    <li><strong>Архивирован:</strong> ${repo.archived ? 'Да' : 'Нет'}</li>
                    <li><strong>Форк:</strong> ${repo.fork ? 'Да' : 'Нет'}</li>
                    <li><strong>Темы:</strong> ${repo.topics?.join(', ') || 'Нет'}</li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3>Ссылки</h3>
                <ul>
                    <li><a href="${repo.html_url}" target="_blank" style="color: var(--accent)">Репозиторий на GitHub</a></li>
                    <li><a href="${repo.html_url}/issues" target="_blank" style="color: var(--accent)">Issues</a></li>
                    <li><a href="${repo.html_url}/pulls" target="_blank" style="color: var(--accent)">Pull Requests</a></li>
                    <li><a href="${repo.html_url}/commits" target="_blank" style="color: var(--accent)">Коммиты</a></li>
                </ul>
            </div>
        </div>
        
        <div class="tab-content" id="readme-${repo.name}">
            <div class="content-section">
                <h3>README</h3>
                ${readme ? `<div id="readme-content-${repo.name}">Загрузка...</div>` : '<p>README файл не найден</p>'}
            </div>
        </div>
    `;
    
    // Обработчики вкладок
    const tabs = page.querySelectorAll('.tab');
    const tabContents = page.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            page.querySelector(`#${tabId}-${repo.name}`).classList.add('active');
        });
    });
    
    // Загружаем README если есть
    if (readme) {
        loadReadme(repo, readme);
    }
    
    return page;
}

async function loadReadme(repo, readmeData) {
    try {
        const content = atob(readmeData.content);
        const readmeContainer = document.getElementById(`readme-content-${repo.name}`);
        
        // Простое форматирование markdown
        const formattedContent = content
            .replace(/#{1,6}\s(.+)/g, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        readmeContainer.innerHTML = `<p>${formattedContent}</p>`;
    } catch (error) {
        console.error('Ошибка загрузки README:', error);
    }
}

// навигация

function setActiveNav(activeLink) {
    Object.values(navLinks).forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function showPage(pageName) {
    // Скрываем все страницы включая динамические
    document.querySelectorAll('.page, .project-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показываем нужную страницу
    if (pages[pageName]) {
        pages[pageName].classList.add('active');
        pageTitle.textContent = pageTitles[pageName];
        
        // Загружаем проекты при открытии страницы проектов
        if (pageName === 'projects' && !projectsCache) {
            loadProjects();
        }
    }
}

function backToProjects() {
    showPage('projects');
    setActiveNav(navLinks.projects);
}

// Обработчики навигации
navLinks.home.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('home');
    setActiveNav(navLinks.home);
});

navLinks.projects.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('projects');
    setActiveNav(navLinks.projects);
});

navLinks.telegram.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('telegram');
    setActiveNav(navLinks.telegram);
});

refreshBtn.addEventListener('click', () => {
    loadProjects(true);
});

// поиск

function searchProjects() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const projectCards = projectsGrid.querySelectorAll('.project-card');
    let visibleCount = 0;

    projectCards.forEach(card => {
        const title = card.querySelector('.project-title').textContent.toLowerCase();
        const description = card.querySelector('.project-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    if (visibleCount === 0 && searchTerm !== '') {
        notFound.classList.add('visible');
        notFound.querySelector('p').textContent = 'Проекты не найдены';
    } else {
        notFound.classList.remove('visible');
    }
}

let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchProjects, 300);
});

// извлечение "главного" цвета из изображения

function extractDominantColor(imgElement) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imgElement.src;
        
        img.onload = () => {
            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);
            
            try {
                const imageData = ctx.getImageData(0, 0, 50, 50);
                const data = imageData.data;
                
                let r = 0, g = 0, b = 0, count = 0;
                
                for (let i = 0; i < data.length; i += 16) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }
                
                resolve({
                    r: Math.floor(r / count),
                    g: Math.floor(g / count),
                    b: Math.floor(b / count)
                });
            } catch (error) {
                resolve({ r: 100, g: 80, b: 120 });
            }
        };
        
        img.onerror = () => resolve({ r: 100, g: 80, b: 120 });
    });
}

function createGradientFromColor(r, g, b) {
    const color1 = `rgba(${r}, ${g}, ${b}, 0.4)`;
    const color2 = `rgba(${Math.min(r + 50, 255)}, ${Math.min(g + 30, 255)}, ${Math.min(b + 60, 255)}, 0.4)`;
    const color3 = `rgba(${Math.max(r - 30, 0)}, ${Math.max(g - 20, 0)}, ${Math.min(b + 40, 255)}, 0.4)`;
    const color4 = `rgba(${Math.min(r + 40, 255)}, ${Math.max(g - 30, 0)}, ${Math.min(b + 50, 255)}, 0.4)`;
    
    return `linear-gradient(45deg, ${color1}, ${color2}, ${color3}, ${color4})`;
}

async function applyColorToCard(card) {
    const img = card.querySelector('.project-image');
    const animatedBg = card.querySelector('.animated-bg');
    const container = card.querySelector('.project-image-container');
    
    if (!img || !animatedBg || img.style.display === 'none') return;
    
    try {
        const color = await extractDominantColor(img);
        const gradient = createGradientFromColor(color.r, color.g, color.b);
        
        animatedBg.style.background = gradient;
        animatedBg.style.backgroundSize = '400% 400%';
        
        // Применяем цвет к фону контейнера
        container.style.background = `linear-gradient(135deg, rgb(${color.r}, ${color.g}, ${color.b}), rgb(${Math.max(color.r - 40, 0)}, ${Math.max(color.g - 40, 0)}, ${Math.max(color.b - 40, 0)}))`;
    } catch (error) {
        console.log('Ошибка при извлечении цвета:', error);
    }
}

function initializeCardColors() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        const img = card.querySelector('.project-image');
        
        if (img.complete && img.style.display !== 'none') {
            setTimeout(() => applyColorToCard(card), index * 100);
        } else {
            img.addEventListener('load', () => {
                setTimeout(() => applyColorToCard(card), index * 100);
            });
        }
    });
}

window.siteAPI = {
    showPage,
    setActiveNav,
    searchProjects,
    loadProjects,
    backToProjects,
    extractDominantColor,
    applyColorToCard,
    initializeCardColors,
    openProjectPage,
    CONFIG
};