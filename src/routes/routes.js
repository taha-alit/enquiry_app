import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { SingleCard } from '../layouts';
import PrivateRoute from './PrivateRoute';
import { withNavigationWatcher } from '../contexts/navigation';

const LoginWrapper = React.lazy(() => import('../components/login-form/LoginForm'));
const HomeWrapper = React.lazy(() => import('../pages/home'));
const AppointmentsWrapper = React.lazy(() => import('../pages/appointments'));
const SpecialitiesWrapper = React.lazy(() => import('../pages/specialities'));
const DoctorsWrapper = React.lazy(() => import('../pages/doctors'));
const ItemsWrapper = React.lazy(() => import('../pages/items'));
const ReceiptsWrapper = React.lazy(() => import('../pages/receipts'));

const routes = [
    {
        path: '/',
        element: (
            <SingleCard title="Sign In">
                <LoginWrapper />
            </SingleCard>
        )
    },
    {
        path: '/login',
        element: (
            <SingleCard title="Sign In">
                <LoginWrapper />
            </SingleCard>
        )
    },
    {
        path: '/home',
        element: (
            <PrivateRoute>
                <HomeWrapper />
            </PrivateRoute>
        )
    },
    {
        path: '/appointments',
        element: (
            <PrivateRoute>
                <AppointmentsWrapper />
            </PrivateRoute>
        )
    },
    {
        path: '/doctors',
        element: (
            <PrivateRoute>
                <DoctorsWrapper />
            </PrivateRoute>
        )
    },
    {
        path: '/items',
        element: (
            <PrivateRoute>
                <ItemsWrapper />
            </PrivateRoute>
        )
    },
    {
        path: '/specialities',
        element: (
            <PrivateRoute>
                <SpecialitiesWrapper />
            </PrivateRoute>
        )
    },
    {
        path: '/receipts',
        element: (
            <PrivateRoute>
                <ReceiptsWrapper />
            </PrivateRoute>
        )
    },
];

const router = createBrowserRouter(routes.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
}));
export default router;