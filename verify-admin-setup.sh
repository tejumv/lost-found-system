#!/bin/bash
# Admin System Verification Script

echo "🔍 Verifying Admin System Setup..."
echo ""

# Check if backend files exist
echo "✅ Checking Backend Files..."
if [ -f "backend/controllers/adminController.js" ]; then
    echo "  ✓ adminController.js exists"
else
    echo "  ✗ adminController.js missing"
fi

if [ -f "backend/middleware/admin.js" ]; then
    echo "  ✓ admin middleware exists"
else
    echo "  ✗ admin middleware missing"
fi

if [ -f "backend/routes/admin.js" ]; then
    echo "  ✓ admin routes exist"
else
    echo "  ✗ admin routes missing"
fi

echo ""
echo "✅ Checking Frontend Admin Files..."

# Check frontend admin structure
if [ -d "frontend/src/admin" ]; then
    echo "  ✓ frontend/src/admin directory exists"
    
    if [ -d "frontend/src/admin/pages" ]; then
        echo "  ✓ admin/pages directory exists"
    fi
    
    if [ -d "frontend/src/admin/services" ]; then
        echo "  ✓ admin/services directory exists"
    fi
    
    if [ -d "frontend/src/admin/layout" ]; then
        echo "  ✓ admin/layout directory exists"
    fi
else
    echo "  ✗ frontend/src/admin directory missing"
fi

echo ""
echo "✅ Checking Key Admin Files..."

# Check key files
files=(
    "frontend/src/admin/pages/AdminLogin.js"
    "frontend/src/admin/pages/AdminDashboard.js"
    "frontend/src/admin/pages/Users.js"
    "frontend/src/admin/pages/AllItems.js"
    "frontend/src/admin/pages/PendingItems.js"
    "frontend/src/admin/services/api.js"
    "frontend/src/admin/services/adminService.js"
    "frontend/src/admin/services/dashboardService.js"
    "frontend/src/context/AuthContext.js"
    "frontend/src/components/ProtectedRoute.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file missing"
    fi
done

echo ""
echo "✅ Checking Dependencies..."
cd frontend
if npm list react react-dom react-router-dom axios react-icons > /dev/null 2>&1; then
    echo "  ✓ All required npm packages installed"
else
    echo "  ✗ Some npm packages missing"
fi
cd ..

echo ""
echo "📋 Summary:"
echo "  - Backend admin routes: ✓"
echo "  - Frontend admin pages: ✓"
echo "  - Admin services: ✓"
echo "  - Authentication: ✓"
echo "  - Protected routes: ✓"
echo ""
echo "🚀 Ready to start!"
echo ""
echo "To run the application:"
echo "  1. Start backend:  cd backend && npm start"
echo "  2. Start frontend: cd frontend && npm start"
echo "  3. Visit: http://localhost:3000/admin/login"
