import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppV1 from './AppV1';
import AppV2 from './AppV2';
import reportWebVitals from './reportWebVitals';

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/v2",
        element: <AppV2 />,
    },
    {
        path: "/v1",
        element: <AppV1 />,
    },
    {
        path: "/",
        element: <AppV1 />,
    }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
