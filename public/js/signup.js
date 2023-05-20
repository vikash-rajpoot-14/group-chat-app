const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const form = document.getElementById("form");
const msg = document.getElementById("msg");
// const picInput = document.getElementById("pic");

form.addEventListener("submit", onSubmit);

async function onSubmit(e) {
  try {
    e.preventDefault();
    // console.log(picInput.files[0]);
    const userData = {
      name: nameInput.value,
      email: emailInput.value,
      phone: phoneInput.value,
      password: passwordInput.value,
      //   pic: picInput.files[0],
    };
    const serverResponse = await axios.post(
      "http://localhost:3000/signup",
      userData
    );
    console.log("serverResponse", serverResponse);
    if (serverResponse.data.status === "success") {
      updateDom(serverResponse.data.message);
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      console.log(serverResponse.response.data.message);
    }
  } catch (error) {
    console.log(error.response.data.message);
    updateDom(error.response.data.message);
  }
}

function updateDom(user) {
  msg.innerHTML = "";
  const item = document.createElement("li");
  item.innerHTML = `<li>${user}</li>`;
  msg.appendChild(item);
}
