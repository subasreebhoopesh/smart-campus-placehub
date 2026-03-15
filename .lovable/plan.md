
# Smart Placement Management System

A comprehensive college placement portal for managing students, companies, placement drives, and analytics.

## Pages & Features

### 1. **Home Page**
- Hero section showcasing the platform
- Key statistics (total students, companies, placements)
- Quick links for students and admins
- Recent placement highlights

### 2. **Login Page**
- Separate login tabs for Admin and Student
- Clean form with email/password fields
- "Forgot Password" link
- Registration option for new students

### 3. **Admin Dashboard**
- Overview cards (total students, companies, active drives, placement rate)
- Recent activities feed
- Quick action buttons
- Upcoming placement drives calendar

### 4. **Student Dashboard**
- Personal placement status
- Applied jobs and their status
- Upcoming drives matching their eligibility
- Profile completion indicator

### 5. **Student Management Page**
- Searchable and filterable student table
- Add/Edit student modal forms
- Student details: name, roll number, branch, CGPA, skills, placement status
- Export student data functionality
- Bulk actions (approve, mark placed)

### 6. **Company Management Page**
- Company cards/table view
- Add/Edit company modal forms
- Company details: name, industry, job roles, package offered, contact info
- Company visit history

### 7. **Placement Drive Page**
- List of all placement drives (upcoming, ongoing, completed)
- Create new drive form
- Drive details: company, date, eligible branches, CGPA criteria
- Student application tracking per drive
- Drive status management

### 8. **Analytics Dashboard**
- Placement statistics charts:
  - Branch-wise placement rate (bar chart)
  - Monthly placement trends (line chart)
  - Package distribution (pie chart)
  - Year-over-year comparison
- Top recruiting companies
- Average package statistics

### 9. **Reports Page**
- Generate placement reports by year/branch
- Export to PDF/CSV options
- Summary statistics tables
- Custom date range filters

### 10. **Profile & Settings Page**
- User profile editing
- Password change option
- Notification preferences
- System settings (for admin)

## Design & Layout

### Navigation
- **Top Navigation Bar**: Logo, search, notifications, user profile menu
- **Sidebar Menu**: Collapsible with icons and labels for all pages

### Visual Style
- Clean, professional design suitable for educational institutions
- Blue/Indigo primary color scheme
- Card-based layouts for data display
- Responsive design for all screen sizes

### Data Display
- Sample/dummy data for all tables and charts
- Interactive charts using Recharts (already available)
- Sortable and filterable data tables
- Pagination for large lists

## Technical Notes
- Frontend-only with sample data (no backend initially)
- React components with TypeScript
- Tailwind CSS for styling
- Using existing UI components (shadcn/ui)
- Recharts for analytics visualizations
