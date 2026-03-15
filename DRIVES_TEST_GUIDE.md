# Drives & Companies Integration - Quick Test Guide

## 🚀 Quick Start
The development server is already running at: **http://localhost:8080/**

## ✅ Testing Steps

### Step 1: Test Companies Page
1. Navigate to **Admin Dashboard → Companies**
2. Click **"Add Company"** button
3. Fill in the form:
   - Company Name: "Tesla" (required)
   - Industry: "Automotive/Technology" (required)
   - Website: "https://tesla.com"
   - Contact Person: "Elon Musk"
   - Contact Email: "hr@tesla.com" (required)
   - Contact Phone: "+1 650-681-5000"
   - Job Roles: "Software Engineer, Mechanical Engineer, Electrical Engineer"
   - Min Package: 1800000
   - Max Package: 3500000
4. Click **"Add Company"**
5. ✅ Verify: Toast notification "Company Added!"
6. ✅ Verify: Tesla appears in the companies grid

### Step 2: Test Drives Page - Company Dropdown
1. Navigate to **Admin Dashboard → Drives**
2. Click **"Create Drive"** button
3. Click on the **Company dropdown**
4. ✅ **VERIFY: Tesla appears in the dropdown list!**
5. ✅ **VERIFY: All other companies from Companies page are also listed**

### Step 3: Create a Drive with New Company
1. In the Create Drive dialog:
   - **Company**: Select "Tesla"
   - **Job Role**: "Software Engineer"
   - **Date**: Select any future date
   - **Package**: 2500000
   - **Min CGPA**: 7.5
   - **Eligible Branches**: Check CSE, IT, ECE (multiple selection)
   - **Description**: "Tesla is hiring software engineers for their Autopilot team"
2. Click **"Create Drive"**
3. ✅ Verify: Toast notification "Drive Created!"
4. ✅ Verify: Tesla drive appears in the drives list
5. ✅ Verify: Drive shows "Tesla" as company name
6. ✅ Verify: Selected branches (CSE, IT, ECE) appear as badges

### Step 4: Test Edit Drive
1. Find the Tesla drive in the list
2. Click the three dots (⋮) menu
3. Select **"Edit"**
4. ✅ Verify: Form is pre-filled with existing data
5. ✅ Verify: Company dropdown shows "Tesla" selected
6. ✅ Verify: Branches checkboxes show correct selections
7. Change **Job Role** to "Senior Software Engineer"
8. Change **Package** to 3000000
9. Click **"Save Changes"**
10. ✅ Verify: Toast notification "Drive Updated!"
11. ✅ Verify: Drive shows updated information

### Step 5: Test View Drive
1. Click the three dots (⋮) on Tesla drive
2. Select **"View Details"**
3. ✅ Verify: Dialog shows complete drive information
4. ✅ Verify: All fields are displayed correctly
5. ✅ Verify: Branches shown as badges
6. ✅ Verify: Status badge displayed
7. Click **"Close"**

### Step 6: Test Multi-Branch Selection
1. Click **"Create Drive"**
2. Select any company
3. In **Eligible Branches** section:
   - ✅ Verify: All 6 branches shown (CSE, IT, ECE, EEE, MECH, CIVIL)
   - ✅ Verify: Can check multiple branches
   - ✅ Verify: Can uncheck branches
   - Check CSE, IT, ECE, EEE (4 branches)
4. Fill other required fields
5. Click **"Create Drive"**
6. ✅ Verify: All 4 selected branches appear as badges on the drive card

### Step 7: Test Delete Drive
1. Click the three dots (⋮) on any drive
2. Select **"Delete"**
3. ✅ Verify: Confirmation dialog appears
4. ✅ Verify: Company name shown in confirmation message
5. Click **"Delete"**
6. ✅ Verify: Toast notification "Drive Deleted!"
7. ✅ Verify: Drive removed from list

### Step 8: Test Search and Filter
1. In the search box, type "Tesla"
2. ✅ Verify: Only Tesla drives shown
3. Clear search
4. Use **Status filter** dropdown
5. Select **"Upcoming"**
6. ✅ Verify: Only upcoming drives shown
7. Select **"All Status"**
8. ✅ Verify: All drives shown again

### Step 9: Test Integration Flow
1. Go to **Companies page**
2. Add a new company: "SpaceX"
   - Industry: "Aerospace"
   - Contact Email: "hr@spacex.com"
3. Click **"Add Company"**
4. Immediately go to **Drives page**
5. Click **"Create Drive"**
6. Open company dropdown
7. ✅ **VERIFY: SpaceX appears in the dropdown immediately!**
8. Select SpaceX and create a drive
9. ✅ Verify: Drive created successfully with SpaceX

### Step 10: Test Form Validation
1. Click **"Create Drive"**
2. Leave all fields empty
3. Click **"Create Drive"**
4. ✅ Verify: Toast error "Missing Fields"
5. Fill only Company
6. Click **"Create Drive"**
7. ✅ Verify: Toast error "Missing Fields"
8. Fill Company, Job Role, and Date
9. Click **"Create Drive"**
10. ✅ Verify: Drive created successfully

## 🎯 Key Features to Verify

### ✅ Real-time Sync
- Companies added in Companies page appear immediately in Drives dropdown
- No page refresh needed

### ✅ Multi-Select Branches
- Can select multiple branches using checkboxes
- Selected branches shown as badges on drive cards
- Scrollable checkbox list for better UX

### ✅ Full CRUD Operations
- **Create**: Add new drives with company selection
- **Read**: View all drives with search and filter
- **Update**: Edit existing drives
- **Delete**: Remove drives with confirmation

### ✅ User Feedback
- Toast notifications for all actions
- Success messages in green
- Error messages in red
- Confirmation dialogs for destructive actions

### ✅ Data Validation
- Required fields marked with *
- Email validation
- Number validation for package and CGPA
- Date picker for drive date

## 🐛 Common Issues & Solutions

### Issue: Company not appearing in dropdown
**Solution**: Make sure you added the company in the Companies page first

### Issue: Branches not saving
**Solution**: Make sure to check at least one branch checkbox before creating drive

### Issue: Form not submitting
**Solution**: Check that all required fields (Company, Job Role, Date) are filled

### Issue: Changes not persisting after refresh
**Solution**: This is expected - data is stored in session state. Will persist after backend integration.

## 📝 Notes

- All data persists during the session
- Data resets on page refresh (until backend is connected)
- Company dropdown shows companies in the order they were added
- Drives are sorted by date
- Status badges: Blue (Upcoming), Orange (Ongoing), Green (Completed)

## ✨ Success Criteria

All tests pass if:
1. ✅ Companies added in Companies page appear in Drives dropdown
2. ✅ Can create drives with selected company
3. ✅ Can select multiple branches
4. ✅ Can edit, view, and delete drives
5. ✅ Toast notifications appear for all actions
6. ✅ Form validation works correctly
7. ✅ Search and filter work properly
8. ✅ All dialogs open and close correctly

## 🎉 Expected Result

You should be able to:
- Add a company in Companies page
- Immediately see it in Drives page dropdown
- Create a drive with that company
- Edit the drive details
- View complete drive information
- Delete the drive
- All with proper validation and user feedback!
