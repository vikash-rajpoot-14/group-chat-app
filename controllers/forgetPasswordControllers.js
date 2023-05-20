
const uuid = require("uuid")
const User = require("../models/user")
const Forgetpassword = require("../models/forgetPasswords")
const Sib = require("sib-api-v3-sdk")
const client = Sib.ApiClient.instance
require('dotenv').config()

const apiKey = client.authentications["api-key"]
apiKey.apiKey = process.env.SIB_API_KEY
const tranEmailApi = new Sib.TransactionalEmailsApi()
const bcrypt = require("bcrypt")

exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ where: { email: email } })
        console.log(user)
        if (user) {
            const id = uuid.v4()
            await user.createForgetpassword({ id, isActive: true })
            const sender = {
                email: "work.erpraveen@gmail.com",
                name: "Expense Traker Team"
            }
            const recievers = [{
                email: user.email,
            }]

            await tranEmailApi.sendTransacEmail({
                sender,
                to: recievers,
                subject: "Expense Tracker : OTP ",
                textContent: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`
            })
        }
        res.status(200).json({ res: "link to rest password has been sent to your email.!!" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: err })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        const forgetPasswordReq = await Forgetpassword.findOne({ where: { id: id, isActive: true } })
        if (forgetPasswordReq) {
            await forgetPasswordReq.update({ isActive: false })
            res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>
                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`)
            res.end()
        }
    } catch (err) {
        res.status(500).json({ err: err })
    }
}
exports.updatePassword = async (req, res) => {
    try {
        const { newpassword } = req.query
        const { resetpasswordid } = req.params
        const resetpasswordrequest = await Forgetpassword.findOne({ where: { id: resetpasswordid } })
        console.log(resetpasswordrequest.userId)
        const user = await User.findOne({ where: { id: resetpasswordrequest.userId } })

        if (user) {
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                    throw new Error(err);
                }
                bcrypt.hash(newpassword, salt, function (err, hash) {
                    if (err) {
                        throw new Error(err);
                    }
                    user.update({ password: hash }).then(() => {
                        res.status(201).json({ res: "password changed success!!" })
                    })
                })
            })
        } else {
            return res.status(404).json({ res: "no user found" })
        }
    } catch (err) {
        res.status(500).json({ err: err })
    }
}