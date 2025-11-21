# Firestore Security Rules for Employee Management System

## Required Firestore Security Rules

Add these rules to your Firestore Database in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write employees
    match /employees/{employeeId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read and write attendance records
    match /attendance/{attendanceId} {
      allow read, write: if request.auth != null;
    }
    
    // Optional: More restrictive rules (uncomment if you want stricter access)
    /*
    match /employees/{employeeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && validateEmployee(resource.data);
      allow update: if request.auth != null && validateEmployee(resource.data);
      allow delete: if request.auth != null;
    }
    
    match /attendance/{attendanceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && validateAttendance(resource.data);
      allow update: if request.auth != null && validateAttendance(resource.data);
      allow delete: if request.auth != null;
    }
    */
  }
}

// Helper functions for validation (if using stricter rules)
function validateEmployee(data) {
  return data.keys().hasAll(['name', 'status']) &&
         data.name is string &&
         data.status in ['active', 'inactive'];
}

function validateAttendance(data) {
  return data.keys().hasAll(['employee_id', 'date', 'status']) &&
         data.employee_id is string &&
         data.date is string &&
         data.status in ['present', 'absent', 'half-day'];
}
```

## How to Apply These Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to "Firestore Database"
4. Click on "Rules" tab
5. Replace the existing rules with the rules above
6. Click "Publish"

## Simple Testing Rules (Use for development only):

If you're still having issues, you can temporarily use these permissive rules for testing:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ Warning**: The testing rules above allow any authenticated user to read/write all data. Only use for development and testing!

## Common Issues:

1. **Rules not published**: Make sure you clicked "Publish" after updating rules
2. **Authentication required**: All rules require `request.auth != null` (user must be signed in)
3. **Index requirements**: Some queries may require composite indexes (Firestore will show errors in console with links to create them)

## Debugging Steps:

1. Check browser console for detailed error messages
2. Look at Firestore usage logs in Firebase Console
3. Test with simple permissive rules first
4. Gradually make rules more restrictive