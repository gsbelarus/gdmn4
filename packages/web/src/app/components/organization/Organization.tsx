import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { string } from "zod";
import "./organization.css"

interface IUser {
    email: string;
    role: string
}


export const Organization = () => {

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoaded] = useState(true)
  const [err, setErr] = useState(false)
  const [newUser, setNewUser] = useState<IUser>({
    email: "", role: "user"
  })

  const location = useLocation()
  const id = location.pathname.split("/")[2]

  useEffect(() => {
    axios.get(`http://localhost:3000/getUsers?org=${id}`).then(res => {
        setUsers(res.data.users)
        setLoaded(false)
    })
  }, [])

  const handleRoleChange = (user: number, newRole: string) => {
    axios.post("http://localhost:3000/updateMembership", {user: user, role: newRole, org: id}).then(res => setUsers(res.data.users))
  };

  const handleUserRemove = (user: number) => {
    axios.get(`http://localhost:3000/deleteMembership?user=${user}&org=${id}`).then(res => setUsers(res.data.users))
  };

  const handleUserAdd = () => {
    axios.post(`http://localhost:3000/addMembership?org=${id}`, newUser).then(res => {
        setUsers(res.data.users)
        setErr(false)
    }).catch(() => setErr(true))
  };

  return (
    <div className="organizationInfo">
      {loading? "" :
      <>
        <h1>Organization: {users[0].organization[0].name}</h1>
        <table className="scrollTable2">
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
        <div className="addForm">
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
        {
            err? <span className='error'>User with this email doesn't exist!</span> : ""
          }
        </>
      }
        
    </div>
  );
};
