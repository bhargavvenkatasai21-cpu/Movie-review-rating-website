async function register() {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitBtn = document.getElementById("registerSubmitBtn");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!name || !email || !password) {
        showToast("Please fill in all fields.", "#ef4444");
        return;
    }

    if (password.length < 6) {
        showToast("Password should be at least 6 characters long.", "#ef4444");
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Account...";
    }

    try {
        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json().catch(() => ({ message: "Registration failed." }));

        if (!response.ok) {
            showToast(data.message || "Registration failed.", "#ef4444");
            return;
        }

        showToast("Registration Successful! Redirecting...");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    } catch (error) {
        showToast(error.message || "Connection error", "#ef4444");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Register";
        }
    }
}

// Enable Enter key on register form
["name", "email", "password"].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") register();
        });
    }
});