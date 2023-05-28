const form = document.getElementById("my-form");
const emailInput = document.getElementById("email");
const closeBtn = document.getElementById("close-btn");
const addMemberList = document.getElementById("add-member-list");
const textInput = document.getElementById("text");
const token = localStorage.getItem("token");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", SearchUsers);

closeBtn.addEventListener("click", () => {
  window.location.href = "chat.html";
});

// form.addEventListener("submit", addMember);

async function AddMember(e, user) {
  try {
    e.preventDefault();
    const groupId = localStorage.getItem("activeGroup");
    const newMemberData = {
      email: user.email,
      groupId: groupId,
    };
    console.log(newMemberData);
    const serverResponse = await axios.post(
      "http://localhost:3000/admin/addMember",
      newMemberData,
      { headers: { authorization: token } }
    );
    if (serverResponse.status === 200) {
      const button = document.querySelector(`.user-btn-${user.id}`);
      console.log(button);
      button.textContent = "Added";
      button.disabled = true;
      // window.location.href = "chat.html";
    }
  } catch (error) {
    console.log(error);
  }
}

async function SearchUsers(e) {
  e.preventDefault();
  const groupId = localStorage.getItem("activeGroup");
  const searchValue = textInput.value;
  const sendData = {
    search: searchValue,
    groupId: groupId,
  };
  axios
    .post("http://localhost:3000/admin/getAllUsers", sendData, {
      headers: { authorization: token },
    })
    .then((serverResponse) => {
      console.log(serverResponse);
      if (serverResponse.status === 200) {
        const users = serverResponse.data.users;
        users.forEach((user) => appendUser(user));
      } else {
        const error = document.getElementById("error");
        error.innerText = "cannot find user";
      }
      textInput.value = "";
      setTimeout(() => {
        error.innerText = "";
      }, 2000);
    })
    .catch((err) => {
      console.log(err);
      const error = document.getElementById("error");
      error.innerText = "cannot find user";
      textInput.value = "";
      setTimeout(() => {
        error.innerText = "";
      }, 2000);
    });
}

function appendUser(user) {
  addMemberList.innerHTML = "";
  const li = document.createElement("li");
  li.className = "user-list";
  const button = document.createElement("button");
  button.className = `user-btn-${user.id}`;
  button.addEventListener("click", (event) => AddMember(event, user));
  button.textContent = "Add";
  li.textContent = user.name;
  li.appendChild(button);
  addMemberList.appendChild(li);
}
