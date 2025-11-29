import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { logout } from '../controller/auth';

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-container" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Unauthorized Access</h1>
            <p>You are not authorized to access this application.</p>
            <p>Only authorized users can log in.</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                <button
                    onClick={() => logout()}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Logout from Google
                </button>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
