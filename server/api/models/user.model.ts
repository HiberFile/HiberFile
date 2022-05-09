import mongoose from "mongoose";
import {IFile} from "./../models/file.model";

export interface IToken extends mongoose.Document {
  token: string;
  expiresAt: Date;
}

export interface IWebhook extends mongoose.Document {
  url: string;
  events: ('new-upload' | 'upload-completed' | 'file-downloaded')[];
}

export interface IUser extends mongoose.Document {
  _id: string;
  email: string;
  password: string;
  tokens: IToken[];
  webhooks: IWebhook[];
  files: IFile[];
}

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const webhookSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  events: {
    type: [String],
    required: true,
  },
});

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
    type: tokenSchema,
    default: [],
  }],
  webhooks: [{
    type: webhookSchema,
    default: [],
  }],
  files: [
    {
      type: String,
      ref: "File",
    },
  ],
});

const TokenModel = mongoose.models.Token || mongoose.model<IToken>("Token", tokenSchema);
const WebhookModel = mongoose.models.Webhook || mongoose.model<IWebhook>("Webhook", webhookSchema);

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export {TokenModel, WebhookModel}
