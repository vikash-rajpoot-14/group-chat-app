const form = document.getElementById("forgotPassword")
const email = document.getElementById("email")

form.addEventListener("submit", resetPassword)


async function resetPassword(e) {
    try {
        e.preventDefault();
        const inputEmail = {
            email: email.value
        }
        const response = await axios.post("http://localhost:3000/password/forgotpassword", inputEmail)
        console.log(response)
    } catch (err) {
        console.log(err)
    }
}