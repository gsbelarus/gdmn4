import koa from 'koa';
import cors from '@koa/cors';
import { dbConnect } from './db/db-connect';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router';
import { hashSync, compareSync } from 'bcryptjs';
import { User } from './db/userModel';
import { Organization } from './db/organizationModel';
import { Membership } from './db/membershipModel';
import jwt from 'jsonwebtoken';
import {AddParticipantRequest, CreateChatRequest, CreateMessageRequest, CreateOrganizationRequest, DeleteChat, DeleteMemberRequest, EmailRequest, GetChatInfoRequest, GetChatMessagesRequest, GetMembersRequest, GetProfileRequest, LeaveOrganizationRequest, LoginRequest, RegisterRequest, RoleChange, TRegisterResponse, changeProfileUsername } from '@gdmn-cz/types';
import type { TLoginResponse } from '@gdmn-cz/types';
import mongoose from 'mongoose';
import { Chat, ChatMessage } from './db/chatModel';

dbConnect();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = new koa();

// app.use(cors(corsOptions));
app.use(bodyParser());

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "http://localhost:4200");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  ctx.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  ctx.set("Access-Control-Allow-Credentials", "true");
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
      ctx.response.body = error instanceof Error ? error.message : 'Unknown Error';
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
            token,
            userId: user._id.toString()
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
      ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
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
    
      ctx.status = 200;
      ctx.response.body = {
        status: "Organization created!"
      }
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
      ctx.response.body = {message: "Organization already exists!"};
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
    try{
      const message = JSON.parse(error.message)[0].message;
      ctx.response.body = { message };
    }
    catch(error){
      ctx.response.body = {message: "Invalid input"};
    }
    
  }
})

router.get("/getOrganizations", async (ctx) => {
  try {
    const { email } = EmailRequest.parse(ctx.query);
    try {
      const user = await User.findOne({ email });
      //TODO: а если не найдет пользователя?
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
        organizations
      };
    }
    catch (error) {
      ctx.response.status = 500;
      ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
      ctx.response.body = {message: "Internal error"};
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
    try {
      const message = JSON.parse(error.message)[0].message;
      ctx.response.body = { message };
    }
    catch(error){
      ctx.response.body = {message: "Invalid input"};
    }
  }  
})

router.get("/getUsers", async (ctx) => {
  try{
    const { org } = GetMembersRequest.parse(ctx.query);
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
      ctx.status = 200;
      ctx.response.body = {
        users
      };
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
      ctx.response.body = {message: "Internal error"};
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
    try{
      const message = JSON.parse(error.message)[0].message;
      ctx.response.body = { message };
    }
    catch(error){
      ctx.response.body = {message: "Invalid input"};
    }
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
      ctx.response.body = {
        status: "Membership deleted!"
      }
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
      ctx.response.body = {message: "Internal error"};
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
    try{
      const message = JSON.parse(error.message)[0].message;
      ctx.response.body = {message: message};
    }
    catch(error){
      ctx.response.body = {message: "Invalid input"};
    }
  }
  
})

router.post("/addMembership", async (ctx) => {
  try{
    const {email} = EmailRequest.parse(ctx.request.body);
    try{
      const user = await User.findOne({ email });
      //TODO: what if a user is not found?
      const user_id = user._id;
      const {org} = GetMembersRequest.parse(ctx.request.query);
      const org_id = new mongoose.Types.ObjectId(org);
      await Membership.findOneAndDelete({user: user_id, organization: org_id});
      const membership = new Membership({
        user: user_id,
        organization: org_id,
        //TODO: должно быть в валидаторе!
        role: (ctx.request.body as any).role 
      });
      
      await membership.save();
      ctx.status = 200;
      ctx.response.body = {
        status: "Membership added!"
      }
    }
    catch(error){
      ctx.status = 500;
      ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
      ctx.response.body = {message: "No such user!"};
    }
  }
  catch(error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
    ctx.response.body = {message: "Internal error"};
    try{
      const message = JSON.parse(error.message)[0].message;
      ctx.response.body = {message: message};
    }
    catch(error){
      ctx.response.body = {message: "Invalid input"};
    }
  }
  
});

router.put("/updateMembership", async (ctx) => {
  try{
    const {user, role, org} = RoleChange.parse(ctx.request.body);
    try{
      await Membership.updateOne({user: new mongoose.Types.ObjectId(user), 
        organization: new mongoose.Types.ObjectId(org)}, {role: role}
        );
        ctx.status = 200
        ctx.response.body = {
          status: "Membership updated!"
        }
    }
    catch(error){
      ctx.status = 500;
      ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
      ctx.response.body = {message: "Internal error"};
    }
  }
  catch(error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
    try{
      const message = JSON.parse(error.message)[0].message;
      ctx.response.body = { message };
    }
    catch(error){
      ctx.response.body = {message: "Invalid input"};
    }
  }
  
});

