import styled, { StyleSheetManager } from 'styled-components';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store';
import { Login } from './components/login/login';
import { logOff } from './features/security/user';
import { GlobalStyle } from './components/global-style';
import { Profile } from './components/profile/Profile'
import { Organization } from './components/organization/Organization';
import { useCallback } from 'react';
import { NlpChat } from './components/nlp-chat/nlp-chat';

const imageURL = "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"

const StyledApp = styled.div`
  position: relative;
  padding: 6px;
  height: 100%;
  display: grid;
  grid-template-columns: 420px 1fr 320px;
  grid-template-rows: 64px auto 1fr;
`;

const Header = styled.div`
  grid-column: 1 / 4;
  grid-row: 1 / 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: sticky;
  height: 100%;
  padding: 4px 8px 4px 8px;
  margin-bottom: 4px;
  color: #E0E0E0;
  background-color: brown;
  border: 1px solid maroon;
  border-radius: 4px;
  box-shadow: 2px 2px silver;
  a {
    text-decoration: none;
    color: inherit;
  }
  a:hover {
    color: white;
  }
  h1 {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
  }
  div {
    span {
      border-bottom: 2px dotted;      
      cursor: pointer;
    }
    span:hover {
      color: white;
    }
  }
`;

const LeftColumn = styled.div`
  grid-column: 1 / 1;
  grid-row: 3 / 3;
`;

const RightColumn = styled.div`
  grid-column: 3 / 4;
  grid-row: 3 / 4;
  padding-top: 6px;
`;

const MainArea = styled.div`
  grid-column: 1 / 3;
  grid-row: 3 / 3;
`;

export const App = () => {
  const email = useAppSelector( state => state.user.email );
  const messages = useAppSelector( state => state.log.messages );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handleLogoff = useCallback( () => {
    dispatch(logOff());
    navigate('/');
  }, []);

  return (
    <StyleSheetManager disableVendorPrefixes={true}>
      <>
        <GlobalStyle />
        <StyledApp>
          <Header>
            <Link to="/">
              <h1>GDMN #4</h1>
            </Link>
            {
              email ?
              <>
                <div>
                  Welcome <Link to="/profile"><span>{email}</span></Link>! <span onClick={ handleLogoff }>Logoff</span> 
                </div>
              </>
              
              :
              null
            }
          </Header>
          {
            messages.map( ({ id, message }) => <div key={id}>{message}</div>)
          }
          {
            email ?
              <>
                <MainArea>
                  <Routes>
                    <Route path='/' element={null} />
                    <Route path='/profile' element={<Profile email={email} bio="" avatarUrl={imageURL}/>}/>
                    <Route path='/organization/:id' element={<Organization/>}/>
                  </Routes>
                </MainArea>
                <RightColumn>
                  <NlpChat />
                </RightColumn>
              </>
            :
              <LeftColumn>
                <Login />
              </LeftColumn>
          }
        </StyledApp>
      </>
    </StyleSheetManager>    
  );
};
