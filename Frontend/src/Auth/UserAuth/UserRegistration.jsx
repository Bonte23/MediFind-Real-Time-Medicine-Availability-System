import React, { useState } from 'react'
import docImage from '../../assets/DocImg3.png'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
const UserRegistration = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    age: '',
    gender: '',
    password: ''
  });
  
  const [errors, setErrors] = useState('');
  const navigate = useNavigate();
  const handleChange = (e) =>{
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  }
  const validate = () => {
    const errors = {};
    if(!formData.fullname.trim()){
      errors.fullname = 'Full Name is required';
    }
    if(!formData.email.trim()){
      errors.email = 'Email is required';
    } else if(!/\S+@\S+\.\S+/.test(formData.email)){
      errors.email = 'Email address is invalid';
    }
    if(!formData.age.trim()){
      errors.age = 'Age is required';
    } else if(isNaN(formData.age) || formData.age < 0){
      errors.age = 'Age must be a valid number';
    }
    if (!formData.gender || formData.gender === "") {
      errors.gender = 'Gender is required';
    }
    return errors;
  }
  const handleSubmit = async (e) =>{
    e.preventDefault();
    const validationErrors = validate();
    if(Object.keys(validationErrors).length > 0){
      setErrors(validationErrors);
      return;
    }
    try{
      const response = await axios.post('http://localhost:5143/api/user/register', formData);
      if(response.status === 200){
        alert('Registration successful');
        navigate('/userlogin');
      }
    }
    catch(error){
      console.error('Error during registration:', error);
      setErrors({ server: 'Registration failed. Please try again later.' });
    }
  }
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className="bg-card p-8 rounded-xl shadow-lg flex flex-col md:flex-row w-full max-w-4xl bg-[#E8F9FF]">
        {/* Form Section */}
        <div className='w-full md:w-1/2'>
          <h2 className="text-2xl font-bold mb-6 text-primary p-4">Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              className="border border-[#007AFF] p-3 w-full rounded-md mb-4 bg-[#FBFBFB] mb-8"
              value={formData.fullname}
              onChange={handleChange}
              name="fullname"
              required
            />
            {errors.fullname && <p className="text-red-600 text-center text-sm mb-2">{errors.fullname}</p>}
            <input
              type="email"
              placeholder="Email Address"
              className="border border-[#007AFF] p-3 w-full rounded-md mb-4 bg-[#FBFBFB] mb-8"
              value={formData.email}
              onChange={handleChange}
              name="email"
              required
            />
            {errors.email && <p className="text-red-600 text-center text-sm mb-2">{errors.email}</p>}
            <input
              type="text"
              placeholder="Age"
              className="border border-[#007AFF] p-3 w-full rounded-md mb-4 bg-[#FBFBFB] mb-8"
              value={formData.age}
              onChange={handleChange}
              name="age"
              required
            />
            {errors.age && <p className="text-red-600 text-center text-sm mb-2">{errors.age}</p>}
            <select
              className="border border-[#007AFF] p-3 w-full rounded-md mb-4 bg-[#FBFBFB] mb-8"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p className="text-red-600 text-center text-sm mb-2">{errors.gender}</p>}
            <input
              type="password"
              placeholder="Password"
              className="border border-[#007AFF] p-3 w-full rounded-md mb-4 bg-[#FBFBFB] mb-8"
              value={formData.password}
              onChange={handleChange}
              name="password"
              required
            />
            {errors.password && <p className="text-red-600  text-center text-sm mb-2">{errors.password}</p>}
            {errors.server && <p className="text-red-600 text-center text-sm mb-2">{errors.server}</p>}
            <div className="flex justify-center mb-8">
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 w-full rounded-md hover:bg-blue-700 transition"
              >
                Sign up
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm">
            Already have an account? <a href="/userlogin" className="text-primary underline">Login</a>
          </p>
        </div>
        <div className="hidden md:flex items-center justify-center w-1/2">
          <img src={docImage} alt="Doctor" className="max-w-full" />
        </div>
      </div>
    </div>
  )
}

export default UserRegistration
