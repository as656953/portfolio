// Only add event listener if daynight button exists (index.html)
const daynightButton = document.querySelector('.daynight');
if (daynightButton) {
    daynightButton.addEventListener('click', () => {
        // Find the closest section parent
        const section = daynightButton.closest('section');
        if (section) {
            section.classList.toggle('night');
            
            // Store the night mode state
            const isNight = section.classList.contains('night');
            localStorage.setItem('nightMode', isNight);
            
            // Apply the same night mode state to all sections
            document.querySelectorAll('section').forEach(otherSection => {
                if (isNight) {
                    otherSection.classList.add('night');
                } else {
                    otherSection.classList.remove('night');
                }
            });
        }
    });
}

// Apply saved night mode state on page load (works on all pages)
window.addEventListener('load', () => {
    const isNight = localStorage.getItem('nightMode') === 'true';
    document.querySelectorAll('section').forEach(section => {
        if (isNight) {
            section.classList.add('night');
        } else {
            section.classList.remove('night');
        }
    });
});

// Download resume functionality
document.querySelector(".download-btn")?.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = "resume.pdf";
  link.download = "resume.pdf";
  link.click();
});

// Email functionality
const letChatBtn = document.querySelector(".let-chat-btn");
if (letChatBtn) {
  letChatBtn.addEventListener("click", function () {
    window.open("mailto:workingadityasingh@gmail.com", "_blank");
  });
}

// Scroll reveal animations
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

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href"))?.scrollIntoView({
      behavior: "smooth",
    });
  });
});


