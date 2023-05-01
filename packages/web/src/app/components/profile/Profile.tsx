import { useState } from 'react';
import styled from 'styled-components';
import InputUnstyled from '@mui/base/InputUnstyled';
import { Button } from '../controls/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { logOff } from '../../features/security/user';
import { Table } from '../table/table';
import { useChangeUsernameMutation, useCreateOrganizationMutation, useDeleteProfileMutation, useGetOrganizationsQuery, useGetProfileQuery, useLeaveOrganizationMutation } from '../../profile-api';

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

const UserName = styled.h1`
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

const Page = styled.div`
  display: flex;
  align-items: stretch;
  margin-left: 50px;
`;

const Create = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  row-gap: 5px;
`;

const ErrorSpan = styled.span`
  color: red;
`;

interface Props {
  email: string;
  bio: string;
  avatarUrl: string;
}

export const Profile: React.FC<Props> = ({ email, bio = "", avatarUrl }) => {

  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {data: body, isSuccess, refetch} = useGetOrganizationsQuery(email, {refetchOnMountOrArgChange: true, pollingInterval: 30000});
  const {data: profileInfo, isLoading, refetch: refetch2} = useGetProfileQuery(email);
  const [createOrganization] = useCreateOrganizationMutation();
  const [leaveOrganization] = useLeaveOrganizationMutation();
  const [deleteProfile] = useDeleteProfileMutation();
  const [changeUsername] = useChangeUsernameMutation();

  const handleCreateOrganization = () => {
    createOrganization({name: name, email: email}).unwrap()
    .then(() => {
      setErr("");
      refetch();
    })
    .catch((error) => {
      setErr(error.data.message);
      console.error(error)
    });
};

  const handleDeleteProfile = () => {
    deleteProfile(email).unwrap()
    .then(() => {
      dispatch(logOff());
      navigate("/");
    })
    .catch((error) => console.error(error));
  }

  const handleLeaveOrganization = (org: string) => {
    leaveOrganization({user: email, org: org}).unwrap()
    .then(() => refetch())
    .catch((error) => console.error(error));
  }

  const handleChangeUsername = () => {
    changeUsername({email: email, userName: userName}).unwrap()
    .then(() => {
      setUserName("");
      refetch2()})
    .catch((error) => console.error(error))
  }

  return (
    <Page>
      {!isLoading && <div>
        <Container>
        <Avatar src={avatarUrl} />
        <Email>{email}</Email>
        <UserName>{profileInfo.userName}</UserName>
        <Button onClick={handleDeleteProfile}>Delete profile!</Button>
        </Container>
        <Create>
          <span>Enter organization name</span>
          <Input value={name} id="name" onChange={e => setName(e.target.value)}/>
          <ErrorSpan className='error'>{err}</ErrorSpan>
          <Button onClick={handleCreateOrganization}>Create</Button>
        </Create>
        <Create>
          <span>Change username</span>
          <Input value={userName} id="userName" onChange={e => setUserName(e.target.value)}/>
          <ErrorSpan className='error'>{err}</ErrorSpan>
          <Button onClick={handleChangeUsername}>Change</Button>
        </Create>
      </div>}
      <div>
        {
          isSuccess === false? "" : 
          <Table>
            <Table.Head>
              <Table.TR>
                <Table.TH>Organization</Table.TH>
                <Table.TH>Role</Table.TH>
                <Table.TH>Action</Table.TH>
              </Table.TR>
            </Table.Head>
            <Table.Body>
              {
                body.organizations.map((org: any) => (
                  <Table.TR key={org.organization[0]._id}>
                    <Table.TD>
                      {org.role === "admin"? <Link to={`/organization/${org.organization[0]._id}`}>{org.organization[0].name}</Link>: org.organization[0].name}
                    </Table.TD>
                    <Table.TD>
                      {org.role}
                    </Table.TD>
                    <Table.TD>
                      <button onClick={() => handleLeaveOrganization(org.organization[0]._id)}>Leave</button>
                    </Table.TD>
                  </Table.TR>))
              }
            </Table.Body>
          </Table>
        }
      </div>
    </Page>
    
  );
};
