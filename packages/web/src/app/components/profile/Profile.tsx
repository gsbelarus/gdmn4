import { useEffect, useState } from 'react';
import styled from 'styled-components';
import InputUnstyled from '@mui/base/InputUnstyled';
import { Button } from '../controls/button';
import "./profile.css"
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { logOff } from '../../features/security/user';

const Container = styled.div`
  max-width: 800px;
  margin-left: 50px;
  box-shadow: 5px 10px #888888
`;

const Avatar = styled.img`
  margin-top: 50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
`;

const Email = styled.h1`
  font-size: 2rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
`;

const Bio = styled.p`
  font-size: 1.2rem;
`;

const Input = styled(InputUnstyled)`
  .MuiInput-input {
    border-radius: 4px;
    width: 100%;
  }
`;

interface Props {
  email: string;
  bio: string;
  avatarUrl: string;
}

export const Profile: React.FC<Props> = ({ email, bio = "", avatarUrl }) => {

  const [organizations, setOrganizations] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // axios.post("http://localhost:3000/getOrganizations", {email: email}).then(res => {
    // setOrganizations(res.data.organizations)
    // setLoading(false)
    // });
    fetch(`http://localhost:3000/getOrganizations`, {
      method: 'POST',
      body: JSON.stringify({email: email}),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      }
    }).then(res => {
      if(res.ok) {
        return res.json()
      }
      return res.text().then(text => {throw new Error(JSON.parse(text).message)});
    }).then(data => {
      setOrganizations(data.organizations)
      setLoading(false)
    }).catch(err => console.log(err.message))
  }, [email]);

  const createOrganization = () => {
    fetch(`http://localhost:3000/createOrganization`, {
      method: 'POST',
      body: JSON.stringify({name: name, email: email}),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      }
    }).then(res => {
      if(res.ok) {
        return res.json()
      }
      return res.text().then(text => {throw new Error(JSON.parse(text).message)});
    }).then(data => {
      setName("")
      setOrganizations(data.organizations)
      setErr("")
    }).catch(err => setErr(err.message))
};

  const deleteProfile = () => {
    // axios.get(`http://localhost:3000/deleteProfile?email=${email}`).then(res => {
    //   dispatch(logOff())
    //   navigate("/")
    // });
    fetch(`http://localhost:3000/deleteProfile?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      }
    }).then(res => {
      if(res.ok) {
        return res.json()
      }
      return res.text().then(text => {throw new Error(JSON.parse(text).message)});
    }).then(data => {
      dispatch(logOff())
      navigate("/")
    }).catch(err => console.log(err.message))

  }

  const leaveOrganization = (org: string) => {
    // axios.post("http://localhost:3000/leaveOrg", {user: email, org: org}).then(res => setOrganizations(res.data.organizations));
    fetch(`http://localhost:3000/leaveOrg`, {
      method: 'POST',
      body: JSON.stringify({user: email, org: org}),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      }
    }).then(res => {
      if(res.ok) {
        return res.json()
      }
      return res.text().then(text => {throw new Error(JSON.parse(text).message)});
    }).then(data => {
      setOrganizations(data.organizations)
    }).catch(err => console.log(err.message))
  }

  return (
    <div className='profilePage'>
      <div>
        <Container>
        <Avatar src={avatarUrl} />
        <Email>{email}</Email>
        <Bio>This is a user</Bio>
        <Button onClick={deleteProfile}>Delete profile!</Button>
        </Container>
        <div className='orgCreate'>
          <span>Enter organization name</span>
          <Input value={name} id="name" onChange={e => setName(e.target.value)}/>
          <span className='error'>{err}</span>
          <Button onClick={createOrganization}>Create</Button>
        </div>
      </div>
      <div className='table'>
        {
          loading? "" : 
          <table className='scrollTable1'>
            <thead className='fixedHeader'>
              <tr>
                <th>Organization</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className='scrollContent'>
              {
                organizations.map(org => (
                  <tr>
                    <td>
                      {org.role === "admin"? <Link to={`/organization/${org.organization[0]._id}`}>{org.organization[0].name}</Link>: org.organization[0].name}
                    </td>
                    <td>
                      {org.role}
                    </td>
                    <td>
                      <button onClick={() => leaveOrganization(org.organization[0]._id)}>Leave</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
            
          </table>
        }
      </div>
    </div>
    
  );
};
