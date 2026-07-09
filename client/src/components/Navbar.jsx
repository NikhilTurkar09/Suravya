import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import api from "../api/api";
import "./Navbar.css";

function Navbar() {

const navigate=useNavigate();

const{dark,setDark}=useContext(ThemeContext);

const user=JSON.parse(localStorage.getItem("user"));

const[menu,setMenu]=useState(false);
const[count,setCount]=useState(0);

useEffect(()=>{

if(user){
loadNotifications();
}

},[]);

const loadNotifications=async()=>{

try{

const res=await api.get("/notifications");

if(res.data.success){

setCount(
res.data.notifications.filter(
(n)=>!n.isRead
).length
);

}

}catch(err){
console.log(err);
}

};

const logout=()=>{

setMenu(false);

localStorage.clear();

navigate("/");

window.location.reload();

};

return(

<nav className="navbar">

<div
className="logo"
onClick={()=>{
navigate("/");
setMenu(false);
}}
>
🎼 सुराव्य
</div>

<div
className={`nav-links ${menu?"active":""}`}
>

<Link
to="/"
onClick={()=>setMenu(false)}
>
Home
</Link>

<Link
to="/trending"
onClick={()=>setMenu(false)}
>
Trending
</Link>

<Link
to="/top-poets"
onClick={()=>setMenu(false)}
>
Writers
</Link>

{user&&(

<Link
to="/upload"
onClick={()=>setMenu(false)}
>
Publish
</Link>

)}

{user&&(

<Link
to="/profile"
onClick={()=>setMenu(false)}
>
Profile
</Link>

)}

{user&&(

<Link
to="/notifications"
onClick={()=>setMenu(false)}
>

Notifications

{count>0&&(

<span
style={{
background:"#ef4444",
color:"white",
padding:"2px 8px",
borderRadius:"999px",
fontSize:"12px",
marginLeft:"8px",
fontWeight:"700"
}}
>
{count}
</span>

)}

</Link>

)}

{user?.isAdmin&&(

<Link
to="/admin"
onClick={()=>setMenu(false)}
>
Admin
</Link>

)}

{!user?(
<>

<Link
to="/login"
onClick={()=>setMenu(false)}
>
Login
</Link>

<Link
to="/register"
onClick={()=>setMenu(false)}
>
Register
</Link>

</>

):(

<button onClick={logout}>
Logout
</button>

)}

<button
onClick={()=>setDark(!dark)}
>
{dark?"☀️":"🌙"}
</button>

</div>

<div
className="menu-btn"
onClick={()=>setMenu(!menu)}
>
☰
</div>

</nav>

);

}

export default Navbar;