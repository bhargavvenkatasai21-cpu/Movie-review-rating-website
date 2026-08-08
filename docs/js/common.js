let toastTimer;

function showToast(message, color = "#22c55e") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.style.backgroundColor = color;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

// ----------------------------------------------------
// THEME SWITCHER (Dark / Light Mode)
// ----------------------------------------------------
function initTheme() {
    const savedTheme = localStorage.getItem("appTheme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeBtnText(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("appTheme", newTheme);
    updateThemeBtnText(newTheme);
    
    if (typeof showToast === 'function') {
        showToast(`Switched to ${newTheme === 'dark' ? '🌙 Dark' : '☀️ Light'} Mode`);
    }
}

function updateThemeBtnText(theme) {
    const themeBtns = document.querySelectorAll(".theme-toggle-btn");
    themeBtns.forEach(btn => {
        btn.innerHTML = theme === "dark" ? "☀️ Light" : "🌙 Dark";
        btn.setAttribute("title", `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`);
    });
}

// Auto-initialize theme on script execution
initTheme();
document.addEventListener("DOMContentLoaded", initTheme);