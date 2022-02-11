import request from "supertest";
import bcrypt from "bcrypt";
import api from "~/api/api";
import UserModel from "~/api/models/user.model";
import {connectMongoose} from "~/api/middleware/connectMongoose.middleware";

describe('api(passport-bearer-strategy)', () => {
  it('should authenticate with email/password, get a JWT token and authenticate with it', async () => {
    await connectMongoose();

    await UserModel.deleteOne({ email: "test@test.com" });

    const user = new UserModel({
      email: "test@test.com",
      password: await bcrypt.hash("test", 10),
    });

    await user.save();

    const response = await request(api.handler)
      .post(`/users/${user.id}/tokens?type=jwt`)
      .send({
        email: "test@test.com",
        password: "test"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.token.token).toBeDefined();

    const response2 = await request(api.handler)
      .get(`/users/${user.id}/tokens`)
      .set("Authorization", `jwt ${response.body.data.token.token}`);

    expect(response2.status).toBe(200);
  });

  it('should authenticate with email/password, get a Bearer token and authenticate with it', async () => {
    await connectMongoose();

    await UserModel.deleteOne({ email: "test@test.com" });

    const user = new UserModel({
      email: "test@test.com",
      password: await bcrypt.hash("test", 10),
    });

    await user.save();

    const response = await request(api.handler)
      .post(`/users/${user.id}/tokens`)
      .send({
        email: "test@test.com",
        password: "test"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.token.token).toBeDefined();

    const bearerToken = response.body.data.token.token;

    const response2 = await request(api.handler)
      .get(`/users/${user.id}/tokens`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response2.status).toBe(200);
    expect(response2.body.data.tokens.some((token: {
      token: string;
      expiresAt: string;
      _id: string;
    }) => token.token === bearerToken)).toBe(true);
  });
});
