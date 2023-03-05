import styled, { StyleSheetManager } from 'styled-components';
import { Route, Routes, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store';
import { Login } from './components/login/login';
import { logOff } from './features/security/user';
import { GlobalStyle } from './components/global-style';

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

export const App = () => {

  const { email } = useAppSelector( state => state.user );
  const { messages } = useAppSelector( state => state.log );
  const dispatch = useAppDispatch();

  return (
    <StyleSheetManager disableVendorPrefixes={true}>
      <>
        <GlobalStyle />
        <StyledApp>
          <Header>
            <h1>GDMN #4</h1>
            {
              email ?
              <div>
                Welcome {email}! <span onClick={ () => dispatch(logOff()) }>Logoff</span>  
              </div>
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
