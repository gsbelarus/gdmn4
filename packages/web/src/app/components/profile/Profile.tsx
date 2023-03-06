import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import InputUnstyled from '@mui/base/InputUnstyled';
import { Button } from '../controls/button';
import "./profile.css"
import { Link } from 'react-router-dom';

const Container = styled.div`
  max-width: 800px;
  margin-left: 50px;
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
    width: 20%;
  }
`;

interface Props {
  email: string;
  bio: string;
  avatarUrl: string;
}

export const Profile: React.FC<Props> = ({ email, bio = "", avatarUrl }) => {

  const [organizations, setOrganizations] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  useEffect(() => {
    axios.post("http://localhost:3000/getOrganizations", {email: email}).then(res => {
    setOrganizations(res.data.organizations)
    setLoading(false)
    })
  }, [])
  const createOrganization = () => {
    axios.post("http://localhost:3000/createOrganization", {name: name, email: email}).then(res => 
    {console.log(res.data.message)
      setName("")
      setOrganizations(res.data.organizations)
  })
  }

  return (
    <>
      <Container>
      <Avatar src={avatarUrl} />
      <Email>{email}</Email>
      <Bio>This is a user</Bio>
      </Container>
      <div className='orgCreate'>
        <span>Enter organization name</span>
        <Input value={name} id="name" onChange={e => setName(e.target.value)}/>
        <Button onClick={createOrganization}>Create</Button>
      </div>
      <span>{name}</span>
      <div className='table'>
        {
          loading? "" : 
          <table className='scrollTable'>
            <thead className='fixedHeader'>
              <tr>
                <th>Company</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody className='scrollContent'>
              {
                organizations.map(org => (
                  <tr>
                    <th>
                      {org.role === "admin"? <Link to="/zaglushka">{org.organization[0].name}</Link>: org.organization[0].name}
                    </th>
                    <th>
                      {org.role}
                    </th>
                  </tr>
                ))
              }
            </tbody>
            
          </table>
        }
      </div>
    </>
    
  );
};
