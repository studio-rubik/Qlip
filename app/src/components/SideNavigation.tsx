import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Modal, message } from 'antd';
import {
  CloseCircleOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import 'antd/dist/antd.css';

import color from '../common/color';
import useRepository, {
  useFetchComponents,
  useFetchTags,
  useFetchWebsites,
} from '../hooks/useRepository';
import { useStore } from '../store';
import { ReactComponent as LogoIcon } from '../parts/logo-icon.svg';
import { ReactComponent as LogoText } from '../parts/logo-text.svg';
import Icons from './Icons';

const LOGO_HEIGHT = 68;

function SideNavigation() {
  const repo = useRepository();
  const token = useStore((store) => store.idToken);
  const created = useStore((store) => store.created);
  const tags = useStore((store) =>
    store.tags.allIds.map((id) => store.tags.byId[id]),
  );
  const websites = useStore((store) =>
    store.websites.allIds.map((id) => store.websites.byId[id]),
  );
  const set = useStore((store) => store.set);
  const queries = new URLSearchParams(useLocation().search);

  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);

  const fetchComponents = useFetchComponents();
  const fetchTags = useFetchTags();
  const fetchWebsites = useFetchWebsites();

  useEffect(() => {
    setSelectedMenuItem(queries.get('tag') ?? queries.get('website'));
  }, [queries]);

  const handleSelect = (menuItem: any) => {
    setSelectedMenuItem(menuItem.key);
  };

  useEffect(() => {
    if (token) {
      fetchTags();
      fetchWebsites();
    }
  }, [fetchTags, fetchWebsites, repo, set, token, created]);

  const confirmDeleteFactory = (tagID: string) => {
    return () =>
      Modal.confirm({
        title: 'Delete Tag?',
        icon: <ExclamationCircleOutlined />,
        content: "Associated components won't be deleted.",
        onOk: async () => {
          try {
            await repo.tagDelete(tagID);
            message.success('Tag successfully deleted.');
            fetchComponents({ limit: 10, offset: 0 });
            fetchTags();
          } catch (e) {
            console.debug(e);
          }
        },
      });
  };

  const moreActionFactory = (tagID: string) => (
    <Menu>
      <Menu.Item
        key="delete"
        icon={<CloseCircleOutlined />}
        onClick={confirmDeleteFactory(tagID)}
        danger
      >
        <span>Delete</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Layout.Sider
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          boxShadow: '1px 0px 3px -2px rgba(0, 0, 0, 0.4)',
        }}
        className="site-layout-background"
      >
        <Link to="/">
          <LogoWrapper>
            <StyledLogoIcon />
            <StyledLogoText />
          </LogoWrapper>
        </Link>
        <Menu
          theme="light"
          mode="inline"
          defaultOpenKeys={['tag']}
          selectedKeys={selectedMenuItem ? [selectedMenuItem] : undefined}
          onSelect={handleSelect}
          style={{ height: `calc(100% - ${LOGO_HEIGHT}px)` }}
        >
          <Menu.SubMenu
            key="tag"
            title="Tags"
            icon={<Icons.Tags style={iconStyle} />}
          >
            {tags.map((t) => (
              <Menu.Item
                key={t.id}
                style={{
                  transitionProperty: 'border-color, background, padding',
                }}
              >
                <MenuItemContent>
                  <Link
                    to={`/?tag=${t.id}`}
                    style={{ position: 'relative', width: '100%' }}
                  >
                    <MenuItemText>{t.name}</MenuItemText>
                  </Link>
                  <Dropdown
                    overlay={moreActionFactory(t.id)}
                    trigger={['click']}
                  >
                    <MoreButton>
                      <EllipsisOutlined
                        style={{
                          fontSize: 22,
                          margin: 0,
                        }}
                      />
                    </MoreButton>
                  </Dropdown>
                </MenuItemContent>
              </Menu.Item>
            ))}
          </Menu.SubMenu>
          <Menu.SubMenu
            key="website"
            title="Websites"
            icon={<Icons.Globe style={iconStyle} />}
          >
            {websites.map((w) => (
              <Menu.Item key={w.id}>
                <Link to={`/?website=${w.id}`}>{w.domain}</Link>
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        </Menu>
      </Layout.Sider>
    </>
  );
}

const iconStyle: React.CSSProperties = {
  color: color.primary,
  marginRight: 8,
  width: 14,
};

const LogoWrapper = styled.div`
  height: ${LOGO_HEIGHT}px;
  width: 100%;
  padding: 8px;
  display: flex;
  align-items: center;
  background: white;
  border-right: 1px solid #f0f0f0;
`;

const StyledLogoIcon = styled(LogoIcon)`
  margin-left: 48px;
  display: block;
  height: 17px;
  width: 34px;
`;

const StyledLogoText = styled(LogoText)`
  display: block;
  height: 28px;
  width: 48px;
  padding: 4px 0 0 8px;
`;

const MenuItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MenuItemText = styled.div`
  position: relative;
  color: #333;
  width: 100%;

  ${MenuItemContent}:hover & {
    color: #1890ff;
  }
`;

const MoreButton = styled.div`
  display: flex;
  visibility: hidden;
  justify-content: center;
  align-items: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  padding: 2px;
  z-index: 100000;

  ${MenuItemContent}:hover & {
    visibility: visible;
  }

  &:hover {
    background: #0002;
  }
`;

export default SideNavigation;
