import styled from "styled-components";
import InputUnstyled from '@mui/base/InputUnstyled';
import { useAppDispatch } from "../../store";
import { Button } from "../controls/button";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, TLoginStatus, TRegisterStatus } from "@gdmn-cz/types";
import { logIn } from "../../features/security/user";
import { createMachine } from "xstate";
import { useMachine } from "@xstate/react";
import { assign } from "xstate/lib/actions";
import { ftch2 } from "../../api";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: stretch;
  font-size: larger;
`;

const LoginBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px;
  border-right: 1px dashed gray;
  gap: 16px;
  width: 420px;
  h2 {
    border-bottom: 1px solid silver;
  }
`;

const ButtonBar = styled.div`
  display: flex;
  flex-direction: column;  
  align-items: flex-end;
  margin-top: 8px;
  gap: 16px;

  span {
    border-bottom: 2px dotted;
    cursor: pointer;
  }

  span:hover {
    color: red;
  }
`;

const Dots = styled.div`
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  height: 100px;
  width: 100px;
  margin: -25px 0 0 -25px;

  span {
    position: absolute;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 50%;
    animation: dots1 1s infinite ease-in-out;
  }

  span:nth-child(1) {
    left: 0px;
    animation-delay: 0.2s;
  }

  span:nth-child(2) {
    left: 30px;
    animation-delay: 0.3s;
  }

  span:nth-child(3) {
    left: 60px;
    animation-delay: 0.4s;
  }

  span:nth-child(4) {
    left: 90px;
    animation-delay: 0.5s;
  }

  @keyframes dots1 {
    0% {
      transform: translateY(0px);
      transform: translateY(0px);
      background: rgba(0, 0, 0, 0.25);
    }
    50% {
      transform: translateY(10px);
      transform: translateY(10px);
      background: #000000;
    }
    100% {
      transform: translateY(0px);
      transform: translateY(0px);
      background: rgba(0, 0, 0, 0.25);
    }
  }
`;

const Input = styled(InputUnstyled)`
  .MuiInput-input {
    border-radius: 4px;
    width: 100%;
  }
`;

const Label = styled.label`
`;

const B = styled.div`
  border-radius: 4px;
  padding: 4px 8px 4px 8px;
  width: 100%
`;

const ErrorB = styled(B)`
  background-color: pink;
  border: 1px solid maroon;  
`;

const InfoB = styled(B)`
  background-color: lightgreen;
  border: 1px solid darkgreen;  
`;

const InfoBar = ({ children, error }: { children: string | null, error?: boolean }) => {
  return (
    error ?
      <ErrorB style={{ visibility: children ? 'visible' : 'hidden' }}>⚠ {children}</ErrorB>
    :  
      <InfoB style={{ visibility: children ? 'visible' : 'hidden' }}>🛈 {children}</InfoB>
  );
};

type LoginContext = {
  email: string;
  password: string;
  password2: string;
  valid?: boolean;
  status?: TLoginStatus | TRegisterStatus;
  token?: string;
};

const initialContext: LoginContext = {
  email: '',
  password: '',
  password2: '',
  status: undefined,
  token: undefined
}; 

type LoginEvents = 
  { type: 'switch' } |
  { type: 'query' } |
  { type: 'enterEmail', email: string } |
  { type: 'enterPassword', password: string } |
  { type: 'enterPassword2', password2: string };

