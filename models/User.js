import mongoose from "mongoose";

const PartySchema = mongoose.Schema({
    _id: {
        type: String,
        require: true,
    },
    current: {
        type: String,
        enum: ["oro", "plata", "bronce", "none"],
        required: true,
    },
    last_set: {
        type: Number,
        require: true,
    },
});
export const Party = mongoose.model("Party", PartySchema);

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Party",
        require: true,
    },
    score: {
        type: Number,
        require: true,
    },
    last_set: {
        type: Date,
        require: true,
    },
});
export const User = mongoose.model("User", UserSchema);