router.delete("/deleteProfile", async (ctx) => {
  try{
    const {email} = EmailRequest.parse(ctx.query);
    try{
      await User.findOneAndDelete({ email });
      ctx.status = 200;
      ctx.response.body = {
        status: "Profile deleted!"
      }
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
      ctx.response.body = {message: "Internal error"};
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
    try{
      const message = JSON.parse(error.message)[0].message;
      ctx.response.body = {message: message};
    }
    catch(error){
      ctx.response.body = {message: "Invalid input"};
    }
  }
  
});

router.delete("/leaveOrganization", async (ctx) => {
  try{
    const {user, org} = LeaveOrganizationRequest.parse(ctx.request.body);
    try{
      const fUser = await User.findOne({email: user});
      await Membership.deleteOne({user: fUser._id, organization: new mongoose.Types.ObjectId(org)});
      ctx.status = 200;
      ctx.response.body = {
        status: "Left organization!"
      }
    }
    catch(error){
      ctx.response.status = 500;
      ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
      ctx.response.body = {message: "Internal error"};
    }
  }
  catch(error){
    ctx.response.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
    try{
      const message = JSON.parse(error.message)[0].message;
      ctx.response.body = {message: message};
    }
    catch(error){
      ctx.response.body = {message: "Invalid input"};
    }
  }
});

/**
 * Возвращает все сообщения для чата по заданному ИД пользователя
 * и ИД чата.
 */
router.get('/chatMessages', async (ctx) => {
  try{
    const { chatId } = GetChatMessagesRequest.parse(ctx.request.query);
    const messages = await ChatMessage.find({chat: chatId});

    ctx.response.body = messages.map((mes) => {return{
        id: mes._id,
        content: mes.text,
        senderId: mes.user,
        senderName: mes.who,
        timeStamp: mes.timeStamp
      }});
  }
  catch (error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
  };
});

/**
 * Создаёт новый чат с заданным ИД пользователя, ИД участников чата
 * и тэгу чата
 */

router.post('/createChat', async (ctx) => {
  try{
    const {ownerId, participantsIds, tag} = CreateChatRequest.parse(ctx.request.body);
    const newChat = await Chat.create({
      owner: ownerId, 
      participants: participantsIds,
      tag: tag
    });
    ctx.response.body = {
      res: "Successfully created chat!"
    }
  }
  catch (error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
  };
});

router.delete('/deleteChat', async (ctx) => {
  try{
    const {chatId} = DeleteChat.parse(ctx.request.query);
    await Chat.findOneAndDelete({_id: chatId});
    ctx.response.body = {
      res: "Successfully deleted chat!"
    }
  }
  catch (error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
  };
});

/**
 * Создаёт новое сообщение в БД по ИД чата,
 * содержанию сообщения и ИД пользователя, который
 * отправил сообщение
 */

router.post('/createMessage', async (ctx) => {
  try{
    const {chatId, text, userId, who} = CreateMessageRequest.parse(ctx.request.body);
    const newMessage = await ChatMessage.create({
      chat: chatId,
      text: text,
      user: userId,
      timeStamp: new Date(),
      who: who
    });
    ctx.response.body = {
      res: "Successfully added message!"
    }
  }
  catch(error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
  };
});

router.get("/chatInfo", async (ctx) => {
  try{
    const {id} = GetChatInfoRequest.parse(ctx.request.query);
    const ownerId = new mongoose.Types.ObjectId(id);
    let chat = null;
    chat = await Chat.findOne({owner: ownerId});

    if (!chat){
      const newChat = await Chat.create({
        owner: ownerId,
        participants: [ownerId],
        tag: "default"
      }); 
      chat = newChat
    }
    ctx.response.body= chat;
  }
  catch(error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
  }
});

router.post("/addParticipant", async (ctx) => {
  try{
    const {chatId, userId} = AddParticipantRequest.parse(ctx.request.body)
    await Chat.findByIdAndUpdate(new mongoose.Types.ObjectId(chatId), {$addToSet: {participants: userId}});
    ctx.response.body = {
      res: "Successfully added participant!"
    }
  } 
  catch(error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
  }
});

router.post("/deleteParticipant", async (ctx) => {
  try{
    const {chatId, userId} = AddParticipantRequest.parse(ctx.request.body)
    await Chat.findByIdAndUpdate(new mongoose.Types.ObjectId(chatId), {$pull: {participants: userId}});
    ctx.response.body = {
      res: "Successfully deleted participant!"
    }
  } 
  catch(error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
  }
});

router.get("/getProfile", async (ctx) => {
  try{
    const {email} = GetProfileRequest.parse(ctx.request.query);
    const profileInfo = await User.findOne({email: email});
    ctx.response.body = profileInfo;
  }
  catch(error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
  }
});

router.post("/changeUsername", async (ctx) => {
  try{
    const {email} = GetProfileRequest.parse(ctx.request.query);
    const {userName} = changeProfileUsername.parse(ctx.request.body)
    await User.findOneAndUpdate({email: email}, {$set: {userName: userName}});
    ctx.response.body = {
      res: "Successfully changed userName!"
    }
  }
  catch(error){
    ctx.status = 500;
    ctx.response.body = error instanceof Error ? error.message : 'Unknown error';
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
