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