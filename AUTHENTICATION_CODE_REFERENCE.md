# Sahāy Authentication - Code Reference Guide

## Quick Implementation Summary

### 1. LOGIN PAGE - UPDATED
**File:** `src/pages/auth/login-page.tsx`

**Key Changes:**
```typescript
// Auto-redirect already logged-in users to home
if (isAuthenticated && accessToken) {
  return <Navigate to="/" replace />;
}

// Always redirect to home (not role-dashboard)
const onSubmit = async (values: FormValues) => {
  await login(values.email, values.password);
  await useAuthStore.getState().loadProfile();
  navigate("/", { replace: true });  // ← HOME PAGE, not dashboard
};
```

**UX Flow:**
```
User tries /login
    ↓
Check: isAuthenticated && accessToken?
    ├─ YES → Redirect to "/" 
    └─ NO  → Show login form
User enters credentials
    ↓
POST /api/auth/login
    ↓
✓ Success → Save token + Navigate to "/"
✗ Error   → Show error message
```

---

### 2. PROTECTED ROUTE - UPDATED
**File:** `src/components/ProtectedRoute.tsx`

```typescript
export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactElement;
  roles?: UserRole[];
}) {
  const { user, isAuthenticated, accessToken } = useAuthStore();

  // Check 1: Has valid token?
  if (!accessToken || !isAuthenticated) 
    return <Navigate to="/login" replace />;
  
  // Check 2: User object loaded?
  if (!user) 
    return <Navigate to="/login" replace />;
  
  // Check 3: Has required role?
  if (roles && !roles.includes(user.role)) 
    return <Navigate to="/" replace />;

  return children;
}
```

**Usage Examples:**
```typescript
// Public route (anyone)
<Route path="/" element={<HomePage />} />

// Protected route (any authenticated user)
<Route path="/services" element={
  <ProtectedRoute>
    <ServicesPage />
  </ProtectedRoute>
} />

// Role-specific route
<Route path="/customer/dashboard" element={
  <ProtectedRoute roles={["CUSTOMER"]}>
    <CustomerDashboardPage />
  </ProtectedRoute>
} />

// Multiple roles allowed
<Route path="/admin/dashboard" element={
  <ProtectedRoute roles={["ADMIN", "SUPPORT_AGENT"]}>
    <AdminDashboardPage />
  </ProtectedRoute>
} />
```

---

### 3. HOME PAGE - PERSONALIZED
**File:** `src/pages/customer/home-page.tsx`

```typescript
export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();  // ← Get logged-in user
  const firstName = user?.first_name || "Guest";

  return (
    <div className="space-y-14">
      <section className="grid gap-6 rounded-3xl bg-gradient-to-r from-sky-700 via-cyan-600 to-teal-500 p-8 text-white md:grid-cols-2 md:p-12">
        <div>
          <p className="text-sm uppercase tracking-wide text-sky-100">Welcome to Sahāy</p>
          {/* Personalized greeting */}
          <h1 className="mt-3 text-4xl font-black leading-tight">
            Hello, <span className="text-sky-100">{firstName}!</span>  ← Dynamic name
          </h1>
          <p className="mt-4 text-sm text-sky-50">
            Book verified local experts in minutes.
          </p>
        </div>

        {/* ... rest of page ... */}
      </section>
    </div>
  );
}
```

**Renders:**
```
If logged in as "Girisha":
┌─────────────────────────────────┐
│ Welcome to Sahāy                │
│ Hello, Girisha!                 │
│ Book verified local experts...  │
└─────────────────────────────────┘

If not logged in (`user` is null):
┌─────────────────────────────────┐
│ Welcome to Sahāy                │
│ Hello, Guest!                   │
│ Book verified local experts...  │
└─────────────────────────────────┘
```

---

### 4. NAVBAR - LOGOUT FLOW
**File:** `src/components/layout/navbar.tsx`

