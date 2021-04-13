//Import Schema and model
const {Schema, model} = require("../db/connection")

//The Game Schema
const Game = new Schema({
    text: String
})

//The User Schema
const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    games: [Game]
}, {timestamps: true})

//The User Model
const User = model("User", UserSchema)

//Export the User Model
module.exports = User