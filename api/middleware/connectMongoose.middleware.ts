import mongoose from "mongoose";
import Koa, {Context} from "koa";

require('dotenv').config();

if (!process.env.MONGO_URI || !process.env.MONGO_USERNAME || !process.env.MONGO_PASSWORD) {
  throw new Error("MONGO_URI, MONGO_USERNAME and MONGO_PASSWORD environment variables must be set");
}

const connectMongoose = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.MONGO_URI as string,
      {
        user: process.env.MONGO_USERNAME,
        pass: process.env.MONGO_PASSWORD,
      }
    );
  }
}

const connectMongooseMiddleware: Koa.Middleware = async (_: Context, next: Function) => {
  await connectMongoose();
  await next();
}

export default connectMongooseMiddleware;
export {connectMongoose};
