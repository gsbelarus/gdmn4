import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { string } from "zod";

interface IUser {
    email: string;
    role: string
}


export const Organization = () => {

  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState<IUser>({
    email: "", role: ""
  })

  const location = useLocation()
  const id = location.pathname.split("/")[2]

  useEffect(() => {
    axios.get(`http://localhost:3000/getUsers?org=${id}`).then(res => setUsers(res.data.users))
  }, [])

  const handleRoleChange = (user: number, newRole: string) => {
    axios.post("http://localhost:3000/updateMembership", {user: user, role: newRole, org: id}).then(res => setUsers(res.data.users))
  };

  const handleUserRemove = (user: number) => {
    axios.get(`http://localhost:3000/deleteMembership?user=${user}&org=${id}`).then(res => setUsers(res.data.users))
  };

  const handleUserAdd = () => {
    axios.post(`http://localhost:3000/addMembership?org=${id}`, newUser).then(res => setUsers(res.data.users))
  };

  return (
    <div>
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user[0]._id}>
              <td>{user.user[0].email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.user[0]._id, e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleUserRemove(user.user[0]._id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        <input type="text" name="email" placeholder="Email" required onChange={e => setNewUser(prev => {
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
        <button onClick={handleUserAdd}>Add user</button>
    </div>
  );
};
