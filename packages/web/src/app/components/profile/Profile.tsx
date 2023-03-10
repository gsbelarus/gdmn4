import { useEffect, useState } from 'react';
import styled from 'styled-components';
import InputUnstyled from '@mui/base/InputUnstyled';
import { Button } from '../controls/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { logOff } from '../../features/security/user';
import { Table } from '../table/table';
import { useCreateOrganizationMutation, useDeleteProfileMutation, useGetOrganizationsQuery, useLeaveOrganizationMutation } from '../../profile-api';

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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {data: body, isSuccess, refetch} = useGetOrganizationsQuery(email, {refetchOnMountOrArgChange: true, pollingInterval: 10000});
  const [createOrganization] = useCreateOrganizationMutation();
  const [leaveOrganization] = useLeaveOrganizationMutation();
  const [deleteProfile] = useDeleteProfileMutation();

  const handleCreateOrganization = async () => {
    await createOrganization({name: name, email: email});
    refetch();
};

  const handleDeleteProfile = async () => {
    await deleteProfile(email);
    dispatch(logOff());
    navigate("/");
  }

  const handleLeaveOrganization = async (org: string) => {
    await leaveOrganization({user: email, org: org});
    refetch();
  }

  return (
    <Page>
      <div>
        <Container>
        <Avatar src={avatarUrl} />
        <Email>{email}</Email>
        <Bio>This is a user</Bio>
        <Button onClick={handleDeleteProfile}>Delete profile!</Button>
        </Container>
        <Create>
          <span>Enter organization name</span>
          <Input value={name} id="name" onChange={e => setName(e.target.value)}/>
          <ErrorSpan className='error'>{err}</ErrorSpan>
          <Button onClick={handleCreateOrganization}>Create</Button>
        </Create>
      </div>
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
                body.organizations.map(org => (
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
