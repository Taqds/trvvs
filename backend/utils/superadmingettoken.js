// // components/SuperAdmin/getToken.js

// import axios from 'axios';

// const apiUrl = 'http://localhost:5000/api/superadmin';

// export const getToken = async (email, password) => {
//   try {
//     const response = await axios.post(`${apiUrl}/login`, { email, password });
//     const token = response.data.token;

//     if (typeof window !== 'undefined') {
//       localStorage.setItem('superadminToken', token);
//     }

//     return token;
//   } catch (error) {
//     console.error('Error logging in:', error.response.data.message);
//     throw new Error(error.response.data.message || 'Error logging in');
//   }
// };
