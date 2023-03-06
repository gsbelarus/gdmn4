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
  const organization = new Organization({name: ctx.request.body.name})
  const email = ctx.request.body.email
  const user = await User.findOne({email: email})
  const saved = await organization.save()
  const membership = new Membership({
    user_id: user._id, 
    organization_id: saved._id, 
    role: "admin"
  })
  await membership.save()
  ctx.response.body = {
    message: "Created new organization and membership!",
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