const loginMachine = createMachine<LoginContext, LoginEvents>({
  id: 'loginMachine',
  initial: 'login',
  predictableActionArguments: true,
  context: initialContext,
  states: {
    login: {
      initial: 'enterData',
      on: {
        switch: {
          target: 'register',
          actions: assign({ status: undefined, password: undefined })
        }
      },
      states: {
        enterData: {
          on: {
            enterEmail: {
              actions: assign( ({ password, ...rest }, event) => {
                const email = event.email.trim();
                return {
                  ...rest,
                  email,
                  password,
                  valid: LoginRequest.safeParse({ email, password }).success,
                  status: undefined
                };
              })
            },
            enterPassword: {
              actions: assign( ({ email, ...rest }, { password }) => {
                return {
                  ...rest,
                  email,
                  password,
                  valid: LoginRequest.safeParse({ email, password }).success,
                  status: undefined
                };
              })
            },
            query: 'waitForServer'
          }
        },
        waitForServer: {
          tags: 'pending',
          invoke: {
            id: 'loginUser',
            src: ({ email, password }) => ftch2('login', { email, password }, LoginResponse),
            onDone: [
              {
                target: 'success',
                cond: (_, event) => event.data?.status === 'LOGGEDIN',
                actions: assign( (ctx, event) => ({ ...ctx, status: event.data.status, token: event.data.token }) )
              },
              {
                target: 'enterData',
                actions: assign( (ctx, event) => ({ ...ctx, status: event.data?.status }) )
              }
            ],
            onError: 'enterData'
          }          
        },
        success: {
          type: 'final',
          entry: 'dispatchLogin'
        }
      }
    },
    register: {
      initial: 'enterData',
      on: {
        switch: {
          target: 'login',
          actions: assign({ password: undefined, password2: undefined })
        }
      },
      states: {
        enterData: {
          on: {
            enterEmail: {
              actions: assign( ({ password, password2, ...rest }, event) => {
                const email = event.email.trim();
                return {
                  ...rest,
                  email,
                  password, 
                  password2,
                  status: undefined,
                  valid: RegisterRequest.safeParse({ email, password }).success && password === password2
                };
              })
            },
            enterPassword: {
              actions: assign( ({ email, password2, ...rest }, { password }) => {
                return {
                  ...rest,
                  email,
                  password,
                  password2,
                  status: undefined,
                  valid: RegisterRequest.safeParse({ email, password }).success && password === password2
                };
              })
            },
            enterPassword2: {
              actions: assign( ({ email, password, ...rest }, { password2 }) => {
                return {
                  ...rest,
                  email,
                  password,
                  password2,
                  status: undefined,
                  valid: RegisterRequest.safeParse({ email, password }).success && password === password2
                };
              })
            },
            query: 'waitForServer'
          }
        },
        waitForServer: {
          tags: 'pending',
          invoke: {
            id: 'registerUser',
            src: ({ email, password }) => ftch2('register', { email, password }, RegisterResponse),
            onDone: [
              {
                target: '#loginMachine.login.enterData',
                cond: (_, event) => event.data?.status === 'REGISTERED',
                actions: assign( (ctx, event) => ({ ...ctx, status: event.data.status }) )
              },
              {
                target: 'enterData',
                actions: assign( (ctx, event) => ({ ...ctx, status: event.data?.status }) )
              }
            ],
            onError: 'enterData'
          }
        }
      }
    },
  }
});

export const Login = () => {
  const dispatch = useAppDispatch();
  const [state, send] = useMachine(loginMachine, { 
    actions: {
      dispatchLogin: ({ email, token }) => dispatch(logIn({ email, token }))
    }
  });
  const { email, password, password2, valid, status } = state.context;

  return (
    <Container>
      {state.hasTag('pending') ? <Dots><span /><span /><span /><span /></Dots> : null}
      <LoginBox>
        <h2>{state.matches('login') ? 'Login' : 'New user'}</h2>
        <div>
          <Label htmlFor='email'>email:</Label>
          <Input 
            id='email'
            value={email} 
            autoFocus
            onChange={ e => { send({ type: 'enterEmail', email: e.target.value }); } }
          />
          </div>
          <div>
            <Label htmlFor='password'>password:</Label>
            <Input 
              id='password'
              value={password} 
              type='password'        
              onChange={ e => { send({ type: 'enterPassword', password: e.target.value }); } }
            />
          </div>
          {
            state.matches('login') ?
              null
              :
              <div>
                <Label htmlFor='password2'>repeat password:</Label>
                <Input 
                  id='password2'
                  value={password2} 
                  type='password'        
                  onChange={ e => { send({ type: 'enterPassword2', password2: e.target.value }); } }
                />
              </div>
          }
        <ButtonBar>           
          <Button 
            disabled={!valid || state.hasTag('pending')} 
            style={{ maxWidth: 120 }}
            onClick={ () => send('query') }
          >
            {state.matches('login') ? 'Login' : 'Register'}
          </Button>
          {
            state.matches('login') ?
              <div>Not here yet? Please, <span onClick={ () => { send('switch'); } }>register</span>.</div>
            :
              <div>Already have an account? <span onClick={ () => { send('switch'); } }>Log in</span>.</div>
          }
          <InfoBar error={ status !== 'LOGGEDIN' && status !== 'REGISTERED' }>
            {
              status === 'UNKNOWN_USER'
              ? 'Unknown user!'
              : status === 'WRONG_PASSWORD'
              ? 'Wrong password!'
              : status === 'ACCESS_DENIED'
              ? 'Access denied!'
              : status === 'DUPLICATE_EMAIL'
              ? 'User already exists!'
              : status === 'ERROR'
              ? 'Error'
              : status === 'REGISTERED'
              ? 'User registered successfully!'
              : null
            }
          </InfoBar> 
        </ButtonBar>         
      </LoginBox>
    </Container>
  );
};