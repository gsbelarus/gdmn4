import { Schema, model, ObjectId } from 'mongoose';

interface IChat {
  owner: ObjectId;
  participants: ObjectId[];
  tag: string;
};

const ChatSchema = new Schema<IChat>({
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },
  participants: [{ 
    type : Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  tag: {
    type: Schema.Types.String
  }
});

export const Chat = model<IChat>('Chat', ChatSchema);

interface IChatMessage {
  chat: ObjectId;
  timeStamp: Date;
  text: string;
  user?: ObjectId;
  who?: string;
};

const ChatMessageSchema = new Schema<IChatMessage>({
  chat: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chat'
  },  
  timeStamp: {
    type: Schema.Types.Date,
    required: true
  },
  text: {
    type: Schema.Types.String,
    required: true
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },  
  who: {
    type: Schema.Types.String
  }
});

export const ChatMessage = model<IChatMessage>('ChatMessage', ChatMessageSchema);
