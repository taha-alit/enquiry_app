import Button from 'devextreme-react/button';
import Drawer from 'devextreme-react/drawer';
import ScrollView from 'devextreme-react/scroll-view';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SideNavigationMenu } from '../../components';
import './side-nav-inner-toolbar.scss';
import { useScreenSize } from '../../utils/media-query';
import { Template } from 'devextreme-react/core/template';
import { useMenuPatch } from '../../utils/patches';
import Footer from '../../components/footer/Footer';


export default function SideNavInnerToolbar({ title, children }) {
  const scrollViewRef = useRef(null);
  const navigate = useNavigate();
  const { isXSmall,isXXSmall, isLarge, isExLarge, isExSmall, isSmall } = useScreenSize();
  const [patchCssClass, onMenuReady] = useMenuPatch();
  const [menuStatus, setMenuStatus] = useState(
    isLarge || isExLarge ? MenuStatus.Opened : MenuStatus.Closed
  );

  const toggleMenu = useCallback(({ event }) => {
    setMenuStatus(
      prevMenuStatus => prevMenuStatus === MenuStatus.Closed
        ? MenuStatus.Opened
        : MenuStatus.Closed
    );
    event.stopPropagation();
  }, []);

  const OpenMenuOnItemClick = useCallback(() => {
    setMenuStatus(
      prevMenuStatus => prevMenuStatus === MenuStatus.Closed
       && MenuStatus.Opened
    );
  }, []);

  useEffect(()=>{

if(isXSmall || isXXSmall || isExSmall || isSmall){
    setMenuStatus(
      prevMenuStatus => prevMenuStatus !== MenuStatus.Closed
        ? MenuStatus.Closed
        : prevMenuStatus
    );
    }
  },[isXSmall, isXXSmall, isExSmall, isSmall])

  const onOutsideClick = useCallback(() => {
    setMenuStatus(
      prevMenuStatus => prevMenuStatus !== MenuStatus.Closed && (!isLarge && !isExLarge)
        ? MenuStatus.Closed
        : prevMenuStatus
    );
    return menuStatus === MenuStatus.Closed ? true : false;
  }, [isLarge,isExLarge, menuStatus]);

  const onNavigationChanged = useCallback(({ itemData, event, node }) => {
    if ( !itemData.path ) {
      event.preventDefault();
      return;
    }else if (node.selected) {
      event.preventDefault();

      navigate(itemData.path);
      scrollViewRef.current?.instance?.scrollTo(0);
      return;
    }

    navigate(itemData.path);
    scrollViewRef.current?.instance.scrollTo(0);

  }, [navigate ]);

  return (
    <div className={'side-nav-inner-toolbar'}>
      <Drawer
        id='customDrawer'
        className={['drawer', patchCssClass].join(' ')}
        position={'before'}
        closeOnOutsideClick={onOutsideClick}
        openedStateMode={isLarge || isExLarge ? 'shrink' : 'overlap'}
        revealMode={isXSmall || isXXSmall || isExSmall || isSmall ? 'slide' : 'expand'}
        minSize={isXSmall || isXXSmall || isExSmall || isSmall? 0 : 60}
        maxSize={280}
        shading={isLarge || isExLarge ? false : true}
        opened={menuStatus === MenuStatus.Closed ? false : true}
        template={'menu'}
      >
        <div className={'devcontainer'}>
            {
                (isXSmall || isXXSmall || isExSmall || isSmall)  &&
                <div className='toggle-menu-right-btn '>
                  <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
                  </div>
              }       

          <ScrollView ref={scrollViewRef} className={'layout-body with-footer'}>
            <div className={'content'}>
              {React.Children.map(children, (item) => {
                return item.type !== Footer && item;
              })}
            </div>
            <div className={'content-block bg-white '}>
              {React.Children.map(children, (item) => {
                return item.type === Footer && item;
              })}
            </div>
          </ScrollView>
        </div>
        <Template name={'menu'}>
          <SideNavigationMenu
            compactMode={menuStatus === MenuStatus.Closed}
            selectedItemChanged={onNavigationChanged}
            openMenu={OpenMenuOnItemClick}
            onMenuReady={onMenuReady}
          >
             <Toolbar id={'navigation-header'}>
              {
                (!isXSmall && !isXXSmall && !isExSmall && !isSmall) &&
                <Item
                  location={'before'}
                  cssClass={'menu-button'}
                >
                  <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
                </Item>
              }
              <Item location={'before'} cssClass={'header-title'}  >
                <img src={`${process.env.PUBLIC_URL}/logo.svg`} alt='vakency' style={{ height:'100%', width:'80%' }}/>
              </Item>
            </Toolbar>
          </SideNavigationMenu>
        </Template>
      </Drawer>
    </div>
  );
}

const MenuStatus = {
  Closed: 1,
  Opened: 2,
};

