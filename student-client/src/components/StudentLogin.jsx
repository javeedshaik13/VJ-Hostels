import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import img5 from "../assets/1.jpg";
import { FiEye, FiEyeOff } from "react-icons/fi";

const StudentLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { login } = useUser();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/student-api/login`,
        data
      );
      login(response.data.student);
      localStorage.setItem("token", response.data.token);
      alert("Login Successful!");
      navigate("/home");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${img5})` }}>
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Student Login</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                placeholder="Enter your roll number"
                {...register("rollNumber", {
                  required: "Roll number is required",
                })}
                className="responsive-input"
              />
              {errors.rollNumber && (
                <small className="error-message fade-in">
                  {errors.rollNumber.message}
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="responsive-input"
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
              {errors.password && (
                <small className="error-message fade-in">
                  {errors.password.message}
                </small>
              )}
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
