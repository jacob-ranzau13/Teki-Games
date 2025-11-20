async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch("http://localhost:4000/auth/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!data.success) {
    document.getElementById("error").innerText = "Invalid login.";
    return;
  }

  localStorage.setItem("user", JSON.stringify(data.user));
  window.location = "main.html";
}
