async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        // Save token
        localStorage.setItem("token", data.token);

        // Save login user
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        alert("Login Successful");

        window.location.href = "index.html";

    } catch (error) {

        alert(error.message);

    }

}