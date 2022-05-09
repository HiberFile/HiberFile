import mongoose from "mongoose";
import {IUser} from "./user.model";

export interface ISession extends mongoose.Document {
  _id: string;
  user: IUser;
  updatedAt: Date;
}

const sessionSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Session || mongoose.model<ISession>("Session", sessionSchema);
