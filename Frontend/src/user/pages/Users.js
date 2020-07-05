import React from 'react'

import UsersList from '../components/UsersList'

const Users = () => {

    const USERS = [
        {id : 'u1', name : 'Rita Ora', image : 'https://images.pexels.com/photos/2169098/pexels-photo-2169098.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260', places : 3}
    ]

    return(
        <div>
            <UsersList items = {USERS} />
        </div>
    )
}

export default Users;