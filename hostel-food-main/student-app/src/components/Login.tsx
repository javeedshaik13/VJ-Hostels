import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { API_ENDPOINTS, logger } from '../config/config';

const GOOGLE_CLIENT_ID = '522460567146-ubk3ojomopil8f68hl73jt1pj0jbbm68.apps.googleusercontent.com';

type LoginProps = {
  onLogin: (studentData: any, userData: any) => void;
};

export default function Login({ onLogin }: LoginProps) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={async credentialResponse => {
          try {
            logger.log('Attempting login with API endpoint:', API_ENDPOINTS.STUDENT_LOGIN);
            const res = await axios.post(API_ENDPOINTS.STUDENT_LOGIN, {
              credential: credentialResponse.credential,
            });
            
            const studentData = res.data;
            if (studentData.studentId && studentData.rollNumber) {
              // Parse user info from the credential payload
              const payload = JSON.parse(atob(credentialResponse.credential!.split('.')[1]));
              const userData = {
                name: payload.name,
                email: payload.email,
                picture: payload.picture
              };
              
              // Set cookies
              document.cookie = `studentId=${studentData.studentId}; path=/`;
              document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/`;
              
              onLogin(studentData, userData);
            } else {
              alert('Student not found in the system');
            }
          } catch (error: any) {
            logger.error('Login error:', error);
            alert('Login failed: ' + (error.response?.data?.error || 'Please try again'));
          }
        }}
        onError={() => {
          alert('Login Failed. Please try again.');
        }}
      />
    </GoogleOAuthProvider>
  );
}
