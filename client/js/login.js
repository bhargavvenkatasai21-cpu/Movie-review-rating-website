async function login() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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

  localStorage.setItem("token", data.token);

  alert("Login Successful");

  window.location.href = "index.html";
}