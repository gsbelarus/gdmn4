import { z } from 'zod';

export const RegisterStatus = z.enum([
  'REGISTERED', 
  'DUPLICATE_EMAIL',
  'ERROR'
]);

export type TRegisterStatus = z.infer<typeof RegisterStatus>;

export const RegisterRequest = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256)
});

export type TRegisterRequest = z.infer<typeof RegisterRequest>;

export const RegisterResponse = z.object({
  status: RegisterStatus,
  email: z.string().email()
});

export type TRegisterResponse = z.infer<typeof RegisterResponse>;

export const LoginStatus = z.enum([
  'LOGGEDIN', 
  'UNKNOWN_USER', 
  'WRONG_PASSWORD', 
  'ACCESS_DENIED', 
  'ERROR'
]);

export type TLoginStatus = z.infer<typeof LoginStatus>;

export const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256)
});

export type TLoginRequest = z.infer<typeof LoginRequest>;

export const LoginResponse = z.object({
  status: LoginStatus,
  email: z.string().email(),
  token: z.string().optional(),
  userId: z.string().optional()
});

export type TLoginResponse = z.infer<typeof LoginResponse>;

export const EmailRequest = z.object({
  email: z.string().email()
});

export const CreateOrganizationRequest = z.object({
  email: z.string().email(),
  name: z.string()
});

export const LeaveOrganizationRequest = z.object({
  user: z.string().email(),
  org: z.string()
});

export const DeleteMemberRequest = z.object({
  user: z.string(),
  org: z.string()
});

export const GetMembersRequest = z.object({
  org: z.string()
});

export const GetProfileRequest = z.object({
  email: z.string().email()
});

export const changeProfileUsername = z.object({
  userName: z.string()
});

export const RoleChange = z.object({
  user: z.string(),
  role: z.string(),
  org: z.string()
});

export const GetChatMessagesRequest = z.object({
  chatId: z.string()
});

export const CreateChatRequest = z.object({
  ownerId: z.string(), 
  participantsIds: z.array(z.string()), 
  tag: z.string()
});

export const CreateMessageRequest = z.object({
  chatId: z.string(), 
  text: z.string(), 
  userId: z.string(), 
  who: z.string()
});

export const GetChatInfoRequest = z.object({
  id: z.string()
});

export const AddParticipantRequest = z.object({
  chatId: z.string(),
  userId: z.string()
})

export function types(): string {
  return 'types';
};
