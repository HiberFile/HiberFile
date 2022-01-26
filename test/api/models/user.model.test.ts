import {HydratedDocument} from "mongoose";
import moment from "moment";

import UserModel, {IUser} from "~/api/models/user.model";
import generateId from "~/utils/generateId";
import FileModel, {IFile} from "~/api/models/file.model";
import {connectMongoose} from "~/api/middleware/connectMongoose.middleware";

describe('api/models/user', () => {
  it("should be defined", () => {
    expect(UserModel).toBeDefined();
  });

  it('should create a file user in the database and return it', async () => {
    await connectMongoose();

    await UserModel.deleteOne({
      email: 'test@test.com'
    })

    const user: HydratedDocument<IUser> = new UserModel({
      email: 'test@test.com',
      password: 'test-password123',
      token: 'test-token',
    });

    await user.save();

    const foundUser = await UserModel.findOne({email: 'test@test.com'});

    expect(foundUser).toBeDefined();
    expect(foundUser!.email).toBe('test@test.com');
    expect(foundUser!.password).toBe('test-password123');
    expect(foundUser!.token).toBe('test-token');
    expect(foundUser!.files.length).toBe(0);
  });

  it('should a user with files in the database and return it', async () => {
    await connectMongoose();

    await UserModel.deleteOne({
      email: 'test2@test.com'
    })

    const user: HydratedDocument<IUser> = new UserModel({
      email: 'test2@test.com',
      password: 'test-password123'
    });

    await user.save();

    const foundUser = await UserModel.findOne({email: 'test2@test.com'});

    expect(foundUser).toBeDefined();
    expect(foundUser!.files.length).toBe(0);
    expect(foundUser!.token).toBeUndefined();

    let fileId: string;

    do {
      fileId = generateId(8);
    } while (await FileModel.findById(fileId));

    const expiresAt = moment(Date.now()).add(1, 'hour').toDate()
    const file: HydratedDocument<IFile> = new FileModel({
      _id: fileId,
      name: 'test',
      expiresAt,
    });

    await file.save();

    foundUser!.files.push({ _id: file._id } as IFile);
    await foundUser!.save();

    const foundUser2 = await UserModel
      .findOne({email: 'test2@test.com'})
      .populate({
        path: 'files',
        model: 'File',
      });

    expect(foundUser2).toBeDefined();
    expect(foundUser2!.email).toBe('test2@test.com');
    expect(foundUser2!.password).toBe('test-password123');
    expect(foundUser2!.files.length).toBe(1);
    expect(foundUser2!.files[0].id).toBe(fileId);
    expect(foundUser2!.files[0].createdAt).toBeDefined();
    expect(foundUser2!.files[0].expiresAt).toBeDefined()
    expect(foundUser2!.files[0].expiresAt.getTime()).toBe(expiresAt.getTime());
  });

  it('should throw an error because the email is already used', async () => {
    await connectMongoose();

    await UserModel.deleteOne({
      email: 'test@test.com'
    });

    const user: HydratedDocument<IUser> = new UserModel({
      email: 'test@test.com',
      password: 'test'
    });

    await user.save();

    const user2: HydratedDocument<IUser> = new UserModel({
      email: 'test@test.com',
      password: 'test'
    });

    await expect(user2.save()).rejects.toThrow();
  });

  it('should throw an error because no email is provided', async () => {
    await connectMongoose();

    const user: HydratedDocument<IUser> = new UserModel({
      password: 'test'
    });

    await expect(user.save()).rejects.toThrow();
  });

  it('should throw an error because no password is provided', async () => {
    await connectMongoose();

    await UserModel.deleteOne({
      email: 'test@test.com'
    });

    const user: HydratedDocument<IUser> = new UserModel({
      email: 'test@test.com'
    });

    await expect(user.save()).rejects.toThrow();
  });
});
