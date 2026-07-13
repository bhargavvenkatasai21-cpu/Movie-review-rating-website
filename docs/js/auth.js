const API = "https://movie-review-rating-website.onrender.com/api";

function getToken() {
    return localStorage.getItem("token");
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function isLoggedIn() {
    return !!getToken();
}

function requireLogin() {

    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }

}

function logout() {

    showToast("Logout successful!");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);

}