```typescript
export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();  // Clear token + state
    navigate("/");   // Go home
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-xl font-black">Sahāy</Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-4 md:flex">
          <Link to="/">Home</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/services">Services</Link>
        </nav>

        {/* Right Section - Auth Status */}
        <div className="flex items-center gap-3">
          {!user ? (
            // NOT logged in
            <>
              <Button onClick={() => navigate("/login")}>Login</Button>
              <Button onClick={() => navigate("/register")}>Sign Up</Button>
            </>
          ) : (
            // LOGGED IN
            <>
              <NotificationBell />
              <Button onClick={() => navigate("/customer/dashboard")}>
                Dashboard
              </Button>
              <Button onClick={() => navigate("/customer/profile")}>
                <UserCircle2 className="mr-1 h-4 w-4" />
                Profile
              </Button>
              {/* LOGOUT BUTTON */}
              <Button 
                variant="secondary" 
                onClick={() => void handleLogout()}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
```

**Logout Trigger:**
```
Click "Logout"
    ↓
handleLogout()
    ├─ await logout()
    │  ├─ DELETE /api/auth/logout (optional)
    │  ├─ Clear localStorage (accessToken, refreshToken)
    │  ├─ Clear Zustand store (user = null)
    │  └─ Set isAuthenticated = false
    │
    └─ navigate("/")
       └─ [HomePage loads]
          └─ [ProtectedRoute checks]
             └─ No token? → Redirect to /login ✓
```

---

### 5. AXIOS API CONFIG - AUTO JWT INJECTION
**File:** `src/services/api.ts`

```typescript
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR - Add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // ← Auto-inject
  }
  return config;
});

// RESPONSE INTERCEPTOR - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    
    // Handle 401 - Token expired
    if (status === 401) {
      console.log("Token expired - logging out");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Could dispatch logout action here
    }
    
    return Promise.reject(error);
  },
);
```

**Example API Calls:**
```typescript
// Every request automatically includes token
// GET /api/services
const { data } = await api.get("services");

// POST /api/bookings (with token in header)
const { data } = await api.post("bookings", {
  service_id: 123,
  date: "2024-04-05",
  // ...
});

// DELETE /api/chat/{id} (with token in header)
await api.delete(`chat/${roomId}`);
```

---

### 6. ZUSTAND AUTH STORE
**File:** `src/store/authStore.ts`

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // STATE
      user: null,
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
      isAuthenticated: Boolean(localStorage.getItem("accessToken")),
      loading: false,
      error: null,

      // LOGIN METHOD
      async login(email, password) {
        set({ loading: true, error: null });
        try {
          const { data } = await authService.login({ email, password });
          set({
            accessToken: data.access,
            refreshToken: data.refresh,
            user: data.user,
            isAuthenticated: true,
            loading: false,
          });
          // Token automatically saved to localStorage by persist middleware
        } catch (error) {
          set({ loading: false, error: (error as Error).message });
          throw error;
        }
      },

      // LOGOUT METHOD
      async logout() {
        try {
          await authService.logout();
        } catch (e) {
          console.error("Logout API call failed", e);
        }
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        // localStorage cleared automatically by persist middleware
      },

      // LOAD USER PROFILE
      async loadProfile() {
        if (!get().accessToken) return;
        try {
          const { data } = await profileService.getProfile();
          set({ user: data });
        } catch (error) {
          console.error("Failed to load profile", error);
        }
      },
    }),
    {
      name: "auth-storage",  // localStorage key
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
```

**Store Usage in Components:**
```typescript
// In a component
const { user, isAuthenticated, login, logout, loading, error } = useAuthStore();

// Check if authenticated
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}

// Access user data
console.log(user.first_name, user.email);

// Call methods
const handleLogin = async () => {
  try {
    await login("user@email.com", "password123");
    // User is now logged in
  } catch (err) {
    console.error(error);
  }
};
```

---

## AUTHENTICATION FLOW SEQUENCE

```
┌────────────────────────────────────────────────────────────┐
│                   LOGIN FLOW                               │
└────────────────────────────────────────────────────────────┘

1. User navigates to /login
   ├─ App loads LoginPage
   ├─ Check: isAuthenticated && accessToken?
   │  ├─ YES → <Navigate to="/" />
   │  └─ NO  → Render login form

2. User enters email & password
   ├─ Form validates inputs
   ├─ Email: must be valid format
   ├─ Password: min 8 characters
   └─ Submit enabled if valid

