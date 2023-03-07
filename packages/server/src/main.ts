import koa from 'koa';
import { dbConnect } from './db/db-connect';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import { hashSync, compareSync } from 'bcryptjs';
import { User } from './db/userModel';
import { Organization } from './db/organizationModel';
import { Membership } from './db/membershipModel';
import jwt from 'jsonwebtoken';
import { LoginRequest, RegisterRequest, TRegisterResponse } from '@gdmn-cz/types';
import type { TLoginResponse } from '@gdmn-cz/types';
import mongoose from 'mongoose';

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
  const email = ctx.request.body.email
  const user = await User.findOne({email: email})

  try{
    const organization = new Organization({name: ctx.request.body.name})
    const saved = await organization.save()
    const membership = new Membership({
      user: user._id, 
      organization: saved._id, 
      role: "admin"
    })
    await membership.save()
    const organizations = await Membership.aggregate([
      { $match: { user: user._id } },
      { $lookup: {
          from: "organizations",
          localField: "organization",
          foreignField: "_id",
          as: "organization"
      } },
    ])
  
    ctx.response.body = {
      organizations: organizations
    }
  }
  catch(error){
    ctx.response.status = 500
    ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
  }
  
  
})

router.post("/getOrganizations", async (ctx) => {
  const email = ctx.request.body.email
  const user = await User.findOne({email: email})
  const id = user._id
  const organizations = await Membership.aggregate([
    { $match: { user: id } },
    { $lookup: {
        from: "organizations",
        localField: "organization",
        foreignField: "_id",
        as: "organization"
    } },
])

  ctx.response.body = {
    organizations: organizations
  }
})

router.get("/getUsers", async (ctx) => {
  const org = new mongoose.Types.ObjectId(ctx.query.org)
  const users = await Membership.aggregate([
    {$match: {organization: org}},
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
  ])
  ctx.response.body = {
    users: users
  }
})

router.get("/deleteMembership", async (ctx) => {
  const user_id = new mongoose.Types.ObjectId(ctx.query.user)
  const org_id = new mongoose.Types.ObjectId(ctx.query.org)
  await Membership.deleteOne({user: user_id, organization: org_id})
  const users = await Membership.aggregate([
    {$match: {organization: org_id}},
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
  ])
  ctx.response.body = {
    users: users
  }
})

router.post("/addMembership", async (ctx) => {
  try{
    const user = await User.findOne({email: ctx.request.body.email})
    const user_id = user._id
    const org_id = new mongoose.Types.ObjectId(ctx.query.org)
    await Membership.findOneAndDelete({user: user_id, organization: org_id})
    const membership = new Membership({
      user: user_id,
      organization: org_id,
      role: ctx.request.body.role
    })
    
    await membership.save()
    const users = await Membership.aggregate([
      {$match: {organization: org_id}},
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
    ])
    ctx.response.body = {
      users: users
    }
  }
  catch(error){
    ctx.status = 500
    ctx.response.statusText = error instanceof Error ? error.message : 'Unknown error';
  }
  
})

router.post("/updateMembership", async (ctx) => {
  await Membership.updateOne({user: new mongoose.Types.ObjectId(ctx.request.body.user), 
  organization: new mongoose.Types.ObjectId(ctx.request.body.org)}, {role: ctx.request.body.role}
  )

  const users = await Membership.aggregate([
    {$match: {organization: new mongoose.Types.ObjectId(ctx.request.body.org)}},
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
  ])
  ctx.response.body = {
    users: users
  }
})

router.get("/deleteProfile", async (ctx) => {
  await User.findOneAndDelete({email: ctx.query.email})
  ctx.response.body = {
    message: "Success!"
  }
})

router.post("/leaveOrg", async (ctx) => {
  const user = await User.findOne({email: ctx.request.body.user})
  await Membership.deleteOne({user: user._id, organization: new mongoose.Types.ObjectId(ctx.request.body.org)})
  const organizations = await Membership.aggregate([
    { $match: { user: user._id } },
    { $lookup: {
        from: "organizations",
        localField: "organization",
        foreignField: "_id",
        as: "organization"
    } },
])

  ctx.response.body = {
    organizations: organizations
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
