import koa from 'koa';
import { dbConnect } from './db/db-connect';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import { hashSync, compareSync } from 'bcryptjs';
import { User } from './db/userModel';
import { Organization } from './db/organizationModel';
import { Membership } from './db/membershipModel';
import jwt from 'jsonwebtoken';
import {CreateOrganizationRequest, DeleteMemberRequest, EmailRequest, getMembers, LeaveOrganizationRequest, LoginRequest, RegisterRequest, RoleChange, TRegisterResponse } from '@gdmn-cz/types';
import type { TLoginResponse } from '@gdmn-cz/types';
import mongoose from 'mongoose';
import { z } from 'zod';

dbConnect();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = new koa();

app.use(bodyParser());

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  ctx.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  await next();
});

const auth = async (ctx, next) => {
  try {
    //   get the token from the authorization header
    const token = await ctx.request.headers.authorization.split(" ")[1];

    //check if the token matches the supposed origin
    const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");

    // retrieve the user details of the logged in user
    const user = await decodedToken;

    // pass the the user down to the endpoints here
    ctx.request.user = user;

    // pass down functionality to the endpoint
    next();
    
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = {
      error: new Error("Invalid request!"),
    };
  }
};

const router = new Router();

router
  .post('/register', async (ctx) => {    
    try {
      const { email, password } = RegisterRequest.parse(ctx.request.body);
      let res: TRegisterResponse;
      try {
        const user = await User.findOne({ email });
  
        if (user) {
          res = {
            status: 'DUPLICATE_EMAIL',
            email
          }
        } else {
          const hashedPassword = hashSync(password, 10);
          const user = new User({
            email,
            password: hashedPassword
          });
          await user.save();
          res = {
            status: 'REGISTERED',
            email
          };  
        }
      } catch(error) {
        res = {
          status: 'ERROR',
          email
        }         
      }
      ctx.response.status = 200;
      ctx.response.body = res;
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.statusText = error instanceof Error ? error.message : 'Unknown Error';
    }
  })
  .post('/login', async (ctx) => {
    try {
      const { email, password } = LoginRequest.parse(ctx.request.body);
      let res: TLoginResponse;
      try {
        const user = await User.findOne({ email });
  
        if (!user) {
          res = {
            status: 'UNKNOWN_USER',
            email
          }
        }
        else if (compareSync(password, user.password)) {
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );
    
          res = {
            status: 'LOGGEDIN',
            email,
            token
          };
        } else {
          res = {
            status: 'WRONG_PASSWORD',
            email
          };
        }
      } catch(error) {
        res = {
          status: 'ERROR',
          email
        }        
      }
      ctx.response.status = 200;
      ctx.response.body = res;
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    }
  })
  .post('/free', async (ctx) => {
    ctx.response.status = 200;
    ctx.response.body = {
      message: 'free access'
    };
  })
  .post('/restricted', auth, async (ctx) => {
    ctx.response.status = 200;
    ctx.response.body = {
      message: `restricted access. user: ${ctx.request.user.userEmail}`
    };
  });

router.post("/createOrganization", async (ctx) => {
  try{
    const {email, name} = CreateOrganizationRequest.parse(ctx.request.body);
    try{
      const user = await User.findOne({email: email});
      const organization = new Organization({name: name});
      const saved = await organization.save();
      const membership = new Membership({
        user: user._id, 
        organization: saved._id, 
        role: "admin"
      });
      await membership.save();
      const organizations = await Membership.aggregate([
        { $match: { user: user._id } },
        { $lookup: {
            from: "organizations",
            localField: "organization",
            foreignField: "_id",
            as: "organization"
        } },
      ]);
    
      ctx.status = 200;
      ctx.response.body = {
        organizations: organizations
      };
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
      ctx.response.body = {message: "Organization already exists!"};
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    const message = JSON.parse(error.message)[0].message;
    ctx.response.body = {message: message};
  }
})

router.get("/getOrganizations", async (ctx) => {
  try{
    const {email} = EmailRequest.parse(ctx.query);
    try{
      const user = await User.findOne({email: email});
      const id = user._id;
      const organizations = await Membership.aggregate([
        { $match: { user: id } },
        { $lookup: {
            from: "organizations",
            localField: "organization",
            foreignField: "_id",
            as: "organization"
        } },
      ]);
      ctx.status = 200;

      ctx.response.body = {
        organizations: organizations
      };
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    const message = JSON.parse(error.message)[0].message;
    ctx.response.body = {message: message};
  }
  
})

router.get("/getUsers", async (ctx) => {
  try{
    const {org} = getMembers.parse(ctx.query);
    const torg = new mongoose.Types.ObjectId(org);
    try{
      const users = await Membership.aggregate([
        {$match: {organization: torg}},
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "organizations",
            localField: "organization",
            foreignField: "_id",
            as: "organization"
          }
        }
      ]);
      ctx.response.body = {
        users: users
      };
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    const message = JSON.parse(error.message)[0].message;
    ctx.response.body = {message: message};
  }
  
})

router.delete("/deleteMembership", async (ctx) => {
  try{
    const {user, org} = DeleteMemberRequest.parse(ctx.query);
    const user_id = new mongoose.Types.ObjectId(user);
    const org_id = new mongoose.Types.ObjectId(org);
    try{
      await Membership.deleteOne({user: user_id, organization: org_id});
      ctx.status = 200;
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    const message = JSON.parse(error.message)[0].message;
    ctx.response.body = {message: message};
  }
  
})

router.post("/addMembership", async (ctx) => {
  try{
    const {email} = EmailRequest.parse(ctx.request.body);
    try{
      const user = await User.findOne({email: email});
      const user_id = user._id;
      const org_id = new mongoose.Types.ObjectId(ctx.query.org);
      await Membership.findOneAndDelete({user: user_id, organization: org_id});
      const membership = new Membership({
        user: user_id,
        organization: org_id,
        role: ctx.request.body.role
      });
      
      await membership.save();
      ctx.status = 200;
    }
    catch(error){
      ctx.status = 500;
      ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
      ctx.response.body = {message: "No such user!"};
    }
  }
  catch(error){
    ctx.status = 500;
    console.log(error.message);
    ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    const message = JSON.parse(error.message)[0].message;
    ctx.response.body = {message: message};
  }
  
})

router.put("/updateMembership", async (ctx) => {
  try{
    const {user, role, org} = RoleChange.parse(ctx.request.body);
    try{
      await Membership.updateOne({user: new mongoose.Types.ObjectId(user), 
        organization: new mongoose.Types.ObjectId(org)}, {role: role}
        );
        ctx.status = 200
    }
    catch(error){
      ctx.status = 500;
      ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  catch(error){
    ctx.status = 500;
    if (error instanceof z.ZodError) {
      console.log(error.issues);
    }
    ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    const message = JSON.parse(error.message)[0].message;
    ctx.response.body = {message: message};
  }
  
})

router.delete("/deleteProfile", async (ctx) => {
  try{
    const {email} = EmailRequest.parse(ctx.query);
    try{
      await User.findOneAndDelete({email: email});
      ctx.status = 200;
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    const message = JSON.parse(error.message)[0].message;
    ctx.response.body = {message: message};
  }
  
})

router.delete("/leaveOrganization", async (ctx) => {
  try{
    const {user, org} = LeaveOrganizationRequest.parse(ctx.request.body);
    try{
      const fUser = await User.findOne({email: user});
      await Membership.deleteOne({user: fUser._id, organization: new mongoose.Types.ObjectId(org)});
      ctx.status = 200;
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
    const message = JSON.parse(error.message)[0].message;
    ctx.response.body = {message: message};
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
