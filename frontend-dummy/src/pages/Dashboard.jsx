import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [pets, setPets] = useState([]);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPets() {
      try {
        const res = await API.get("/pets");
        setPets(res.data);
      } catch (err) {
        setMsg(err.response?.data?.message || "❌ Failed to load pets");
        if (err.response?.status === 401) navigate("/login");
      }
    }
    fetchPets();
  }, []);

  return (
    <div className="container">
      <h2>Dashboard</h2>
      {msg && <p>{msg}</p>}
      <ul>
        {pets.map((pet) => (
          <li key={pet._id}>{pet.name}</li>
        ))}
      </ul>
    </div>
  );
}
