import moment from "moment";
import {HydratedDocument} from "mongoose";

import FileModel, {IFile} from "~/api/models/file.model";
import generateId from "~/utils/generateId";
import {connectMongoose} from "~/api/middleware/connectMongoose.middleware";
import UserModel, {IUser} from "~/api/models/user.model";

describe("api/models/file", () => {
  it("should be defined", () => {
    expect(FileModel).toBeDefined();
  });

  it('should create a file in the database and return it', async () => {
    await connectMongoose();

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

  it('should create a file in the database, attach it to a user and return it', async () => {
    await connectMongoose();

    await UserModel.deleteOne({
      email: 'test@test.com'
    })

    const user: HydratedDocument<IUser> = new UserModel({
      email: 'test@test.com',
      password: 'test-password123'
    });

    await user.save();

    const foundUser = await UserModel.findOne({email: 'test@test.com'});

    expect(foundUser).toBeDefined();
    expect(foundUser!.files.length).toBe(0);

    let id: string;

    do {
      id = generateId(8);
    } while (await FileModel.findById(id));

    const expiresAt = moment(Date.now()).add(1, 'hour').toDate()
    const file: HydratedDocument<IFile> = new FileModel({
      _id: id,
      name: 'test',
      expiresAt,
      user: foundUser!._id
    });

    await file.save();

    const foundFile = await FileModel
      .findById(id)
      .populate({
        path: 'user',
        model: 'User'
      });

    expect(foundFile!.user).toBeDefined();
    expect(foundFile!.user.id).toBeDefined();
    expect(foundFile!.user.id).toBe(foundUser!.id);
  });
});
