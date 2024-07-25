import { Navigate } from 'react-router-dom'
import { SideNavOuterToolbar as SideNavBarLayout } from '../layouts';
import { Footer } from '../components';
import appInfo from '../app-info';

function PrivateRoute({ children }) {
  const accessToken = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  return accessToken && user ? (
    <SideNavBarLayout>
      {children}
      <Footer>
        Copyright © 2011-{new Date().getFullYear()} {appInfo.title} Inc.
        <br />
        All trademarks or registered trademarks are property of their
        respective owners.
      </Footer>
    </SideNavBarLayout>
  ) : <Navigate to={'/login'} />
}

export default PrivateRoute;
