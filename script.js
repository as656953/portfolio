let daynight = document.querySelector(".daynight");
let banner = document.querySelector(".banner");
let home = document.querySelector(".home");
let about = document.querySelector(".about");

daynight.addEventListener("click", () => {
  banner.classList.toggle("night");
  home.classList.toggle("night");
  about.classList.toggle("night");
});

document.querySelector(".download-btn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = "resume.pdf"; // Make sure resume.pdf exists in the correct path
  link.download = "resume.pdf";
  link.click();
});
const letChatBtn = document.querySelector(".let-chat-btn");
if (letChatBtn) {
  letChatBtn.addEventListener("click", function () {
    window.open("mailto:workingadityasingh@gmail.com", "_blank");
  });
}
let typingeffect = new Typed("#text", {
  strings: ["Aditya", "Developer", "Designer", "Freelancer"],
  typeSpeed: 100,
  backSpeed: 100,
  loop: true,
});
let typingeffect2 = new Typed(".text", {
  strings: ["Frontend Developer", "UI/UX Designer", "Problem Solver"],
  typeSpeed: 100,
  backSpeed: 100,
  loop: true,
});

// Add scroll reveal animations
window.addEventListener("scroll", reveal);

function reveal() {
  let reveals = document.querySelectorAll(".home-content");

  reveals.forEach((element) => {
    let windowHeight = window.innerHeight;
    let elementTop = element.getBoundingClientRect().top;
    let elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      element.classList.add("active");
    }
  });
}

// Add smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Add event listener for the Let's Chat button

// Move button event listeners inside the loadContent function
async function loadContent(page) {
  try {
    const response = await fetch(`${page}.html`);
    const content = await response.text();
    document.getElementById("main-content").innerHTML = content;

    // Reinitialize typing effect for home page
    if (page === "home") {
      let typingeffect2 = new Typed(".text", {
        strings: ["Frontend Developer", "UI/UX Designer", "Problem Solver"],
        typeSpeed: 100,
        backSpeed: 100,
        loop: true,
      });
    }
  } catch (error) {
    console.error("Error loading content:", error);
  }
}

// Load home page by default
loadContent("home");

// Update navigation click handlers
document.querySelectorAll("header ul li a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const page = e.target.getAttribute("href").replace("#", "");
    loadContent(page);
  });
});
