 function getToken() {
    return localStorage.getItem("token");
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function isLoggedIn() {
    return !!getToken();
}

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}