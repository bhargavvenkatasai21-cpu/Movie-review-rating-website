async function login() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitBtn = document.getElementById("loginSubmitBtn");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!email || !password) {
        showToast("Please enter both email and password.", "#ef4444");
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";
    }

    try {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json().catch(() => ({ message: "Something went wrong." }));

        if (!response.ok) {
            showToast(data.message || "Invalid credentials", "#ef4444");
            return;
        }

        // Save token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showToast("Login Successful!");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);

    } catch (error) {
        showToast(error.message || "Connection error", "#ef4444");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Login";
        }
    }
}

// Enable Enter key on login form
["email", "password"].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") login();
        });
    }
});