import koa from 'koa';
import joi from 'joi';
import bcrypt from "bcrypt";
import UserModel from "~/api/models/user.model";

export default class UsersControllers {
  public static async createUser(ctx: koa.Context) {
    const bodySchema = joi.object().keys({
      email: joi.string().email().required(),
      password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-.]).{8,}$/).required()
    });

    const {error, value: body} = bodySchema.validate(ctx.request.body);

    if (error) {
      ctx.throw(400, error);
      return;
    }

    const {email, password} = body;

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

    ctx.status = 201;
  }
}
