function showRegister() {
  document.getElementById("register-modal").classList.remove("hidden");
  const first = document.getElementById("reg-username");
  if (first) first.focus();
}

function hideRegister() {
  document.getElementById("register-modal").classList.add("hidden");
  document.getElementById("register-error").innerText = "";
  document.getElementById("register-success").innerText = "";
  document.getElementById("reg-username").value = "";
  document.getElementById("reg-email").value = "";
  document.getElementById("reg-password").value = "";
}

async function register() {
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  document.getElementById("register-error").innerText = "";
  document.getElementById("register-success").innerText = "";

  if (!username || !email || !password) {
    document.getElementById("register-error").innerText = "All fields required.";
    return;
  }

  try {
    const res = await fetch("http://localhost:4000/auth/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!data.success) {
      document.getElementById("register-error").innerText = data.error || "Registration failed.";
      return;
    }
  document.getElementById("register-success").innerText = "Account created! You can now log in.";
  setTimeout(hideRegister, 1200);
  } catch (err) {
    document.getElementById("register-error").innerText = "Server error.";
  }
}
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
