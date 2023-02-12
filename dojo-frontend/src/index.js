import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ClassPage from "./pages/ClassPage";
import ConsultPage from "./pages/ConsultPage";
import AssignmentPage from "./pages/AssignmentPage";

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
]);

ReactDOM.createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
