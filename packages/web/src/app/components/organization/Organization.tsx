import { InputUnstyled } from "@mui/base";
import React, {useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { useAddMembershipMutation, useDeleteMembershipMutation, useGetUsersQuery, useUpdateMembershipMutation } from "../../org-api";
import { Button } from "../controls/button";
import { Table } from "../table/table";

interface IUser {
    email: string;
    role: string
}

const Container = styled.div`
  margin-left: 50px;
`;

const Input = styled(InputUnstyled)`
  .MuiInput-input {
    border-radius: 4px;
  }
`;

const Form = styled.div`
  margin-top: 30px;
  display: flex;
  column-gap: 10px;
`;

const ErrorSpan = styled.span`
  color: red;
`;


export const Organization = () => {

  const [err, setErr] = useState("");
  const [newUser, setNewUser] = useState<IUser>({
    email: "", role: "user"
  });

  const location = useLocation();
  const id = location.pathname.split("/")[2];

  const {data: body, isSuccess, refetch} = useGetUsersQuery(id, {pollingInterval: 30000});
  const [addMembership] = useAddMembershipMutation();
  const [deleteMembership] = useDeleteMembershipMutation();
  const [updateMembership] = useUpdateMembershipMutation();

  const handleRoleChange = (user: string, newRole: string) => {
    updateMembership({user: user, role: newRole, org: id}).unwrap()
    .then(() => refetch())
    .catch((error) => console.error(error));
  };

  const handleUserRemove = (user: string) => {
    deleteMembership({user_id: user, org_id: id}).unwrap()
    .then(() => refetch())
    .catch((error) => console.error(error));
  };

  const handleUserAdd = () => {
    addMembership({id: id, newUser}).unwrap()
    .then(() => refetch())
    .catch((error) => {
      setErr(error.data.message)
      console.error(error)
    });
  };

  return (
    <Container>
      {isSuccess === false? "" : 
      <>
        <h1>Organization: {body.users[0].organization[0].name}</h1>
        <Table>
            <Table.Head>
              <Table.TR>
                <Table.TH>Email</Table.TH>
                <Table.TH>Role</Table.TH>
                <Table.TH>Action</Table.TH>
              </Table.TR>
            </Table.Head>
            <Table.Body>
              {
                body.users.map((user: any) => (
                  <Table.TR key={user.user[0]._id}>
                    <Table.TD>
                      {user.user[0].email}
                    </Table.TD>
                    <Table.TD>
                      <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.user[0]._id, e.target.value)}
                      >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      </select>
                    </Table.TD>
                    <Table.TD>
                      <Button onClick={() => handleUserRemove(user.user[0]._id)}>Remove</Button>
                    </Table.TD>
                  </Table.TR>))
              }
            </Table.Body>
          </Table>
        <Form>
        <Input type="text" name="email" placeholder="Email" required onChange={e => setNewUser(prev => {
                return {
                    ...prev, email: e.target.value
                }
            })} />
            <select onChange={e => setNewUser(prev => {
                return {
                    ...prev, role: e.target.value
                }
            })} name="role" required>
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            </select>
            <Button onClick={handleUserAdd}>Add user</Button>
        </Form>
          {
            <ErrorSpan>{err}</ErrorSpan>
          }
        </>
      }
        
    </Container>
  );
};
