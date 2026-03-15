# HR Profile Photo - Not Available

## Current Status:

HR users do NOT have profile photo functionality. This is by design.

## What HR Users Have:

### Pages Available:
1. **Dashboard** - View statistics and overview
2. **Applications** - Review and manage student applications
3. **Required Skills** - Set company skill requirements

### No Profile/Settings Page:
- HR users don't have a Profile page
- HR users don't have a Settings page
- HR users cannot upload profile photos

## TopNav Display for HR:

HR users see their initials in the avatar (no photo upload option):

```
┌─────────────────────────────┐
│  🔔  [WH] Wipro HR          │
│           Hr                │
└─────────────────────────────┘
```

## Why HR Doesn't Have Profile Photos:

1. **Company Representatives** - HR users represent companies, not individuals
2. **Simplified Interface** - Focus on recruitment tasks, not personal profiles
3. **Security** - Less personal data stored for external users
4. **Role-Based** - HR role is functional, not personal

## What HR Can Do:

### In TopNav Dropdown:
- View "My Account" section
- Access Settings (if page exists)
- Access Profile (if page exists)
- Logout

### Current HR Features:
- View and manage applications
- Update application status
- Add remarks to applications
- Set required skills for company
- Download student resumes
- View dashboard statistics

## Comparison:

| Feature | Admin | Student | HR |
|---------|-------|---------|-----|
| Profile Photo | ✅ Yes | ✅ Yes | ❌ No |
| Profile Page | ✅ Yes | ✅ Yes | ❌ No |
| Settings Page | ✅ Yes | ❌ No | ❌ No |
| Dashboard | ✅ Yes | ✅ Yes | ✅ Yes |
| Applications | ✅ Yes | ✅ Yes | ✅ Yes |

## If You Want to Add HR Profile Photo:

If you want HR users to have profile photos in the future, you would need to:

1. Create HR Profile page (`src/pages/hr/Profile.tsx`)
2. Add profile photo upload functionality
3. Create backend route for HR photo upload
4. Update HR model to include `profilePhotoUrl`
5. Update TopNav to display HR photos

But currently, this is NOT implemented and HR users cannot upload profile photos.

## Summary:

HR users do NOT have profile photo functionality. They only see their initials in the TopNav avatar. This is intentional and by design. HR users focus on recruitment tasks (viewing applications, setting skills, managing candidates) rather than personal profile management.
