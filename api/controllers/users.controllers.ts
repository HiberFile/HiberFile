import crypto from "crypto";
import Koa from 'koa';
import joi from 'joi';
import bcrypt from "bcrypt";
import moment from "moment";
import jwt from "jsonwebtoken";

import UserModel, {IUser, TokenModel, WebhookModel} from "~/api/models/user.model";

const { JWT_SECRET } = process.env;

require('dotenv').config();

export default class UsersControllers {
  public static async createUser(ctx: Koa.Context) {
    if (ctx.state.user) {
      ctx.throw(409, 'User already exists');
      return;
    }

    const bodySchema = joi.object<{
      email: string,
      password: string,
    }>().keys({
      email: joi.string().email().required(),
      password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-.]).{8,}$/).required()
    });

    const {error, value: body} = bodySchema.validate(ctx.request.body);

    if (error) {
      ctx.throw(400, error);
      return;
    }

    const {email, password} = body!;

    const user = await UserModel.findOne({email});

    if (user) {
      ctx.throw(409, 'User already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      email,
      password: hashedPassword
    });

    await newUser.save();

    ctx.body = {
      data: {
        user: {
          id: newUser.id,
        },
      },
      success: true,
      message: 'User created',
    };
  }

  public static getTokens(ctx: Koa.Context) {
    const user = ctx.state.user;

    if (!user) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    const paramsSchema = joi.object<{
      userId: string,
    }>().keys({
      userId: joi.string().required()
    });

    const {error: paramsValidationError, value: params} = paramsSchema.validate(ctx.params);

    if (paramsValidationError) {
      ctx.throw(400, paramsValidationError);
      return;
    }

    if (user.id !== params!.userId) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    ctx.body = {
      data: {
        tokens: user.tokens,
      },
      success: true,
      message: 'Tokens fetched',
    };
  }

  public static async createToken(ctx: Koa.Context) {
    const user = ctx.state.user;

    if (!user) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    const paramsSchema = joi.object<{
      userId: string,
    }>().keys({
      userId: joi.string().required()
    });

    const {error: paramsValidationError, value: params} = paramsSchema.validate(ctx.params);

    if (paramsValidationError) {
      ctx.throw(400, paramsValidationError);
      return;
    }

    if (user.id !== params!.userId) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    const querySchema = joi.object<{
      type: 'bearer' | 'jwt',
    }>().keys({
      type: joi.string().valid('bearer', 'jwt').default('bearer')
    });

    const {error: queryValidationError, value: query} = querySchema.validate(ctx.query);

    if (queryValidationError) {
      ctx.throw(400, queryValidationError);
      return;
    }

    const {type: tokenType} = query!;

    if (tokenType === 'bearer') {
      if (!process.env.HF_MAX_USER_TOKENS ||
        (process.env.HF_MAX_USER_TOKENS && user.tokens.length >= parseInt(process.env.HF_MAX_USER_TOKENS))) {
        ctx.throw(400, 'Max tokens reached');
        return;
      }

      const bodySchema = joi.object<{
        expiresAt?: Date,
      }>().keys({
        expiresAt: joi.date().optional(),
      })

      const {error: bodyValidationError, value: body} = bodySchema.validate(ctx.request.body);

      if (bodyValidationError) {
        ctx.throw(400, bodyValidationError);
        return;
      }

      const {expiresAt} = body!;

      const token = crypto.randomBytes(64).toString('base64');

      const newToken = new TokenModel({
        token,
        expiresAt: expiresAt || moment('9999-12-31', 'YYYY-MM-DD').toDate()
      });

      user.tokens.push(newToken);

      await user.save();

      ctx.body = {
        data: {
          token: newToken,
        },
        success: true,
        message: 'Token created',
      };
    } else if (tokenType === 'jwt') {
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }

      const jwtToken = jwt.sign(user.toObject(), JWT_SECRET, {expiresIn: '1h'});

      ctx.body = {
        data: {
          token: {
            token: jwtToken,
            expiresAt: moment().add(1, 'h').toDate()
          },
        },
        success: true,
        message: 'Token created',
      };
    } else {
      ctx.throw(400, 'Invalid token type');
    }
  }

  public static async deleteToken(ctx: Koa.Context) {
    const user = ctx.state.user;

    if (!user) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    const paramsSchema = joi.object<{
      userId: string,
      tokenId: string,
    }>().keys({
      userId: joi.string().required(),
      tokenId: joi.string().required()
    });

    const {error: paramsValidationError, value: params} = paramsSchema.validate(ctx.params);

    if (paramsValidationError) {
      ctx.throw(400, paramsValidationError);
      return;
    }

    if (user.id !== params!.userId) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    const token = user.tokens.find(t => t.id === params!.tokenId);

    if (!token) {
      ctx.throw(404, 'Token not found');
      return;
    }

    user.tokens = user.tokens.filter(t => t.id !== params!.tokenId);

    await user.save();

    ctx.body = {
      success: true,
      message: 'Token deleted',
    };
  }

  public static getWebhooks(ctx: Koa.Context) {
    const user = ctx.state.user;

    if (!user) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    const paramsSchema = joi.object<{
      userId: string,
    }>().keys({
      userId: joi.string().required()
    });

    const {error: paramsValidationError, value: params} = paramsSchema.validate(ctx.params);

    if (paramsValidationError) {
      ctx.throw(400, paramsValidationError);
      return;
    }

    if (user.id !== params!.userId) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    ctx.body = {
      data: {
        webhooks: user.webhooks,
      },
      success: true,
      message: 'Webhooks fetched',
    };
  }

  public static async createWebhook(ctx: Koa.Context) {
    const user = ctx.state.user;

    if (!user) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    const paramsSchema = joi.object<{
      userId: string,
    }>().keys({
      userId: joi.string().required()
    });

    const {error: paramsValidationError, value: params} = paramsSchema.validate(ctx.params);

    if (paramsValidationError) {
      ctx.throw(400, paramsValidationError);
      return;
    }

    if (user.id !== params!.userId) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    const bodySchema = joi.object<{
      url: string,
      events: IUser['webhooks'][number]['events'],
    }>().keys({
      url: joi.string().uri().required(),
      events: joi.array().items(joi.string().valid('new-upload', 'upload-completed', 'file-downloaded')).required(),
    });

    const {error: bodyValidationError, value: body} = bodySchema.validate(ctx.request.body);

    if (bodyValidationError) {
      ctx.throw(400, bodyValidationError);
      return;
    }

    const {url, events} = body!;

    const webhook = new WebhookModel({ url, events });

    user.webhooks.push(webhook);

    await user.save();

    ctx.body = {
      data: {
        webhook,
      },
      success: true,
      message: 'Webhook created',
    };
  }

  public static async deleteWebhook(ctx: Koa.Context) {
    const user = ctx.state.user;

    if (!user) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    const paramsSchema = joi.object<{
      userId: string,
      webhookId: string,
    }>().keys({
      userId: joi.string().required(),
      webhookId: joi.string().required()
    });

    const {error: paramsValidationError, value: params} = paramsSchema.validate(ctx.params);

    if (paramsValidationError) {
      ctx.throw(400, paramsValidationError);
      return;
    }

    if (user.id !== params!.userId) {
      ctx.throw(401, 'Unauthorized');
      return;
    }

    const webhook = user.webhooks.find(w => w.id === params!.webhookId);

    if (!webhook) {
      ctx.throw(404, 'Webhook not found');
      return;
    }

    user.webhooks = user.webhooks.filter(w => w.id !== params!.webhookId);

    await user.save();

    ctx.body = {
      data: {
        webhook,
      },
      success: true,
      message: 'Webhook deleted',
    };
  }
}
