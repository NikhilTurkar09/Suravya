import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PoemDetail from "./pages/PoemDetail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TopPoets from "./pages/TopPoets";
import UploadPoem from "./pages/UploadPoem";
import EditPoem from "./pages/EditPoem";
import WriterProfile from "./pages/WriterProfile";
import TrendingPoems from "./pages/TrendingPoems";
import Navbar from "./components/Navbar";
import Notifications from "./pages/Notifications";
import AdminPanel from "./pages/AdminPanel";
import TopWriters from "./pages/TopPoets";
function App() {
  return (
    <BrowserRouter>
<Navbar />
<Routes>
        <Route path="/" element={<Home />} />
        <Route path="/poem/:id" element={<PoemDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/top-poets" element={<TopPoets />} />
        <Route path="/upload" element={<UploadPoem />} />
        <Route path="/edit/:id" element={<EditPoem />}/>
        <Route path="/writer/:name"element={<WriterProfile />} />
        <Route path="/trending" element={<TrendingPoems />} />
        <Route path="/notifications" element={<Notifications />}/>
        <Route path="/admin"element={<AdminPanel />}/>
        <Route path="/top-writers" element={<TopPoets/>}/>
      </Routes>
    </BrowserRouter>
  );
}
export default App;