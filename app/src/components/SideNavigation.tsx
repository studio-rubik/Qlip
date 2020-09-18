import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Modal, message } from 'antd';
import {
  CloseCircleOutlined,
  TagsOutlined,
  GlobalOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import 'antd/dist/antd.css';

import useRepository, {
  useFetchComponents,
  useFetchTags,
  useFetchWebsites,
} from '../hooks/useRepository';
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
    fetchTags();
    fetchWebsites();
  }, [fetchTags, fetchWebsites, repo, set]);

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
            fetchComponents();
            fetchTags();
          } catch (e) {
            console.log(e);
          }
        },
      });
  };

  const moreActionFactory = (tagID: string) => (
    <Menu>
      <Menu.Item key="delete" icon={<CloseCircleOutlined />} danger>
        <span onClick={confirmDeleteFactory(tagID)}>Delete</span>
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
          <Menu.SubMenu key="tag" title="Tags" icon={<TagsOutlined />}>
            {tags.map((t) => (
              <Menu.Item
                key={t.id}
                style={{
                  transitionProperty: 'border-color, background, padding',
                }}
              >
                <MenuItemContent>
                  <Link to={`/?tag=${t.id}`}>
                    <MenuItemText>{t.name}</MenuItemText>
                  </Link>
                  <Dropdown
                    overlay={moreActionFactory(t.id)}
                    trigger={['click']}
                  >
                    <MoreButton>
                      <MoreOutlined
                        style={{
                          fontSize: 24,
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
            icon={<GlobalOutlined />}
          >
            {websites.map((w) => (
              <Menu.Item key={w.id}>
                <Link to={`/?website=${w.id}`}>{w.domain}</Link>
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        </Menu>
      </Layout.Sider>
      <Modal
        title="Are you sure?"
        visible={false}
        // onOk={this.handleOk}
        // onCancel={this.handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
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

const MenuItemContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const MenuItemText = styled.span`
  color: rgba(255, 255, 255, 0.65);

  ${MenuItemContent}:hover & {
    color: white;
  }
`;

const MoreButton = styled.div`
  display: flex;
  visibility: hidden;
  transform: rotate(90deg);
  border-radius: 4px;
  line-height: 24px;
  justify-content: center;
  align-items: center;

  ${MenuItemContent}:hover & {
    visibility: visible;
  }

  &:hover {
    background: #40589c;
  }
`;

export default SideNavigation;
