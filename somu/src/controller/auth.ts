// src/controller/auth.ts
const BACKEND = (import.meta.env.VITE_BACKEND_URL as string) ?? 'http://localhost:8080';
const FRONTEND = (import.meta.env.VITE_FRONTEND_URL as string) ?? 'http://localhost:5173';

/**
 * Start OAuth login by redirecting browser to the backend authorization endpoint.
 * @param registrationId The OAuth2 provider ID (e.g., 'google')
 * @param redirectTo Optional custom redirect URL after successful login
 */
export function login(registrationId = 'google', redirectTo?: string) {
  // Store the current URL to redirect back after login
  const redirectAfterLogin = redirectTo || '/';
  localStorage.setItem('redirectAfterLogin', redirectAfterLogin);

  // The backend will handle the OAuth flow and redirect to the frontend
  const authUrl = `${BACKEND}/oauth2/authorization/${registrationId}`;
  window.location.href = authUrl;
}

/**
 * Handle OAuth2 redirect after successful authentication
 * This should be called from the OAuth2 redirect page
 */
export async function handleOAuthRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  const state = urlParams.get('state');

  if (error) {
    console.error('OAuth error:', error);
    throw new Error(`Authentication failed: ${error}`);
  }

  if (!code) {
    console.error('No authorization code received in the callback');
    throw new Error('No authorization code received. Please try again.');
  }

  try {
    // The backend should handle the code exchange and set the session cookie
    // We'll make a request to the backend to verify the session
    const userInfo = await getUserInfo();

    if (!userInfo) {
      throw new Error('Failed to authenticate with the server');
    }

    // If we have a state with a redirect path, use it, otherwise go to home
    let redirectPath = '/';
    if (state) {
      try {
        const stateObj = JSON.parse(decodeURIComponent(state));
        if (stateObj.from) {
          redirectPath = stateObj.from;
        }
      } catch (e) {
        console.warn('Failed to parse state:', e);
      }
    }

    return redirectPath;
  } catch (error) {
    console.error('OAuth redirect error:', error);
    throw error; // Let the component handle the error
  }
}

export async function logout() {
  try {
    await fetch(`${BACKEND}/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  } catch (e) {
    console.error('Logout failed', e)
  } finally {
    // Redirect to Google logout to clear Google session
    // This will land the user on the Google logout page.
    // Unfortunately, Google doesn't support a reliable "continue" URL for logout.
    window.location.href = 'https://mail.google.com/mail/logout'
  }
}

/**
 * Get currently authenticated user info from backend
 * @returns User info object or null if not authenticated
 */
export async function getUserInfo() {
  try {
    const resp = await fetch(`${BACKEND}/api/user/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (resp.ok) {
      return await resp.json()
    }

    if (resp.status === 401 || resp.status === 403) {
      // Not authenticated or unauthorized
      return null
    }

    throw new Error(`Failed to fetch user info: ${resp.statusText}`)
  } catch (error) {
    console.error('getUserInfo error:', error)
    return null
  }
}

export function requireLogin() {
  login('google')
}
