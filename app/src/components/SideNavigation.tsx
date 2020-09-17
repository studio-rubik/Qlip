import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Tag } from 'antd';
import 'antd/dist/antd.css';

import useRepository from '../hooks/useRepository';
import { useStore } from '../store';

const LOGO_HEIGHT = 50;

function SideNavigation() {
  const repo = useRepository();
  const tags = useStore((store) =>
    store.tags.allIds.map((id) => store.tags.byId[id]),
  );
  const websites = useStore((store) =>
    store.websites.allIds.map((id) => store.websites.byId[id]),
  );
  const set = useStore((store) => store.set);
  const queries = new URLSearchParams(useLocation().search);

  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);

  useEffect(() => {
    setSelectedMenuItem(queries.get('tag') ?? queries.get('website'));
  }, [queries]);

  const handleSelect = (menuItem: any) => {
    setSelectedMenuItem(menuItem.key);
  };

  useEffect(() => {
    repo.tagsAll().then((resp) => {
      set((store) => {
        store.tags = resp.data.tags;
      });
    });
    repo.websitesAll().then((resp) => {
      set((store) => {
        store.websites = resp.data.websites;
      });
    });
  }, [repo, set]);

  return (
    <Layout.Sider
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
      }}
      className="site-layout-background"
    >
      <Link to="/">
        <Logo>DOMCLIPPER</Logo>
      </Link>
      <Menu
        theme="dark"
        mode="inline"
        defaultOpenKeys={['tag', 'website']}
        selectedKeys={selectedMenuItem ? [selectedMenuItem] : undefined}
        onSelect={handleSelect}
        style={{ height: `calc(100% - ${LOGO_HEIGHT}px)`, borderRight: 0 }}
      >
        <Menu.SubMenu key="tag" title="Tags">
          {tags.map((t) => (
            <Menu.Item key={t.id}>
              <Link to={`/?tag=${t.id}`}>{t.name}</Link>
            </Menu.Item>
          ))}
        </Menu.SubMenu>
        <Menu.SubMenu key="website" title="Websites">
          {websites.map((w) => (
            <Menu.Item key={w.id}>
              <Link to={`/?website=${w.id}`}>{w.domain}</Link>
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      </Menu>
    </Layout.Sider>
  );
}

const Logo = styled.div`
  color: #da50af;
  height: ${LOGO_HEIGHT}px;
  line-height: ${LOGO_HEIGHT}px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
`;

export default SideNavigation;
