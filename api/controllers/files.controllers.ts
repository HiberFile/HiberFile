import Koa from 'koa';
import joi from 'joi';
import {HydratedDocument} from "mongoose";
import bcrypt from "bcrypt";

import FileModel, {IFile} from './../models/file.model';
import generateId from "~/utils/generateRandomString";

export default class FilesControllers {
  public static async getFile(ctx: Koa.Context) {
    const user = ctx.state.user;

    const paramsSchema = joi.object<{
      id: string;
    }>().keys({
      id: joi.string().required().length(8).alphanum(),
    });

    const {error, value: params} = paramsSchema.validate(ctx.params);

    if (error) {
      ctx.throw(400, error);
      return;
    }

    const {id: fileId} = params!;

    const querySchema = joi.object<{
      password?: string;
    }>().keys({
      password: joi.string().optional(),
    });

    const {error: queryError, value: query} = querySchema.validate(ctx.query);

    if (queryError) {
      ctx.throw(400, queryError);
      return;
    }

    const {password} = query!;

    const file = await FileModel.findById(fileId);

    if (!file) {
      ctx.throw(404, 'File not found');
      return;
    }

    if (file.password && password) {
      const isValid = await bcrypt.compare(password, file.password);

      if (!isValid) {
        ctx.throw(401, 'Invalid password');
        return;
      }
    } else if (file.password) {
      ctx.throw(401, 'Password required');
      return;
    }

    if (file.private && !user) {
      ctx.throw(401, 'User not authorized');
      return;
    } else if (file.private && user) {
      if (file.user !== user.id) {
        ctx.throw(401, 'User not authorized');
        return;
      }
    }

    ctx.body = {
      data: {
        file: {
          ...file.toObject(),
          id: file._id,
        }
      },
      success: true,
      message: 'File found',
    };
  }

  public static async createFile(ctx: Koa.Context) {
    const user = ctx.state.user;

    const bodySchema = joi.object<{
      name: string;
      password?: string;
      private?: boolean;
    }>().keys({
      name: joi.string().required(),
      password: joi.string().optional(),
      private: joi.boolean().optional(),
    });

    const {error, value: body} = bodySchema.validate(ctx.request.body);

    if (error) {
      ctx.throw(400, error);
      return;
    }

    const {name: fileName, password, private: filePrivate} = body!;

    let id: string;

    do {
      id = generateId(8);
    } while (await FileModel.findById(id));

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const file: HydratedDocument<IFile> = new FileModel({
      _id: id,
      name: fileName,
      password: hashedPassword,
      user: user?._id,
      private: filePrivate,
    });

    await file.save();

    ctx.body = {
      data: {
        file: {
          ...file.toObject(),
          id: file._id,
        }
      },
      success: true,
      message: 'File created',
    };
  }
}
