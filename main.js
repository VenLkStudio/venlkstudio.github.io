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
