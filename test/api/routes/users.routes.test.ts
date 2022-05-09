import request from "supertest";
import moment from "moment";

import api from "~/api/api";
import UserModel from "~/api/models/user.model";
import {connectMongoose} from "~/api/middleware/connectMongoose.middleware";

describe("api/routes/users", () => {
  it('should create a user', async () => {
    await connectMongoose();

    await UserModel.deleteOne({ email: "test@test.com" });

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user.id).toBeDefined();

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

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response2.status).toBe(409);
  });

  it('should create a user and a bearer token', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const expiresAt = moment().add(1, "day").toDate();

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens`)
      .send({
        expiresAt,
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response2.status).toBe(200);
    expect(response2.body.data.token).toBeDefined();
    expect(response2.body.data.token.token).toBeDefined();
    expect(typeof response2.body.data.token.token).toBe("string");
    expect(response2.body.data.token.token.length).toBeGreaterThan(0);
    expect(response2.body.data.token.expiresAt).toBeDefined();
    expect(moment(response2.body.data.token.expiresAt).toDate().getTime()).toEqual(expiresAt.getTime());
  });

  it('should create a user and a jwt token', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens?type=jwt`)
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response2.status).toBe(200);
    expect(response2.body.data.token).toBeDefined();
    expect(response2.body.data.token.token).toBeDefined();
    expect(typeof response2.body.data.token.token).toBe("string");
    expect(response2.body.data.token.token.length).toBeGreaterThan(0);
    expect(response2.body.data.token.expiresAt).toBeDefined();
  });

  it('should create a user but not a bearer token if not logged in', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens`);

    expect(response2.status).toBe(401);
  });

  it('should create a user but not a jwt token if not logged in', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens?type=jwt`);

    expect(response2.status).toBe(401);
  });

  it('should create a user with tokens and return them', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens`)
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response2.status).toBe(200);

    const response3 = await request(api.handler)
      .get(`/users/${response.body.data.user.id}/tokens`)
      .set("Authorization", `Bearer ${response2.body.data.token.token}`)
      .send();

    expect(response3.status).toBe(200);
    expect(response3.body.data.tokens).toBeDefined();
    expect(response3.body.data.tokens.length).toBe(1);
  });

  it('should create a user but not be able to get tokens if not logged in', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .get(`/users/${response.body.data.user.id}/tokens`)

    expect(response2.status).toBe(401);
  });

  it('should create a user with a token and delete it', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens`)
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response2.status).toBe(200);

    const response3 = await request(api.handler)
      .delete(`/users/${response.body.data.user.id}/tokens/${response2.body.data.token._id}`)
      .set("Authorization", `Bearer ${response2.body.data.token.token}`)
      .send();

    expect(response3.status).toBe(200);

    const response4 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens?type=jwt`)
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response4.status).toBe(200);

    const response5 = await request(api.handler)
      .get(`/users/${response.body.data.user.id}/tokens`)
      .set("Authorization", `jwt ${response4.body.data.token.token}`)
      .send();

    expect(response5.status).toBe(200);
    expect(response5.body.data.tokens).toBeDefined();
    expect(response5.body.data.tokens.length).toBe(0);
  });

  it('should create a user with a token but not be able to delete it if not logged in', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens`)
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response2.status).toBe(200);

    const response3 = await request(api.handler)
      .delete(`/users/${response.body.data.user.id}/tokens/${response2.body.data.token._id}`)
      .send();

    expect(response3.status).toBe(401);
  });

  it('should create a user, create a webhook and return it', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens?type=jwt`)
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response2.status).toBe(200);

    const response3 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/webhooks`)
      .set("Authorization", `jwt ${response2.body.data.token.token}`)
      .send({
        url: "https://test.com/test",
        events: ["new-upload"],
      });

    expect(response3.status).toBe(200);

    const response4 = await request(api.handler)
      .get(`/users/${response.body.data.user.id}/webhooks`)
      .set("Authorization", `jwt ${response2.body.data.token.token}`)
      .send();

    expect(response4.status).toBe(200);
    expect(response4.body.data.webhooks).toBeDefined();
    expect(response4.body.data.webhooks.length).toBe(1);
  });

  it('should create a user but not be able to create a webhook if not logged in', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/webhooks`)
      .send({
        url: "https://test.com/test",
        events: ["new-upload"],
      });

    expect(response2.status).toBe(401);
  });

  it('should create a user, create a webhook and delete it', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens?type=jwt`)
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response2.status).toBe(200);

    const response3 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/webhooks`)
      .set("Authorization", `jwt ${response2.body.data.token.token}`)
      .send({
        url: "https://test.com/test",
        events: ["new-upload"],
      });

    expect(response3.status).toBe(200);

    const response4 = await request(api.handler)
      .delete(`/users/${response.body.data.user.id}/webhooks/${response3.body.data.webhook._id}`)
      .set("Authorization", `jwt ${response2.body.data.token.token}`)
      .send();

    expect(response4.status).toBe(200);

    const response5 = await request(api.handler)
      .get(`/users/${response.body.data.user.id}/webhooks`)
      .set("Authorization", `jwt ${response2.body.data.token.token}`)
      .send();

    expect(response5.status).toBe(200);
    expect(response5.body.data.webhooks).toBeDefined();
    expect(response5.body.data.webhooks.length).toBe(0);
  });

  it('should create a user, create a webhook but not be able to delete it if not logged in', async () => {
    await connectMongoose();

    await UserModel.deleteOne({email: "test@test.com"});

    const response = await request(api.handler)
      .post("/users")
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response.status).toBe(200);

    const response2 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/tokens?type=jwt`)
      .send({
        email: "test@test.com",
        password: "Test1234.",
      });

    expect(response2.status).toBe(200);

    const response3 = await request(api.handler)
      .post(`/users/${response.body.data.user.id}/webhooks`)
      .set("Authorization", `jwt ${response2.body.data.token.token}`)
      .send({
        url: "https://test.com/test",
        events: ["new-upload"],
      });

    expect(response3.status).toBe(200);

    const response4 = await request(api.handler)
      .delete(`/users/${response.body.data.user.id}/webhooks/${response3.body.data.webhook._id}`)
      .send();

    expect(response4.status).toBe(401);
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
