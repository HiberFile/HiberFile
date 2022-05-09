import request from "supertest";
import bcrypt from "bcrypt";

import api from "~/api/api";
import {connectMongoose} from "~/api/middleware/connectMongoose.middleware";
import UserModel from "~/api/models/user.model";

describe("api/routes/files", () => {
  it('should create a file and get it', async () => {
    const postRes = await request(api.handler)
      .post("/files")
      .send({
        name: "test.txt"
      });

    const postData = postRes.body.data;

    expect(postRes.status).toBe(200);
    expect(postData.file.name).toBe("test.txt");
    expect(postData.file.id).toBeDefined();

    const getRes = await request(api.handler)
      .get(`/files/${postData.file.id}`);

    const getData = getRes.body.data;

    expect(getRes.status).toBe(200);
    expect(getData.file.name).toBe("test.txt");
    expect(getData.file.id).toBeDefined();
    expect(getData.file.id).toBe(postData.file.id);
  });

  it('should create a file with password and get it', async () => {
    const postRes = await request(api.handler)
      .post("/files")
      .send({
        name: "test.txt",
        password: "test"
      });

    const postData = postRes.body.data;

    expect(postRes.status).toBe(200);
    expect(postData.file.name).toBe("test.txt");
    expect(postData.file.id).toBeDefined();

    const getRes = await request(api.handler)
      .get(`/files/${postData.file.id}?password=test`);

    const getData = getRes.body.data;

    expect(getRes.status).toBe(200);
    expect(getData.file.name).toBe("test.txt");
    expect(getData.file.id).toBeDefined();
    expect(getData.file.id).toBe(postData.file.id);
  });

  it('should create a file with password and get it with wrong password', async () => {
    const postRes = await request(api.handler)
      .post("/files")
      .send({
        name: "test.txt",
        password: "test"
      });

    const postData = postRes.body.data;

    expect(postRes.status).toBe(200);
    expect(postData.file.name).toBe("test.txt");
    expect(postData.file.id).toBeDefined();

    const getRes = await request(api.handler)
      .get(`/files/${postData.file.id}?password=wrong`);

    expect(getRes.status).toBe(401);
  });

  it('should create a private file associated to a user and get it', async () => {
    await connectMongoose();

    await UserModel.deleteOne({ email: "test@test.com" });

    const user = new UserModel({
      email: "test@test.com",
      password: await bcrypt.hash("test", 10),
    });

    await user.save();

    const authRes = await request(api.handler)
      .post(`/users/${user.id}/tokens?type=jwt`)
      .send({
        email: "test@test.com",
        password: "test"
      });

    const postRes = await request(api.handler)
      .post("/files")
      .set("Authorization", `jwt ${authRes.body.data.token.token}`)
      .send({
        name: "test.txt",
        private: true
      });

    const postData = postRes.body.data;

    expect(postRes.status).toBe(200);
    expect(postData.file.name).toBe("test.txt");
    expect(postData.file.id).toBeDefined();

    const getRes = await request(api.handler)
      .get(`/files/${postData.file.id}`)
      .set("Authorization", `jwt ${authRes.body.data.token.token}`)
      .send();

    const getData = getRes.body.data;

    expect(getRes.status).toBe(200);
    expect(getData.file.name).toBe("test.txt");
    expect(getData.file.id).toBeDefined();
    expect(getData.file.id).toBe(postData.file.id);
  });

  it('should create a private file associated to a user and should not be able to get it without being logged in', async () => {
    await connectMongoose();

    await UserModel.deleteOne({ email: "test@test.com" });

    const user = new UserModel({
      email: "test@test.com",
      password: await bcrypt.hash("test", 10),
    });

    await user.save();

    const authRes = await request(api.handler)
      .post(`/users/${user.id}/tokens?type=jwt`)
      .send({
        email: "test@test.com",
        password: "test"
      });

    const postRes = await request(api.handler)
      .post("/files")
      .set("Authorization", `jwt ${authRes.body.data.token.token}`)
      .send({
        name: "test.txt",
        private: true
      });

    const postData = postRes.body.data;

    expect(postRes.status).toBe(200);
    expect(postData.file.name).toBe("test.txt");
    expect(postData.file.id).toBeDefined();

    const getRes = await request(api.handler)
      .get(`/files/${postData.file.id}`)
      .send();

    expect(getRes.status).toBe(401);
  });
});
