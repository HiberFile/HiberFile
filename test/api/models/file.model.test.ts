import moment from "moment";
import {HydratedDocument} from "mongoose";

import FileModel, {IFile} from "~/api/models/file.model";
import generateId from "~/utils/generateId";

describe("FileModel", () => {
  it("should be defined", () => {
    expect(FileModel).toBeDefined();
  });

  it('should create a file in the database and return it', async () => {
    let id: string;

    do {
      id = generateId(8);
    } while (await FileModel.findById(id));

    const expiresAt = moment(Date.now()).add(1, 'hour').toDate()
    const file: HydratedDocument<IFile> = new FileModel({
      _id: id,
      name: 'test',
      expiresAt,
    });

    await file.save();

    const foundFile = await FileModel.findById(id);

    expect(foundFile).toBeDefined();
    expect(foundFile!.name).toBe('test');
    expect(foundFile!._id).toBe(id);
    expect(foundFile!.createdAt).toBeDefined();
    expect(foundFile!.expiresAt).toBeDefined()
    expect(foundFile!.expiresAt.getTime()).toBe(expiresAt.getTime());
  });
});
