import React from 'react';
// import { TasksPage, ProfilePage } from './pages';
import { withNavigationWatcher } from './contexts/navigation';

const HomePage = React.lazy(() => import('./pages/home'));
const AppointmentsPage = React.lazy(() => import('./pages/appointments'));
const DoctorsPage = React.lazy(() => import('./pages/doctors'));
const ItemsPage = React.lazy(() => import('./pages/items'));
const SpecialitiesPage = React.lazy(() => import('./pages/specialities'));
const ReceiptsPage = React.lazy(() => import('./pages/receipts'));

const routes = [
    {
        path: '/home',
        element: HomePage
    },
    {
        path: '/appointments',
        element: AppointmentsPage 
    },
    {
        path: '/doctors',
        element: DoctorsPage 
    },
    {
        path: '/items',
        element: ItemsPage 
    },
    {
        path: '/specialities',
        element: SpecialitiesPage 
    },
    {
        path: '/receipts',
        element: ReceiptsPage 
    },
];

export default routes.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});
