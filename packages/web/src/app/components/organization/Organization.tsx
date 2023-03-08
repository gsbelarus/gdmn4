import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./organization.css"

interface IUser {
    email: string;
    role: string
}


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
    // axios.get(`http://localhost:3000/getUsers?org=${id}`).then(res => {
    //     setUsers(res.data.users)
    //     setLoaded(false)
    // });
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
    // axios.post("http://localhost:3000/updateMembership", {user: user, role: newRole, org: id}).then(res => setUsers(res.data.users))
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
    // axios.get(`http://localhost:3000/deleteMembership?user=${user}&org=${id}`).then(res => setUsers(res.data.users))
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
            <span className='error'>{err}</span>
          }
        </>
      }
        
    </div>
  );
};
