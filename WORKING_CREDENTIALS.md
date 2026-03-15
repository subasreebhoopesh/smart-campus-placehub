# Working Login Credentials

## Admin Login
**URL:** http://localhost:8080/admin-login

- **Email:** admin@college.edu
- **Password:** admin123

## HR Login
**URL:** http://localhost:8080/hr-login

### Google HR
- **Email:** hr@google.com
- **Password:** hr123
- **Company:** google
- **Can See:** Applications for Google drives only

### Wipro HR
- **Email:** hr@wipro.com
- **Password:** hr123
- **Company:** wipro
- **Can See:** Applications for Wipro drives only

## Student Login
**URL:** http://localhost:8080/student-login

### Existing Student
- **Email:** sreesuba219.2005@gmail.com
- **Password:** (the password you set during registration)

## Current Database Status

### Companies
- google
- wipro

### Placement Drives
- Google: Software Engineer
- Wipro: IT

### Applications
- Student "subasree" applied to Google (Software Engineer)
- Student "subasree" applied to Wipro (IT)

## Testing HR Applications

### Test Google HR
1. Go to http://localhost:8080/hr-login
2. Login with: hr@google.com / hr123
3. Navigate to "Applications" page
4. You should see 1 application from subasree for Software Engineer role

### Test Wipro HR
1. Go to http://localhost:8080/hr-login
2. Login with: hr@wipro.com / hr123
3. Navigate to "Applications" page
4. You should see 1 application from subasree for IT role

## Creating More HR Accounts

To create HR accounts for other companies:

```bash
cd backend
node create-hr.js <email> <password> <name> <companyName>
```

**Example:**
```bash
node create-hr.js hr@newcompany.com hr123 "New Company HR" "CompanyName"
```

**Note:** The company must exist in the database first (create via Admin UI).

## Checking Database

### Check HR Accounts
```bash
node backend/check-hr.js
```

### Check Applications
```bash
node backend/check-applications.js
```

## Troubleshooting

### HR Login Fails
- Verify HR account exists: `node backend/check-hr.js`
- Check if backend is running on port 3001
- Check browser console for errors
- Verify MongoDB is running

### HR Sees No Applications
- Check if applications exist: `node backend/check-applications.js`
- Verify HR is linked to correct company
- Ensure students have applied to that company's drives
- Check backend console logs

### Student Can't Apply
- Verify student profile is complete (CGPA, branch)
- Check if drive eligibility matches (branch, CGPA)
- Ensure drive status is "upcoming"
- Check if already applied (can't apply twice)

## Next Steps

1. ✅ HR accounts created
2. ✅ Applications exist in database
3. ✅ Login with HR credentials
4. ✅ View applications in HR dashboard
5. ✅ Review student profiles
6. ✅ Shortlist/Select/Reject candidates

## Success!

The system is fully working. HR can now:
- Login with their company-specific credentials
- View all applications for their company
- See complete student profiles with skills
- Update application status
- Add remarks and feedback
