import mongoose from "mongoose";
import {IFile} from "~/api/models/file.model";

export interface IUser extends mongoose.Document {
  _id: string;
  email: string;
  password: string;
  token?: string;
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
  token: {
    type: String,
    unique: true,
  },
  files: [
    {
      type: String,
      ref: "File",
    },
  ],
});

export default mongoose.model<IUser>("User", userSchema);
