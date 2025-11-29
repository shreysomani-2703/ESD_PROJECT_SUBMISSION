import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserInfo } from '../controller/auth';

export default function OAuthRedirect() {
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check for error in URL parameters
        const params = new URLSearchParams(location.search);
        const error = params.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Verify the user is authenticated
        const user = await getUserInfo();
        if (!user) {
          throw new Error('Authentication failed: No user data received');
        }

        // Redirect to the stored URL or home page
        const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);

      } catch (err) {
        console.error('OAuth redirect error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Redirect to home after showing error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [location.search, navigate]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <p>Redirecting to home page...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h2>Signing you in...</h2>
      <p>Please wait while we complete your authentication.</p>
    </div>
  );
}