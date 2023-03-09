import styled, { StyleSheetManager } from 'styled-components';
import { Route, Routes, Link, BrowserRouter, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store';
import { Login } from './components/login/login';
import { logOff } from './features/security/user';
import { GlobalStyle } from './components/global-style';
import { Profile } from './components/profile/Profile'
import { Organization } from './components/organization/Organization';

const imageURL = "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"

const StyledApp = styled.div`
  position: relative;
  padding: 6px;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: sticky;
  height: 64px;
  padding: 4px 8px 4px 8px;
  color: #E0E0E0;
  background-color: brown;
  border: 1px solid maroon;
  border-radius: 4px;
  box-shadow: 2px 2px silver;
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

const ProfileLink = styled.div`
  margin: 0, auto;
  font-size: 30px
`;

export const App = () => {

  const { email } = useAppSelector( state => state.user );
  const { messages } = useAppSelector( state => state.log );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handleLogoff = () => {
    dispatch(logOff())
    navigate("/")
  };

  return (
    <StyleSheetManager disableVendorPrefixes={true}>
      <>
        <GlobalStyle />
        <StyledApp>
          <Header>
            <h1>GDMN #4</h1>
            {
              email ?
              <>
                <ProfileLink>
                  <Link to="/profile" style={{color: 'white'}}>Profile</Link>
                </ProfileLink>
                
                <div>
                  Welcome {email}! <span onClick={ handleLogoff }>Logoff</span> 
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
                  <Routes>
                      <Route path='/profile' element={<Profile email={email} bio="" avatarUrl={imageURL}/>}/>
                      <Route path='/organization/:id' element={<Organization/>}/>
                  </Routes>
                
                {/* <div role="navigation">
                  <ul>
                    <li>
                      <Link to="/">Home</Link>
                    </li>
                    <li>
                      <Link to="/page-2">Page 2</Link>
                    </li>
                  </ul>
                </div>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <div>
                        This is the generated root route.{' '}
                        <Link to="/page-2">Click here for page 2.</Link>
                      </div>
                    }
                  />
                  <Route
                    path="/page-2"
                    element={
                      <div>
                        <Link to="/">Click here to go back to root page.</Link>
                      </div>
                    }
                  />
                </Routes> */}
              </>
            :
              <Login />
          }
        </StyledApp>
      </>
    </StyleSheetManager>    
  );
};
