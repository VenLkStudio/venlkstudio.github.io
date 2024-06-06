const main = document.getElementById("main");
const projectsPage = document.getElementById("projectsPage");
const projectsList = document.getElementById("projects-list");
const searchInput = document.getElementById("searchInput");
const notFoundMessage = document.querySelector(".not-found");
const projects = Array.from(document.querySelectorAll(".projects-page article"));

document.getElementById("projects").addEventListener("click", () => {
    main.style.opacity = "0";
    projectsPage.style.opacity = "1";
    projectsPage.style.transform = "translateY(0)";
});

document.getElementById("home").addEventListener("click", () => {
    main.style.opacity = "1";
    projectsPage.style.opacity = "0";
    projectsPage.style.transform = "translateY(100%)";
});

searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    projects.forEach(project => {
        const projectName = project.querySelector("h2").textContent.trim().toLowerCase();
        if (projectName.includes(searchTerm)) {
            project.style.display = "block";
        } else {
            project.style.display = "none";
        }
    });

    const visibleProjects = projects.filter(project => project.style.display !== "none");

    if (visibleProjects.length === 0) {
        notFoundMessage.style.display = "block";
    } else {
        notFoundMessage.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    let slideIndex = 0;
    showSlides();

    function showSlides() {
        let slides = document.getElementsByClassName("slide");
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slideIndex++;
        if (slideIndex > slides.length) {slideIndex = 1}
        slides[slideIndex-1].style.display = "block";
        setTimeout(showSlides, 5000); // Change image every 5 seconds
    }

    document.querySelector(".prev").addEventListener("click", () => {
        plusSlides(-1);
    });

    document.querySelector(".next").addEventListener("click", () => {
        plusSlides(1);
    });

    function plusSlides(n) {
        showSlide(slideIndex += n);
    }

    function showSlide(n) {
        let slides = document.getElementsByClassName("slide");
        if (n > slides.length) {slideIndex = 1}
        if (n < 1) {slideIndex = slides.length}
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slides[slideIndex-1].style.display = "block";
    }
});

