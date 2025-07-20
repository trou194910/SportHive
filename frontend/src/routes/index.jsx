import React from 'react';
import {useRoutes} from 'react-router-dom';
import App from '../App';
import HomePage from '../pages/HomePage';
import RegistrationPage from '../pages/RegistrationPage';
import CreateActivityPage from '../pages/CreateActivityPage';
import MyActivityPage from '../pages/MyActivityPage';
import EditActivityPage from '../pages/EditActivityPage';

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
            ]
        }
    ]);
}