# 🎨 UI Quick Reference - Copy & Paste Ready

## 🚀 Quick Apply Guide

Use these classes to instantly make your components professional!

---

## 📦 Professional Cards

### Basic Card
```jsx
<Card className="card-hover shadow-professional">
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Gradient Header Card
```jsx
<Card className="card-hover animate-fade-in">
  <CardHeader className="gradient-primary text-white p-6">
    <h3 className="text-2xl font-bold">Dashboard</h3>
  </CardHeader>
  <CardContent className="p-6">
    Content
  </CardContent>
</Card>
```

### Glass Effect Card
```jsx
<Card className="glass-effect card-hover backdrop-blur-xl">
  <CardContent className="p-6">
    Modern glass effect
  </CardContent>
</Card>
```

---

## 🔘 Professional Buttons

### Primary Action Button
```jsx
<Button className="button-hover gradient-primary text-white px-8 py-3">
  Apply Now
</Button>
```

### Secondary Button
```jsx
<Button variant="outline" className="button-hover hover-lift">
  Cancel
</Button>
```

### Success Button
```jsx
<Button className="button-hover gradient-success text-white">
  Approve
</Button>
```

### Danger Button
```jsx
<Button className="button-hover gradient-danger text-white">
  Reject
</Button>
```

---

## 🏷️ Status Badges

```jsx
<Badge className="status-success animate-scale-in">Approved</Badge>
<Badge className="status-warning animate-scale-in">Pending</Badge>
<Badge className="status-danger animate-scale-in">Rejected</Badge>
<Badge className="status-info animate-scale-in">New</Badge>
```

---

## 📊 Dashboard Stats Cards

```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <Card className="card-hover animate-fade-in">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Students</p>
          <h3 className="text-3xl font-bold text-primary">1,234</h3>
        </div>
        <Users className="h-10 w-10 text-primary" />
      </div>
    </CardContent>
  </Card>
  
  {/* Repeat for other stats */}
</div>
```

---

## 📝 Form Inputs

### Professional Input
```jsx
<Input 
  className="transition-smooth focus:ring-2 focus:ring-primary" 
  placeholder="Enter name"
/>
```

### Textarea with Animation
```jsx
<Textarea 
  className="transition-smooth focus:ring-2 focus:ring-primary min-h-[120px]"
  placeholder="Enter description"
/>
```

---

## 📋 Data Tables

### Professional Table
```jsx
<div className="rounded-lg border shadow-professional overflow-hidden">
  <Table>
    <TableHeader className="bg-muted">
      <TableRow>
        <TableHead className="font-semibold">Name</TableHead>
        <TableHead className="font-semibold">Status</TableHead>
        <TableHead className="font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-muted/50 transition-smooth">
        <TableCell>John Doe</TableCell>
        <TableCell>
          <Badge className="status-success">Active</Badge>
        </TableCell>
        <TableCell>
          <Button size="sm" className="button-hover">View</Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

---

## 🔔 Notifications/Toasts

### Success Notification
```jsx
<div className="rounded-lg p-4 bg-green-50 border border-green-200 animate-slide-in-right">
  <div className="flex items-center gap-3">
    <CheckCircle className="text-green-600" />
    <div>
      <h4 className="font-semibold text-green-900">Success!</h4>
      <p className="text-green-700">Operation completed successfully</p>
    </div>
  </div>
</div>
```

### Error Notification
```jsx
<div className="rounded-lg p-4 bg-red-50 border border-red-200 animate-shake">
  <div className="flex items-center gap-3">
    <XCircle className="text-red-600" />
    <div>
      <h4 className="font-semibold text-red-900">Error!</h4>
      <p className="text-red-700">Something went wrong</p>
    </div>
  </div>
</div>
```

---

## 📱 Mobile Responsive Components

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="card-hover mobile-full">
    <CardContent className="p-4 md:p-6">
      Responsive card
    </CardContent>
  </Card>
</div>
```

---

## 💫 Loading States

### Skeleton Loader
```jsx
<div className="space-y-4">
  <div className="skeleton h-12 w-full rounded-lg" />
  <div className="skeleton h-32 w-full rounded-lg" />
  <div className="skeleton h-8 w-3/4 rounded-lg" />
</div>
```

### Spinner
```jsx
<div className="flex items-center justify-center p-8">
  <div className="spinner border-primary" />
