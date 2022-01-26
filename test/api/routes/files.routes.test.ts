import request from "supertest";
import api from "~/api/api";

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
});
