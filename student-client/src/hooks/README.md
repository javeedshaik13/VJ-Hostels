# useCurrentUser Hook

A custom React hook that replaces the UserContext pattern by fetching current user data directly from the API when needed.

## Features

- **Direct API Fetching**: Fetches user data from `/student-api/profile` endpoint
- **Caching**: Implements 5-minute cache to avoid unnecessary API calls
- **Loading States**: Provides loading indicators during data fetching
- **Error Handling**: Handles authentication errors and network failures
- **Token Management**: Automatically manages JWT tokens in localStorage
- **Request Cancellation**: Cancels ongoing requests when component unmounts

## Usage

```javascript
import useCurrentUser from '../hooks/useCurrentUser';

function MyComponent() {
    const { user, loading, error, refreshUser, clearUser, isAuthenticated } = useCurrentUser();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>Please log in</div>;
    }

    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            <p>Roll Number: {user.rollNumber}</p>
            <button onClick={() => refreshUser()}>Refresh Data</button>
            <button onClick={() => clearUser()}>Logout</button>
        </div>
    );
}
```

## Options

The hook accepts an optional options object:

```javascript
const { user } = useCurrentUser({
    enableCache: true,        // Enable/disable caching (default: true)
    refetchOnMount: false,    // Force refetch on component mount (default: false)
    onError: (error) => {     // Custom error handler
        console.error('User fetch error:', error);
    }
});
```

## Return Values

- `user`: Current user object or null
- `loading`: Boolean indicating if data is being fetched
- `error`: Error message string or null
- `refreshUser(forceRefresh)`: Function to manually refresh user data
- `clearUser()`: Function to clear user data and logout
- `updateUser(userData)`: Function to update user data locally
- `isAuthenticated`: Boolean indicating if user is authenticated
- `isCached`: Boolean indicating if current data is from cache

## Migration from UserContext

### Before (UserContext):
```javascript
import { useUser } from '../context/UserContext';

function Component() {
    const { user, login, logout } = useUser();
    // ...
}
```

### After (useCurrentUser):
```javascript
import useCurrentUser from '../hooks/useCurrentUser';

function Component() {
    const { user, updateUser, clearUser } = useCurrentUser();
    // login is replaced with automatic fetching after token storage
    // logout is replaced with clearUser
}
```

## Authentication Flow

1. **Login**: Store only the JWT token in localStorage
2. **Data Fetching**: Hook automatically fetches user data using the token
3. **Caching**: Subsequent requests use cached data for 5 minutes
4. **Token Expiry**: Automatically clears token and redirects on 401 errors
5. **Logout**: Clear token and cached data

## Error Handling

The hook handles several error scenarios:

- **401 Unauthorized**: Clears token and shows "Session expired" message
- **Network Errors**: Shows generic error message
- **No Token**: Returns null user without error
- **Request Cancellation**: Ignores cancelled requests

## Performance Considerations

- **Caching**: Reduces API calls with 5-minute cache
- **Request Cancellation**: Prevents memory leaks from cancelled requests
- **Conditional Fetching**: Only fetches when token is present
- **Batch Updates**: Efficiently updates multiple components using the same data
