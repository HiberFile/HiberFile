import mongoose from "mongoose";
import {connectMongoose} from "~/api/middleware/connectMongoose.middleware";

describe('connectMongoose', () => {
  it('should connect to mongoose', async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    expect(mongoose.connection.readyState).toBe(0);
    await connectMongoose();
    expect(mongoose.connection.readyState).toBe(1);
  });
});
