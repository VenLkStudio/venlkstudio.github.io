document.addEventListener('DOMContentLoaded', () => {
    const newsForm = document.getElementById('newsForm');
    const newsContainer = document.getElementById('news-container');
    const adminPanel = document.getElementById('admin-panel');
    const adminHeader = document.getElementById('admin-header');
    const clickArea = document.getElementById('click-area');
    const closeAdminPanel = document.getElementById('closeAdminPanel');
    let isAdmin = false;

    function loadNews() {
        const news = JSON.parse(localStorage.getItem('news')) || [];
        newsContainer.innerHTML = '';
        news.reverse().forEach((article, index) => {
            const newsArticle = document.createElement('article');
            newsArticle.innerHTML = `
                <div>
                    <h2>${article.title}</h2>
                    <p>${article.content}</p>
                    <time>${new Date(article.date).toLocaleString()}</time>
                </div>
                <div class="admin-controls">
                    <button class="edit-btn" data-index="${index}">✏️</button>
                    <button class="delete-btn" data-index="${index}">🗑️</button>
                </div>
            `;
            newsContainer.appendChild(newsArticle);
        });
        toggleAdminControls();
    }

    newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newsTitle = document.getElementById('newsTitle').value;
        const newsContent = document.getElementById('newsContent').value;
        const news = JSON.parse(localStorage.getItem('news')) || [];
        news.push({ title: newsTitle, content: newsContent, date: new Date() });
        localStorage.setItem('news', JSON.stringify(news));
        loadNews();
        newsForm.reset();
    });

    clickArea.addEventListener('click', () => {
        const code = prompt("Введите код:");
        if (code === "14887776665269") {
            isAdmin = true;
            adminPanel.style.display = 'block';
            toggleAdminControls();
        }
    });

    closeAdminPanel.addEventListener('click', () => {
        isAdmin = false;
        adminPanel.style.display = 'none';
        toggleAdminControls();
    });

    newsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            const news = JSON.parse(localStorage.getItem('news')) || [];
            news.splice(news.length - 1 - index, 1); // Reverse index
            localStorage.setItem('news', JSON.stringify(news));
            loadNews();
        } else if (e.target.classList.contains('edit-btn')) {
            const index = e.target.dataset.index;
            const news = JSON.parse(localStorage.getItem('news')) || [];
            const article = news[news.length - 1 - index]; // Reverse index
            const newTitle = prompt("Редактировать заголовок:", article.title);
            const newContent = prompt("Редактировать содержимое:", article.content);
            if (newTitle !== null && newContent !== null) {
                article.title = newTitle;
                article.content = newContent;
                localStorage.setItem('news', JSON.stringify(news));
                loadNews();
            }
        }
    });

    function toggleAdminControls() {
        document.querySelectorAll('.admin-controls').forEach(el => {
            el.style.display = isAdmin ? 'flex' : 'none';
        });
    }

    function makeDraggable(element) {
        let isMouseDown = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            if (e.target !== adminHeader) return;
            isMouseDown = true;
            offsetX = e.clientX - parseInt(window.getComputedStyle(element).left);
            offsetY = e.clientY - parseInt(window.getComputedStyle(element).top);
            adminHeader.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isMouseDown = false;
            adminHeader.style.cursor = 'grab';
        });
    }

    makeDraggable(adminPanel);

    loadNews();
});

const newspage = document.getElementById("newspage");
const picturespage = document.getElementById("picturespage")

document.getElementById("pictures").addEventListener("click", () => {
    newspage.style.opacity = "0";
    picturespage.style.opacity = "1";
    picturespage.style.transform = "translateY(0)";
});

document.getElementById("news").addEventListener("click", () => {
    newspage.style.opacity = "1";
    picturespage.style.opacity = "0";
    picturespage.style.transform = "translateY(100%)";
});