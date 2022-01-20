import request from "supertest";
import api from "~/api/api";
import UserModel from "~/api/models/user.model";
import {connectMongoose} from "~/api/middleware/connectMongoose.middleware";

describe("Users routes", () => {
  it('should create a user', async () => {
    await connectMongoose();

    await UserModel.deleteOne({ email: "test@test.com" });

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(201);

    const user = await UserModel.findOne({ email: "test@test.com" });
    expect(user).toBeDefined();
  });

  it('should not create a user with an existing email', async () => {
    await connectMongoose();

    await UserModel.deleteOne({ email: "test@test.com" });

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(201);

    const response2 = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response2.status).toBe(409);
  });

  it('should return a 400 Bad Request if the email is not valid', async () => {
    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test",
        password: "Test1234.",
      });

    expect(response.status).toBe(400);
  });

  it('should return a 400 Bad Request if the password is not valid', async () => {
    await connectMongoose();

    await UserModel.deleteOne({ email: "test@test.com" });

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test",
      });

    expect(response.status).toBe(400);
  });

  it('should return a 400 Bad Request if the email is not provided', async () => {
    const response = await request(api.handler)
      .post("/users")
      .send({
        password: "Test1234.",
      });

    expect(response.status).toBe(400);
  });

  it('should return a 400 Bad Request if the password is not provided', async () => {
    await connectMongoose();

    await UserModel.deleteOne({ email: "test@test.com" });

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
      });

    expect(response.status).toBe(400);
  });
});
