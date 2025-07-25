let form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Ngăn chặn hành động submit mặc định của form{
  let username = document.getElementById("Username").value.trim();
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();
  // Đặt biến ktra kiểu dữ liệu
  let lowerCaseLetter = /[a-z]/g;
  let upperCaseLetter = /[A-Z]/g;
  let numbers = /[0-9]/g;
  // Đặt điều kiện ktra username, email, password
  if (username.length < 6) {
    alert("Username must be at least 6 characters long.");
  } else if (username.length < 8) {
    alert("Username must be at least 8 characters long.");
  } else if (!password.match(lowerCaseLetter)) {
    alert("Password must contain at least one lowercase letter.");
  } else if (!password.match(upperCaseLetter)) {
    alert("Password must contain at least one uppercase letter.");
  } else if (!password.match(numbers)) {
    alert("Password must contain at least one number.");
  } else {
    if (localStorage.getItem("user")) {
      let users = JSON.parse(localStorage.getItem("user"));
      users.push({
        username,
        email,
        password,
      });
      localStorage.setItem("user", JSON.stringify(users));
    } else {
      localStorage.setItem(
        "user",
        JSON.stringify([
          {
            username,
            email,
            password,
          },
        ])
      );
    }
  }
});
