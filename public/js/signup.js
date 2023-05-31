const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const form = document.getElementById("form");
const msg = document.getElementById("msg");
const picInput = document.getElementById("pic");
const loader = document.getElementById("loader");

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}

form.addEventListener("submit", onSubmit);

async function onSubmit(e) {
  try {
    e.preventDefault();
    showLoader();
    const formdata = new FormData();
    formdata.append("name", nameInput.value);
    formdata.append("email", emailInput.value);
    formdata.append("phone", phoneInput.value);
    formdata.append("password", passwordInput.value);
    if (picInput.files[0]) {
      formdata.append("pic", picInput.files[0]);
    }
    // console.log(formdata);
    const serverResponse = await axios.post(
      "http://localhost:3000/signup",
      formdata,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    // console.log("serverResponse", serverResponse);
    if (serverResponse.data.status === "success") {
      hideLoader();
      updateDom(serverResponse.data.message);
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      hideLoader();
      console.log(serverResponse.response.data.message);
    }
  } catch (error) {
    hideLoader();
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
