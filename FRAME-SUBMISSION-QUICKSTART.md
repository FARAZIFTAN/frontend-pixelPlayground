# Frame Submission Feature - Quick Start Guide

## 🚀 How It Works

### For Users (PRO Users Only)

1. **Access Frame Submission**
   - Navigate to user menu (top right)
   - Click "My Frame Submissions" (only visible if PRO)
   - Click "Submit New Frame" button

2. **Create Frame**
   - Upload background image (PNG/JPG, max 5MB)
   - Enter frame name and category
   - Click "Add Frame" to place photo frames
   - Drag and resize frames on the canvas
   - Fine-tune coordinates in the table below

3. **Submit for Approval**
   - Click "Save Frame" button
   - Frame appears as "Pending Review" in submissions
   - Admin team reviews within 24-48 hours

4. **Track Status**
   - View all submissions in "My Frame Submissions"
   - Filter by: All, Pending, Approved, Rejected
   - See rejection reasons if declined
   - Delete pending submissions anytime

### For Admins

1. **Access Approvals Queue**
   - Admin Dashboard → Templates (sidebar)
   - Click "Frame Approvals"

2. **Review Submissions**
   - See all pending frames in queue
   - View submitter details
   - Preview frame layout

3. **Approve or Reject**
   - **Approve**: Creates public template immediately
   - **Reject**: Requires justification message

---

## 📱 Frontend Components

### Pages
- **`/user/frame-submission`** - Frame creation interface
- **`/user/my-submissions`** - User's submission dashboard
- **`/admin/frame-approvals`** - Admin approval queue

### Reusable Component
- **`FrameCreatorForm`** - Canvas-based frame designer (used by both users and admins)

### Navigation
- User Menu: "My Frame Submissions" link (PRO only)
- Admin Sidebar: "Frame Approvals" under Templates

---

## 🔑 Key Requirements

### User Requirements
- User must have `isPremium = true`
- JWT token in localStorage
- Must be logged in

### Admin Requirements
- User must have `role = 'admin'`
- JWT token in localStorage
- Must be logged in

---

## 🔌 Backend API Integration

All endpoints are pre-built and ready:

```typescript
// User can submit frame
POST /api/user-submissions/frames
Body: { name, description, frameUrl, thumbnail, frameCount, layout, frameSpec, layoutPositions }

// User can view their submissions
GET /api/user-submissions/frames?status=pending|approved|rejected

// Admin can view pending submissions
GET /api/admin/frame-submissions?status=pending

// Admin can approve submission (creates Template)
PATCH /api/admin/frame-submissions/{id}/approve
Body: { isPremium: boolean }

// Admin can reject submission
PATCH /api/admin/frame-submissions/{id}/reject
Body: { rejectionReason: string }
```

---

## ⚙️ Configuration

### Environment Variables (Frontend)
```
VITE_API_BASE_URL=http://localhost:3001/api  (or your backend URL)
```

### Backend Requirements
- MongoDB with UserSubmittedFrame collection
- All 7 API endpoints deployed and working
- JWT authentication middleware active

---

## 🎯 Testing Flow

### As a PRO User
1. Log in with PRO account
2. Click user menu → "My Frame Submissions"
3. Click "Submit New Frame"
4. Upload image, create frame layout
5. Click "Save Frame"
6. See submission as "Pending Review"
7. Check back later for approval/rejection

### As Admin
1. Log in with admin account
2. Go to Admin Dashboard
3. Sidebar → Templates → Frame Approvals
4. View pending submissions
5. Review frame and submitter info
6. Click "Approve" or "Reject"
7. If reject, enter rejection reason
8. Submission status updates

---

## 🐛 Troubleshooting

### "PRO Feature" message appears for PRO users
- Check if `user.isPremium` is true in browser DevTools
- May need to refresh page or log out/in
- Check backend User model has isPremium field

### Frame submission page not loading
- Verify route `/user/frame-submission` exists in App.tsx
- Check if user is authenticated (not logged in = redirect)
- Check if user has isPremium = true (free users see upgrade prompt)

### Admin can't see submissions
- Verify user role is 'admin' in DevTools
- Check if admin is logged in
- Check if backend API endpoint is responding

### Image upload fails
- Check image format (PNG or JPG only)
- Check file size < 5MB
- Check CORS settings on backend

---

## 📊 Data Flow

```
User Creates Frame
    ↓
Submit via API
    ↓
Backend creates UserSubmittedFrame (status: "pending")
    ↓
Admin views in Frame Approvals queue
    ↓
Admin approves/rejects
    ↓
If approved: Creates Template, sets UserSubmittedFrame.status = "approved"
If rejected: Sets reason, sets UserSubmittedFrame.status = "rejected"
    ↓
User sees update in "My Frame Submissions"
```

---

## 🎨 Component Reuse

The `FrameCreatorForm` component is shared between:
1. **User submissions** - create new custom frames
2. **Admin templates** - create official templates

Both use the same component with different props and callbacks.

---

## 🔒 Security Notes

- Only PRO users can submit (`user.isPremium` check)
- Only admins can approve/reject (role check)
- Users can only delete their own pending submissions
- All operations require JWT authentication
- Submitted frames are private until admin approves

---

## 📈 Analytics

Track these metrics:
- Total submissions per user
- Approval rate by category
- Average time to approval
- Most popular frame categories
- Admin review queue depth

---

## 💡 Future Enhancements

1. **Bulk Operations** - Admin approve multiple at once
2. **Comments** - Admin provide feedback on rejections
3. **Revisions** - Users resubmit rejected frames
4. **Scheduling** - Admin can schedule approval time
5. **Preview** - User can preview before submitting
6. **Templates** - Save frame templates as drafts
7. **Analytics** - Usage stats for approved frames

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend API responses in Network tab
3. Check user authentication status
4. Verify user isPremium and admin role
5. Check backend logs for API errors

---

**Created**: Implementation Complete ✅
**Status**: Production Ready
**Last Updated**: Latest
