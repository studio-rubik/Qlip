import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Tag } from 'antd';
import 'antd/dist/antd.css';

import useRepository from '../hooks/useRepository';
import { useStore } from '../store';

function SideNavigation() {
  const repo = useRepository();
  const tags = useStore((store) =>
    store.tags.allIds.map((id) => store.tags.byId[id]),
  );
  const websites = useStore((store) =>
    store.websites.allIds.map((id) => store.websites.byId[id]),
  );
  const set = useStore((store) => store.set);

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
    <Layout.Sider width={200} className="site-layout-background">
      <Menu
        mode="inline"
        defaultOpenKeys={['tags']}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.SubMenu key="tags" title="Tags">
          {tags.map((t) => (
            <Menu.Item key={t.id}>
              <Link to={`/?tag=${t.id}`}>{t.name}</Link>
            </Menu.Item>
          ))}
        </Menu.SubMenu>
        <Menu.SubMenu key="websites" title="Website">
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

export default SideNavigation;
