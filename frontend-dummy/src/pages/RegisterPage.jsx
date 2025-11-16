import { useState } from "react";
import API from "../api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    "confirm-password": "",
    role: "adopter",
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogleLogin = () => {
    // 👉 Redirect to backend Google OAuth URL
    window.location.href = "http://localhost:4000/auth/google";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form["confirm-password"]) {
      setMsg("❌ Passwords do not match");
      return;
    }

    try {
      const { name, email, password, "confirm-password": confirmPassword, role } = form;

      const res = await API.post("/register", {
        name,
        email,
        password,
        confirmPassword,
        role,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setMsg("✅ Registration successful! You can now go to Dashboard.");
      } else {
        setMsg("❌ " + (res.data.msg || "Registration failed"));
      }
    } catch (err) {
      const backendMsg =
        err.response?.data?.message ||
        "❌ Server error during registration";
      setMsg(backendMsg);
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>

      {/* Traditional Register Form */}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <input
          name="confirm-password"
          type="password"
          placeholder="Confirm Password"
          onChange={handleChange}
          required
        />
        <select name="role" onChange={handleChange}>
          <option value="adopter">Adopter</option>
          <option value="giver">Giver</option>
        </select>

        <button type="submit">Register</button>
      </form>

      <hr />

      {/* Google OAuth Button */}
      <button onClick={handleGoogleLogin} style={{ marginTop: "10px" }}>
        Continue with Google
      </button>

      <p>{msg}</p>
    </div>
  );
}
