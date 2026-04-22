# BusiaSoccerMobile Signup Page Fix
Current Directory: BusiaSoccerMobile/

## Plan Steps (Approved by User)

### 1. ✅ Read RN Files (Understanding Complete)
- navigation/AppNavigator.tsx
- screens/LoginScreen.tsx  
- contexts/AuthContext.tsx

### 2. ✅ Create components/Signup.tsx (Web Fix)
- Dedicated registration screen
- Use AuthContext.register()
- Navigate to Login on success

### 3. ✅ Update App.tsx - Added authView state + Signup routing
- Add Stack.Screen name="Signup" component={SignupScreen}

### 4. ⏳ Update screens/LoginScreen.tsx
- Add "Don't have account? Register" → navigation.navigate('Signup')

### 5. ⏳ Test & Run
```
cd BusiaSoccerMobile &amp;&amp; npx expo start --clear
```

### 6. ⏳ Backend Check
- Ensure http://localhost:4000/api/register works

**✅ COMPLETE** - Web signup page fixed with separate routing + link from Login

