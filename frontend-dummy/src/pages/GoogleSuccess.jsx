import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    console.log(token);

    if (token) {
      // Save token to localStorage
      localStorage.setItem("token", token);

      // Redirect user to dashboard
      navigate("/dashboard");
    }
  }, []);

  return <div>Logging you in with Google...</div>;
}
