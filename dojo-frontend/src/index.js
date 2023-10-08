import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ClassPage from "./pages/ClassPage";
import ConsultPage from "./pages/ConsultPage";
import AssignmentPage from "./pages/AssignmentPage";
import TeacherMgmtPage from "./pages/TeacherMgmtPage";
import StudentMgmtPage from "./pages/StudentMgmtPage";
import TreasuryMgmtPage from "./pages/TreasuryMgmtPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/class",
    element: <ClassPage />,
  },
  {
    path: "/consult",
    element: <ConsultPage />,
  },
  {
    path: "/assignment",
    element: <AssignmentPage />,
  },
  {
    path: "/teachermgmt",
    element: <TeacherMgmtPage />,
  },
  {
    path: "/studentmgmt",
    element: <StudentMgmtPage />,
  },
  {
    path: "/treasurymgmt",
    element: <TreasuryMgmtPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
