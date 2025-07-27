import React from 'react';
import {useRoutes} from 'react-router-dom';
import App from '../App';
import HomePage from '../pages/HomePage';
import RegistrationPage from '../pages/RegistrationPage';
import CreateActivityPage from '../pages/CreateActivityPage';
import MyActivityPage from '../pages/MyActivityPage';
import EditActivityPage from '../pages/EditActivityPage';
import ActivityDetailedPage from '../pages/ActivityDetailedPage';
import MyCenterPage from '../pages/MyCenterPage';
import ManagementPage from '../pages/ManagementPage';
import DeleteAccountPage from "../pages/DeleteAccountPage.jsx";
import ChangePasswordPage from '../pages/ChangePasswordPage';

export default function AppRoutes() {
    return useRoutes([
        {
            element: <App/>,
            children: [
                {
                    path: '/',
                    element: <HomePage/>
                },
                {
                    path: '/register',
                    element: <RegistrationPage/>
                },
                {
                    path: '/create-activity',
                    element: <CreateActivityPage/>
                },
                {
                    path: '/my-activity',
                    element: <MyActivityPage/>
                },
                {
                    path: '/activities/edit/:id',
                    element: <EditActivityPage/>
                },
                {
                    path: '/activities/:id',
                    element: <ActivityDetailedPage/>
                },
                {
                    path: '/my-center',
                    element: <MyCenterPage/>
                },
                {
                    path: '/user-management',
                    element: <ManagementPage/>
                },
                {
                    path: '/users/delete',
                    element: <DeleteAccountPage/>
                },
                {
                    path: '/users/change-password',
                    element: <ChangePasswordPage/>
                }
            ]
        }
    ]);
}