</div>
```

### Loading Button
```jsx
<Button disabled className="opacity-70">
  <div className="spinner border-white mr-2" />
  Loading...
</Button>
```

---

## 🎭 Modal/Dialog

### Professional Dialog
```jsx
<Dialog>
  <DialogContent className="animate-scale-in">
    <DialogHeader className="gradient-primary text-white -m-6 mb-6 p-6 rounded-t-lg">
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <p>Are you sure you want to proceed?</p>
    </div>
    <DialogFooter>
      <Button variant="outline" className="button-hover">
        Cancel
      </Button>
      <Button className="button-hover gradient-primary text-white">
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 🎨 Page Headers

### Professional Page Header
```jsx
<div className="gradient-primary text-white p-8 rounded-lg mb-6 animate-fade-in">
  <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
  <p className="text-white/90">Welcome back! Here's what's happening today.</p>
</div>
```

### Simple Page Header
```jsx
<div className="flex items-center justify-between mb-6 animate-fade-in">
  <div>
    <h1 className="text-3xl font-bold text-foreground">Applications</h1>
    <p className="text-muted-foreground">Manage all student applications</p>
  </div>
  <Button className="button-hover gradient-primary text-white">
    + New Application
  </Button>
</div>
```

---

## 📊 Charts with Professional Wrapper

```jsx
<Card className="card-hover shadow-professional">
  <CardHeader className="border-b">
    <CardTitle className="flex items-center gap-2">
      <TrendingUp className="text-primary" />
      Analytics Overview
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    {/* Your chart component here */}
    <ResponsiveContainer width="100%" height={300}>
      {/* Chart */}
    </ResponsiveContainer>
  </CardContent>
</Card>
```

---

## 🎯 Action Cards

### Quick Action Card
```jsx
<Card className="card-hover hover-glow cursor-pointer animate-fade-in delay-200">
  <CardContent className="p-6 text-center">
    <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
      <FileText className="h-8 w-8 text-primary" />
    </div>
    <h3 className="font-semibold mb-2">View Applications</h3>
    <p className="text-sm text-muted-foreground">
      Check all pending applications
    </p>
  </CardContent>
</Card>
```

---

## 🔄 Refresh/Sync Button

```jsx
<Button 
  variant="outline" 
  size="icon" 
  className="button-hover hover:rotate-180 transition-transform duration-500"
>
  <RefreshCw className="h-4 w-4" />
</Button>
```

---

## 🎨 Profile Cards

```jsx
<Card className="card-hover animate-scale-in">
  <CardContent className="p-6">
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 ring-2 ring-primary">
        <AvatarImage src="/avatar.jpg" />
        <AvatarFallback className="bg-primary text-white text-xl">
          JD
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-semibold text-lg">John Doe</h3>
        <p className="text-sm text-muted-foreground">Computer Science</p>
        <Badge className="status-success mt-1">Active</Badge>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 💡 Tips for Maximum Impact

### Animation Sequence
```jsx
// Stagger animations for list items
<div className="space-y-4">
  <Card className="animate-fade-in delay-100">...</Card>
  <Card className="animate-fade-in delay-200">...</Card>
  <Card className="animate-fade-in delay-300">...</Card>
</div>
```

### Combined Effects
```jsx
<Card className="card-hover shadow-professional animate-fade-in glass-effect">
  {/* Combines: hover effect, shadow, fade animation, and glass */}
</Card>
```

### Gradient Text
```jsx
<h1 className="text-4xl font-bold gradient-text">
  Smart Campus PlaceHub
</h1>
```

---

## 🎯 Complete Page Layout Example

```jsx
function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="gradient-primary text-white p-8 rounded-lg animate-fade-in">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-white/90">Overview of your placement activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover animate-fade-in delay-100">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <h3 className="text-3xl font-bold text-primary">1,234</h3>
          </CardContent>
        </Card>
        {/* More stats... */}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 card-hover shadow-professional animate-fade-in delay-300">
          <CardHeader className="border-b">
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Content */}
          </CardContent>
        </Card>

        <Card className="card-hover shadow-professional animate-fade-in delay-400">
          <CardHeader className="border-b">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {/* Actions */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## ✨ Remember

1. **Combine classes** for maximum effect
2. **Use animation delays** for staggered effects
3. **Add transitions** to all interactive elements
4. **Use status colors** consistently
5. **Include loading states** everywhere
6. **Make everything responsive**

---

**Copy any of these examples and use them directly in your components! 🎨**
