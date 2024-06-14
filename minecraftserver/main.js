document.addEventListener('DOMContentLoaded', () => {
	const newsContainer = document.getElementById('news-container')
	const guidesContainer = document.getElementById('guides-container')
	const clickArea = document.getElementById('click-area')
	const newspage = document.getElementById('newspage')
	let isAdmin = false

	// Firebase configuration
	// For Firebase JS SDK v7.20.0 and later, measurementId is optional
	const firebaseConfig = {
		apiKey: 'AIzaSyAafBwSveY6eZrDBZw4BVMaFTHuy2RfaCA',
		authDomain: 'yesserver-7ea61.firebaseapp.com',
		databaseURL:
			'https://yesserver-7ea61-default-rtdb.europe-west1.firebasedatabase.app',
		projectId: 'yesserver-7ea61',
		storageBucket: 'yesserver-7ea61.appspot.com',
		messagingSenderId: '1081353241153',
		appId: '1:1081353241153:web:3717856f9092b27436fcc0',
		measurementId: 'G-5DLG8H7CYY',
	}

	// Initialize Firebase
	firebase.initializeApp(firebaseConfig)
	const db = firebase.database()

	function loadNews() {
		db.ref('news')
			.orderByChild('date')
			.once('value')
			.then(snapshot => {
				newsContainer.innerHTML = ''
				snapshot.forEach(childSnapshot => {
					const article = childSnapshot.val()
					const newsArticle = document.createElement('article')
					newsArticle.innerHTML = `
                        <div>
                            <h2>${article.title}</h2>
                            <p>${article.content}</p>
                            <time>${new Date(
															article.date
														).toLocaleString()}</time>
                        </div>
                    `
					newsContainer.appendChild(newsArticle)
				})
			})
			.catch(error => console.error('Error loading news: ', error))
	}

	function loadGuides() {
		guidesContainer.innerHTML = ''
		db.ref('guides')
			.once('value')
			.then(snapshot => {
				snapshot.forEach(childSnapshot => {
					const guide = childSnapshot.val()
					const guideArticle = document.createElement('article')
					guideArticle.innerHTML = `
                        <div class="question_context">
                            <img src="pictures/Question.png" align="left" width="35">
                            <p>${guide.question}</p>
                        </div>
                        <div class="and"><img src="pictures/and.png" align="" width="25"></div>
                        <div class="question_context">
                            <img src="pictures/Answer.png" align="left" width="35">
                            <p>${guide.answer}</p>
                        </div>
                    `
					guidesContainer.appendChild(guideArticle)
				})
			})
			.catch(error => console.error('Error loading guides: ', error))
	}

	if (clickArea) {
		clickArea.addEventListener('click', () => {
			const code = prompt('Введите код:')
			if (code === '14887776665269') {
				isAdmin = true
				window.open('admin.html', 'Admin Panel', 'width=600,height=400')
			}
		})
	}

	function showPage(pageToShow, pageToHide1, pageToHide2, pageToHide3) {
		pageToHide1.classList.add('fade-out')
		pageToHide1.classList.remove('fade-in')
		pageToHide2.classList.add('fade-out')
		pageToHide2.classList.remove('fade-in')
		pageToHide3.classList.remove('fade-out')
		pageToHide3.classList.remove('fade-in')

		setTimeout(() => {
			pageToHide1.style.display = 'none'
			pageToHide1.classList.remove('fade-out')
			pageToHide2.style.display = 'none'
			pageToHide2.classList.remove('fade-out')
			pageToHide3.style.display = 'none'
			pageToHide3.classList.remove('fade-out')

			pageToShow.style.display = 'block'
			setTimeout(() => {
				pageToShow.classList.add('fade-in')
			}, 10)
		}, 300)
	}

	const guidesButton = document.getElementById('guides')
	const newsButton = document.getElementById('news')
	const helpButton = document.getElementById('help')
	const downloadButton = document.getElementById('download')

	if (guidesButton) {
		guidesButton.addEventListener('click', () => {
			const guidespage = document.querySelector('.guidespage')
			const helppage = document.querySelector('.helppage')
			const newspage = document.querySelector('.newspage')
			const downloadpage = document.querySelector('.downloadpage')

			showPage(guidespage, helppage, newspage, downloadpage)
			loadGuides()
		})
	}

	if (newsButton) {
		newsButton.addEventListener('click', () => {
			const helppage = document.querySelector('.helppage')
			const guidespage = document.querySelector('.guidespage')
			const newspage = document.querySelector('.newspage')
			const downloadpage = document.querySelector('.downloadpage')

			showPage(newspage, guidespage, helppage, downloadpage)
		})
	}

	if (helpButton) {
		helpButton.addEventListener('click', () => {
			const helppage = document.querySelector('.helppage')
			const guidespage = document.querySelector('.guidespage')
			const newspage = document.querySelector('.newspage')
			const downloadpage = document.querySelector('.downloadpage')

			showPage(helppage, guidespage, newspage, downloadpage)
		})
	}

	if (downloadButton) {
		downloadButton.addEventListener('click', () => {
			const helppage = document.querySelector('.helppage')
			const guidespage = document.querySelector('.guidespage')
			const newspage = document.querySelector('.newspage')
			const downloadpage = document.querySelector('.downloadpage')

			showPage(downloadpage, helppage, guidespage, newspage)
		})
	}

	loadNews()
	loadGuides()
})
