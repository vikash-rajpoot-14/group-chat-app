const form = document.getElementById("form");
const messageInput = document.getElementById("new-message");
const messageDisplay = document.getElementById("new-message-display");
const chatList = document.querySelector(".chatbox-messages");
const createGroup = document.getElementById("create-group-btn");
const groupList = document.getElementById("group-list");
const multimediaInput = document.getElementById("multimedia");
const addMemberBtn = document.getElementById("add-member");
const logOut = document.getElementById("logout-btn");
const username = document.getElementById("current-user");
const userimage = document.getElementById("userimage");
const showMemberBtn = document.getElementById("show-members");
const membersContainer = document.querySelector(".members-container");
const memberListUl = document.querySelector(".members-list");
const chatbox = document.querySelector(".chatbox");
const groupContainer = document.querySelector(".group-container");
const sendBtn = document.querySelector("#send-btn");
const loader = document.getElementById("loader");

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}
// showLoader();

var socket = io();
socket.on("connect", () => {
  console.log(`you are connected with ${socket.id}`);
});

showMemberBtn.addEventListener("click", async () => {
  membersContainer.classList.toggle("show");
  groupContainer.classList.toggle("resized");
  chatbox.classList.toggle("resized");
  if (membersContainer.classList.contains("show")) {
    groupContainer.style.width = "calc(30% - 50px)";
    chatbox.style.width = "calc(70% - 250px)";
  } else {
    groupContainer.style.width = "30%";
    chatbox.style.width = "70%";
  }
  const activeGroup = localStorage.getItem("activeGroup");
  fetchAndShowMembers(activeGroup);
});

createGroup.addEventListener("click", () => {
  window.location.href = "addGroup.html";
});
addMemberBtn.addEventListener("click", () => {
  window.location.href = "addMember.html";
});
groupList.addEventListener("click", (e) => {
  let groupId;
  if (e.target.nodeName == "BUTTON") {
    groupId = e.target.parentElement.id;
    return deleteGroup(groupId);
  }
  if (e.target.nodeName == "LI") {
    groupId = e.target.id;
    localStorage.setItem("activeGroup", `${groupId}`);
    socket.emit("join room", groupId);
    socket.on("joined", (room) => {
      // console.log(`you have joined ${room}`);
      fetchAndShowChat(groupId);
    });
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    userimage.src = localStorage.getItem("userpic");
    username.textContent = localStorage.getItem("username");
    displayGroupOnLoad();
  } catch (err) {
    console.log(err);
  }
});

async function sendData(e) {
  try {
    e.preventDefault();
    showLoader();
    const groupId = localStorage.getItem("activeGroup");
    const token = localStorage.getItem("token");

    let file = multimediaInput.files[0];
    const formData = new FormData();
    formData.append("image", file);
    formData.append("message", messageInput.value);
    formData.append("groupId", groupId);

    const serverresponse = await axios.post(
      "http://localhost:3000/chat/sendmessage",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: token,
        },
      }
    );
    // console.log(serverresponse);
    if (serverresponse.status === 200) {
      hideLoader();
      multimediaInput.value = null;
      imageurl = "";
      messageInput.value = "";
      socket.emit("new message", serverresponse);
    }
  } catch (error) {
    hideLoader();
    console.log(error);
  }
}
socket.on("message recieved", (message) => {
  let msg = message.data.message;
  // console.log(msg);
  updateChatList(msg.message, msg.from, msg.file);
  scrolltoBottom();
});

function updateChatList(message, from, file) {
  const newMessageEl = document.createElement("div");
  if (from === userimage.src) {
    newMessageEl.classList.add("chatbox-message", "sent");
    const userpic = localStorage.getItem("userpic");
    if (file === null) {
      newMessageEl.innerHTML = `
      <div class="msg-to">
      <img src=${userpic} width="35px" height="35px" alt="" id="userimage" />
      <p>${message}</p>
          </div>
    `;
    } else {
      newMessageEl.innerHTML = `
      <div class="msg-to">
      <img src=${userpic} width="35px" height="35px" alt="" id="userimage" />
      <p>${message}</p>
          </div>
        <a href=${file} target="_blank">${file}</a>
    `;
    }
  } else {
    newMessageEl.classList.add("chatbox-message");
    if (file === null) {
      newMessageEl.innerHTML = `
      <div class="msg-from">
        <img src=${from} width="35px" height="35px" alt="" id="userimage" />
        <p>${message}</p>
        </div>
    `;
    } else {
      newMessageEl.innerHTML = `
        <div class="msg-from">
        <img src=${from} width="35px" height="35px" alt="" id="userimage" />
        <p >${message}</p>
          </div>
        <a href=${file} target="_blank">${file}</a>
    `;
    }
  }
  chatList.appendChild(newMessageEl);
}

