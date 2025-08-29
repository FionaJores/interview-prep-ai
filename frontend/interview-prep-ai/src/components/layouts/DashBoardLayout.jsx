import React from 'react'
import { useContext } from 'react'
import { UserContext } from '../../context/userContext'
//import Navbar from './Navbar';

const DashBoardLayout = ({children}) => {
    const { user } = useContext(UserContext);
  return (
    <div>
        {user && <div>{children}</div>}
    </div>
  )
}

export default DashBoardLayout