import mongoose from 'mongoose';
import moment from "moment";

import connectMongoose from "~/utils/connectMongoose";

connectMongoose();

export interface IFile extends mongoose.Document {
  _id: string;
  name: string;
  createdAt: Date;
  expiresAt: Date;
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
});

export default mongoose.model<IFile>('File', fileSchema);