async function fetchAndShowChat(groupId) {
  console.log("fetchgroupchat", groupId);
  let oldText = JSON.parse(localStorage.getItem("messages"));
  let lastMsgId = localStorage.getItem("lastChatId");
  if (!oldText || oldText.length === 0) {
    oldText = [];
    lastMsgId = 0;
  } else {
    lastMsgId = oldText[oldText.length - 1].id;
  }

  const token = localStorage.getItem("token");
  const response = await axios.get(
    `http://localhost:3000/chat/fetchchat/${lastMsgId}`,
    { headers: { authorization: token } }
  );
  if (response.status == 200) {
    const newMsg = response.data.chat;

    let msg = oldText.concat(newMsg);
    // console.log(msg);
    if (msg.length > 20) {
      msg = msg.slice(msg.length - 20, msg.length);
    }
    localStorage.setItem("messages", JSON.stringify(msg));
    chatList.innerHTML = "";
    const msgToShow = msg.filter((item) => item.groupId == groupId);
    msgToShow.forEach((element) => {
      updateChatList(element.message, element.from, element?.file);
    });
    scrolltoBottom();
  }
}
function scrolltoBottom() {
  const chatMessagesElement = document.querySelector(".chatbox-messages");
  chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

async function displayGroupOnLoad() {
  try {
    const token = localStorage.getItem("token");
    const serverResponse = await axios.get(
      `http://localhost:3000/groups/getAllGroups`,
      { headers: { authorization: token } }
    );

    groupList.innerHTML = "";

    const groupName = serverResponse.data.groups;
    if (groupName) {
      groupName.forEach((group) => {
        groupList.innerHTML += `
             <li id=${group.id}>${group.name}<button class="del btn-small">X</button></li>
             `;
      });
    }
  } catch (error) {
    console.log(error);
  }
}

logOut.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("messages");
  localStorage.removeItem("activeGroup");
  localStorage.removeItem("username");
  window.location.href = "login.html";
});
async function deleteGroup(groupId) {
  try {
    console.log(groupId);
    const token = localStorage.getItem("token");
    const deleteResponse = await axios.delete(
      `http://localhost:3000/groups/deletegroup/${groupId}`,
      { headers: { authorization: token } }
    );
    alert(deleteResponse.data.message);
    if (deleteResponse.data.success == "true") {
      displayGroupOnLoad();
    }
  } catch (error) {
    console.log(error);
  }
}
async function fetchAndShowMembers(activeGroup) {
  try {
    const token = localStorage.getItem("token");
    const getMembersResponse = await axios.get(
      `http://localhost:3000/admin/getAllMembers/${activeGroup}`,
      { headers: { authorization: token } }
    );
    // console.log(getMembersResponse.data.members);
    updateMemberList(getMembersResponse.data.members);
  } catch (error) {
    console.log(err);
  }
}
function updateMemberList(members) {
  memberListUl.addEventListener("click", (e) => handleMembers(e));
  memberListUl.innerHTML = "";
  members.forEach((member) => {
    if (member.isAdmin) {
      memberListUl.innerHTML += `<li class="admin"><b>Admin</b>${member.dataValues.name}
                    <div class="edit-box">
                    <button class="rmadminbtn" id="${member.dataValues.id}">Remove Admin</button>
                    <button class="rmuserbtn" id="${member.dataValues.id}">Remove User</button>
                    </div></li>`;
    } else {
      memberListUl.innerHTML += `<li class="member">
                    ${member.dataValues.name}
                    <div class="edit-box">
                    <button class="makeadminbtn" id="${member.dataValues.id}">Make Admin</button>
                    <button class="rmuserbtn" id="${member.dataValues.id}">Remove User</button>
                    </div>
                </li>`;
    }
  });
}
function handleMembers(e) {
  let userId = e.target.id;
  let name = e.target.className;
  let token = localStorage.getItem("token");
  let groupID = localStorage.getItem("activeGroup");
  // console.log(name, id);
  if (name == "makeadminbtn") {
    // console.log(userId, groupID);
    makeAdmin(userId, token, groupID);
  }
  if (name == "rmadminbtn") {
    // console.log(userId, groupID);
    removeAdmin(userId, token, groupID);
  }
  if (name == "rmuserbtn") {
    // console.log(userId, groupID);
    removeUser(userId, token, groupID);
  }
}
async function makeAdmin(userId, token, groupId) {
  console.log(userId, groupId);
  try {
    let res = await axios.post(
      "http://localhost:3000/admin/makeAdmin",
      {
        groupId,
        userId,
      },
      { headers: { authorization: token } }
    );
    console.log(res);
    if (res.status == 200) {
      fetchAndShowMembers(groupId);
    }
    if (res.status == 403) {
      alert("permission denied");
    }
  } catch (error) {
    console.log(error);
  }
}
async function removeAdmin(userId, token, groupId) {
  try {
    const removeAdminResponse = await axios.post(
      "http://localhost:3000/admin/removeAdmin",
      {
        userId: userId,
        groupId: groupId,
      },
      { headers: { authorization: token } }
    );
    // console.log(removeAdminResponse);
    if (removeAdminResponse.status == 200) {
      fetchAndShowMembers(groupId);
    }
  } catch (error) {
    console.log(error);
  }
}
async function removeUser(userId, token, groupId) {
  try {
    const removeUserResponse = await axios.post(
      "http://localhost:3000/admin/removeUser",
      {
        userId: userId,
        groupId: groupId,
      },
      { headers: { authorization: token } }
    );
    // console.log(removeUserResponse);
    if (removeUserResponse.status == 200) {
      fetchAndShowMembers(groupId);
    }
  } catch (error) {
    console.log(error);
  }
}
