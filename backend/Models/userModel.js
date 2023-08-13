const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    pic: {type: String, default: 
    "https://res.cloudinary.com/dh5t9kdow/image/upload/v1691950949/user_oiawrp.jpg"},
},
{
    timestamps: true
});

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.pre('save', async function(next){
    if(!this.isModified){
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})
const User = mongoose.model("User", userSchema);
module.exports = User;