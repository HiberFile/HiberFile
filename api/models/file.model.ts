import mongoose from 'mongoose';
import moment from "moment";
import {IUser} from "~/api/models/user.model";

export interface IFile extends mongoose.Document {
  _id: string;
  name: string;
  createdAt: Date;
  expiresAt: Date;
  user: IUser;
}

const fileSchema = new mongoose.Schema<IFile>({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => {
      const now = new Date();
      return moment(now).add(1, 'days').toDate();
    },
  },
  user: {
    type: String,
    ref: "User",
  },
});

export default mongoose.model<IFile>('File', fileSchema);
