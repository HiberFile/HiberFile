import koa from 'koa';
import joi from 'joi';
import {HydratedDocument} from "mongoose";

import FileModel, {IFile} from './../models/file.model';
import generateId from "~/utils/generateRandomString";

export default class FilesControllers {
  public static async getFile(ctx: koa.Context) {
    const paramsSchema = joi.object().keys({
      id: joi.string().required().length(8).alphanum(),
    });

    const {error, value: params} = paramsSchema.validate(ctx.params);

    if (error) {
      ctx.throw(400, error);
      return;
    }

    const file = await FileModel.findById(params.id);

    if (!file) {
      ctx.throw(404, 'File not found');
      return;
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

  public static async createFile(ctx: koa.Context) {
    const bodySchema = joi.object().keys({
      name: joi.string().required(),
    });

    const {error, value: body} = bodySchema.validate(ctx.request.body);

    if (error) {
      ctx.throw(400, error);
      return;
    }

    let id: string;

    do {
      id = generateId(8);
    } while (await FileModel.findById(id));

    const file: HydratedDocument<IFile> = new FileModel({
      _id: id,
      name: body.name,
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
