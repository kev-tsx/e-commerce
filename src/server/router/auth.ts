import { trpc } from '../trpc';
import { prisma, Prisma, Role, UserStatus, User } from '../db';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { signUpSchema } from '../../common/validation/auth';
// import { z } from 'zod';
// import jwt from 'jsonwebtoken';
// import cookie from 'cookie';

const userSelect = Prisma.validator<Prisma.UserSelect>()({
  email: true, name: true, id: true, role: true, status: true,
});

type IUser = Omit<User, 'password' | 'createdAt' | 'updatedAt'>

export const authRouter = trpc.router({
    //? Register
    register: trpc.procedure
    .input(signUpSchema)
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (user) throw new TRPCError({ code: 'CONFLICT', message: 'Email address already in use' });
      // create user
      const createdUser = await prisma.user.create({
        data: {
          email: input.email.toLowerCase(),
          password: bcrypt.hashSync(input.password),
          name: input.name,
        },
        select: userSelect,
      });

      if (!createdUser) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User not created ---SERVER_ERROR---' });

      return createdUser;
    }),
  //? Login
  // login: trpc.procedure
  //   .input(z.object({
  //     email: z.string().min(1).email(),
  //     password: z.string().min(1),
  //   }))
  //   .mutation(async ({ input, ctx }) => {
  //     const user = await prisma.user.findUnique({
  //       where: { email: input.email },
  //     });

  //     if (!user) throw new TRPCError({
  //       code: 'NOT_FOUND',
  //       cause: 'email',
  //       message: 'There was a problem. We cannot find an account with that email address',
  //     });

  //     if (!bcrypt.compareSync(input.password, user.password!)) throw new TRPCError({
  //       code: 'UNAUTHORIZED',
  //       message: 'Your password is incorrect',
  //       cause: 'password'
  //     });

  //     // update user status to online
  //     const authed_user = await prisma.user.update({
  //       where: { email: input.email },
  //       data: { status: 'online' },
  //       select: userSelect,
  //     });

  //     // create json web token
  //     const token = jwt.sign({
  //       name: authed_user.name,
  //       email: authed_user.email,
  //       status: authed_user.status,
  //       role: authed_user.role,
  //       id: authed_user.id,
  //     }, `${process.env.JWT_SECRET_KEY}`, { expiresIn: '30d' });

  //     // create cookie serialized
  //     const serialized = cookie.serialize('tokenAuth', token, {
  //       httpOnly: true,
  //       maxAge: 1000 * 60 * 60 * 24 * 30,
  //       path: '/',
  //       sameSite: 'strict',
  //       secure: process.env.NODE_ENV === 'production',
  //     });

  //     ctx.res?.setHeader('Set-Cookie', serialized);

  //     return {...authed_user, token};
  //   }),
  //? Logout
  // logout: trpc.procedure.mutation(async ({ ctx }) => {
  //   const user = ctx.user;
  //   if (!user) return {};
  //   const token = ctx.req?.cookies.tokenAuth;
  //   if (!token) return {};
  //   const logoutUser = await prisma.user.update({
  //     where: { email: user.email },
  //     data: { status: 'offline' },
  //     select: userSelect,
  //   });
  //   try {
  //     jwt.verify(token, `${process.env.JWT_SECRET_KEY}`);
  //   } catch (err) {
  //     throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  //   }
  //   const serialized = cookie.serialize('tokenAuth', 'deleted', {
  //     maxAge: 0,
  //     httpOnly: true,
  //     path: '/',
  //     sameSite: 'strict',
  //     secure: process.env.NODE_ENV === 'production',
  //   });

  //   ctx.res?.setHeader('Set-Cookie', serialized);
  //   return logoutUser;
  // }),
  //? User
  // user: trpc.procedure
  //   .output(z.object({
  //     status: z.enum(['online', 'offline']),
  //     user: z.object({
  //       token: z.string(),
  //       email: z.string(),
  //       name: z.string(),
  //       status: z.enum(['online', 'offline']),
  //       role: z.enum(['admin', 'client']),
  //       id: z.string(),
  //     }).nullable()
  //   }))
  //   .query(({ ctx }) => {
  //     if (!ctx.user) return { user: null, status: 'offline' };
  //     return { user: { ...ctx.user }, status: 'online' };
  //   }),
});
