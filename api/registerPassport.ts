import crypto from "crypto";
import Koa from "koa";
import passport from "koa-passport";
import {Strategy as BearerStrategy} from "passport-http-bearer";
import {Strategy as LocalStrategy} from "passport-local";
import {ExtractJwt, Strategy as JwtStrategy} from "passport-jwt";
import bcrypt from "bcrypt";
import {Strategy as AnonymousStrategy} from "passport-anonymous";
import session from "koa-session";

import SessionModel from '~/api/models/session.model';
import UserModel, {IUser} from "~/api/models/user.model";

const JWT_SECRET = crypto.randomBytes(64).toString('base64');
process.env.JWT_SECRET = JWT_SECRET;

require('dotenv').config();

const {APP_SECRET} = process.env;

if (!APP_SECRET) {
    throw new Error('APP_SECRET must be defined');
}

passport.use(new BearerStrategy(
  async (token, done) => {
    const user = await UserModel.findOne({
      tokens: {
        $elemMatch: {token}
      }
    });

    if (!user) return done(null, false);

    return done(null, user);
  }
));

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    secretOrKey: JWT_SECRET
  },
  async (payload, done) => {
    const user = await UserModel.findById(payload._id);

    if (!user) return done(null, false);

    return done(null, user);
  }
));

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  async (req, email, password, done) => {
    const user = await UserModel.findOne({email});

    if (!user) return done(null, false, {message: 'Incorrect email.'});

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, {message: 'Incorrect password.'});

    if (!(req.method === 'POST' && req.url.split('/').pop() === 'users')) {
      if (req.body.email) delete req.body.email;
      if (req.body.password) delete req.body.password;
    }

    return done(null, user);
  }
));

passport.use(new AnonymousStrategy());

export default (app: Koa) => {
  app.keys = [APP_SECRET];
  app.use(session({
    store: {
      get(id, maxAge) {
        if (typeof maxAge === 'number') {
          return SessionModel.findOne({
            id,
            updatedAt: {
              $gte: new Date(Date.now() - maxAge)
            },
          });
        }

        return SessionModel.findOne({id});
      },
      async set(id, sess, _, data) {
        if (data.changed || data.rolling) {
          const record = { _id: id, data, updatedAt: new Date() };
          await SessionModel.findByIdAndUpdate(id, record, { upsert: true, safe: true });
        }

        return sess;
      },
      async destroy(id: string) {
        await SessionModel.deleteOne({ _id: id });
      }
    },
    externalKey: {
      get(ctx): string | undefined {
        const sessionId = ctx.headers['Session-Id'];

        if (typeof sessionId === 'string') return sessionId;
      },
      set(ctx, value) {
        ctx.headers['Session-Id'] = value;
      },
    }
  }, app));

  app.use(passport.initialize())
  app.use(passport.session())

  app.use(passport.authenticate([
    'bearer',
    'jwt',
    'local',
    'anonymous'
  ], {
    session: false
  }));
}

declare module 'koa' {
  interface Context {
    state: {
      user?: IUser
    }
  }
}
