import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await api.post("/register", {
      name,
      email,
      password,
    });

    if (!res.data.success) {
      alert(res.data.message);
      return;
    }

    alert("Registration Successful ✅");
    navigate("/login");
  } catch (err) {
    alert("Server Error");
  }
};

  return (
    <div style={{ padding: "40px" }}>
      <h1>Register</h1>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleRegister}>
        Register
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/login")}>
        Already have an account?
      </button>
    </div>
  );
}

export default Register;