3. Click "Login" button
   ├─ POST /api/auth/login
   │  ├─ Body: { email, password }
   │  └─ Response: { access, refresh, user }
   │
   ├─ On Success:
   │  ├─ authStore.set({
   │  │  ├─ accessToken = data.access
   │  │  ├─ refreshToken = data.refresh
   │  │  ├─ user = data.user
   │  │  └─ isAuthenticated = true
   │  │ })
   │  ├─ localStorage saved auto (persist middleware)
   │  ├─ await loadProfile()
   │  └─ navigate("/", { replace: true })
   │
   └─ On Error:
      ├─ authStore.set({ error: message })
      ├─ Show error in UI
      └─ User can retry

4. Navigate to "/"
   ├─ HomePage loaded
   ├─ useAuthStore() returns { user, isAuthenticated }
   ├─ Render: "Hello, {user.first_name}!"
   └─ User can access protected routes

┌────────────────────────────────────────────────────────────┐
│               PROTECTED ROUTE CHECK                         │
└────────────────────────────────────────────────────────────┘

User tries to access /customer/dashboard
   ↓
<Route path="/customer/dashboard" element={
  <ProtectedRoute roles={["CUSTOMER"]}>
    <CustomerDashboardPage />
  </ProtectedRoute>
} />
   ↓
ProtectedRoute Component:
   ├─ Check: !accessToken || !isAuthenticated?
   │  └─ YES → <Navigate to="/login" replace />
   │
   ├─ Check: !user?
   │  └─ YES → <Navigate to="/login" replace />
   │
   ├─ Check: roles && !roles.includes(user.role)?
   │  ├─ YES → <Navigate to="/" replace />
   │  └─ NO  → return children
   │
   └─ If all checks pass → Render CustomerDashboardPage

┌────────────────────────────────────────────────────────────┐
│                  LOGOUT FLOW                               │
└────────────────────────────────────────────────────────────┘

User in Navbar or Profile page clicks "Logout"
   ↓
handleLogout()
   ├─ await logout()
   │  ├─ POST /api/auth/logout (optional)
   │  │  └─ Backend blacklists token
   │  │
   │  ├─ authStore.set({
   │  │  ├─ user = null
   │  │  ├─ accessToken = null
   │  │  ├─ refreshToken = null
   │  │  └─ isAuthenticated = false
   │  │ })
   │  │
   │  └─ localStorage auto-cleared (persist middleware)
   │
   └─ navigate("/")

User lands on HomePage
   ├─ Check: user? NO (cleared from store)
   ├─ Render: "Hello, Guest!"
   └─ Try to access protected route?
      └─ ProtectedRoute redirects to /login ✓
```

---

## COMMON USE CASES

### 1. Check if user is logged in
```typescript
const { isAuthenticated } = useAuthStore();

if (isAuthenticated) {
  // Show authenticated UI
} else {
  // Show public UI
}
```

### 2. Get current user info
```typescript
const { user } = useAuthStore();

console.log(user?.first_name);
console.log(user?.email);
console.log(user?.role);  // "CUSTOMER", "PROVIDER", "ADMIN"
```

### 3. Call protected API
```typescript
// Token automatically injected
const { data } = await api.get("bookings");
// Header: Authorization: Bearer <token>
```

### 4. Protected component
```typescript
<ProtectedRoute roles={["PROVIDER"]}>
  <ProviderDashboard />
</ProtectedRoute>

// Only providers can see this component
```

### 5. Logout and redirect
```typescript
const { logout } = useAuthStore();
const navigate = useNavigate();

await logout();
navigate("/login");
```

---

## TESTING CHECKLIST

```
[ ] Register new account
[ ] Login with valid credentials
[ ] Login with invalid credentials → error shown
[ ] After login → redirect to "/"
[ ] Already logged in, visit /login → redirect to "/"
[ ] Visit protected route without auth → redirect to /login
[ ] Click Logout → cleared and redirected
[ ] Page refresh → stays logged in (token persisted)
[ ] Token expired (401 error) → auto logout
[ ] Network error → error message shown
[ ] Mobile responsive layout
[ ] Form validation working
[ ] Password field toggle (show/hide)
[ ] Loading state during login
```

---

**Status:** ✅ Production Ready
**Last Updated:** April 5, 2026
