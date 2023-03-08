import { InputUnstyled } from "@mui/base";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
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

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoaded] = useState(true);
  const [err, setErr] = useState("");
  const [newUser, setNewUser] = useState<IUser>({
    email: "", role: "user"
  });

  const location = useLocation();
  const id = location.pathname.split("/")[2];

  useEffect(() => {
    fetch(`http://localhost:3000/getUsers?org=${id}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      }
    }).then(res => {
      if(res.ok) {
        return res.json();
      }
      return res.text().then(text => {throw new Error(JSON.parse(text).message)});
    }).then(data => {
      setUsers(data.users);
      setLoaded(false);
    }).catch(err => console.log(err.message));
  }, [id]);

  const handleRoleChange = (user: number, newRole: string) => {
    fetch(`http://localhost:3000/updateMembership`, {
      method: 'POST',
      body: JSON.stringify({user: user, role: newRole, org: id}),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      }
    }).then(res => {
      if(res.ok) {
        return res.json();
      }
      return res.text().then(text => {throw new Error(JSON.parse(text).message)});
    }).then(data => {
      setUsers(data.users);
    }).catch(err => console.log(err.message));
  };

  const handleUserRemove = (user: number) => {
    fetch(`http://localhost:3000/deleteMembership?user=${user}&org=${id}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      }
    }).then(res => {
      if(res.ok) {
        return res.json();
      }
      return res.text().then(text => {throw new Error(JSON.parse(text).message)});
    }).then(data => {
      setUsers(data.users);
    }).catch(err => console.log(err.message));
  };

  const handleUserAdd = () => {
    fetch(`http://localhost:3000/addMembership?org=${id}`, {
      method: 'POST',
      body: JSON.stringify(newUser),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      }
    }).then(res => {
      if(res.ok) {
        return res.json();
      }
      return res.text().then(text => {throw new Error(JSON.parse(text).message)});
    }).then(data => {
      setUsers(data.users);
      setErr("");
    }).catch(err => setErr(err.message));
  };

  return (
    <Container>
      {loading? "" :
      <>
        <h1>Organization: {users[0].organization[0].name}</h1>
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
                users.map(user => (
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
