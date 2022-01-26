import mongoose from "mongoose";
import {IFile} from "~/api/models/file.model";

export interface IUser extends mongoose.Document {
  _id: string;
  email: string;
  password: string;
  tokens: {
    token: string;
    expiresAt: Date;
  }[];
  files: IFile[];
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  tokens: [{
    type: new mongoose.Schema({
      token: String,
      expiresAt: Date,
    }),
    default: [],
  }],
  files: [
    {
      type: String,
      ref: "File",
    },
  ],
});

export default mongoose.model<IUser>("User", userSchema);
