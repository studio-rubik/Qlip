import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Tag,
  Modal as AntModal,
  PageHeader,
  Empty,
  Menu,
  Dropdown,
  notification,
} from 'antd';
import {
  TagFilled,
  GlobalOutlined,
  BarsOutlined,
  EllipsisOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Modal from 'react-modal';

import color from '../common/color';
import useRepository, { useFetchComponents } from '../hooks/useRepository';
import { useStore } from '../store/';
import styled from 'styled-components';

import ComponentDetail from './ComponentDetail';
import AuthButton from './AuthButton';

const { confirm } = AntModal;

const Main = () => {
  const components = useStore((store) =>
    store.components.allIds.map((id) => store.components.byId[id]),
  );
  const files = useStore((store) =>
    store.componentFiles.allIds.map((id) => store.componentFiles.byId[id]),
  );
  const websites = useStore((store) =>
    store.websites.allIds.map((id) => store.websites.byId[id]),
  );
  const tags = useStore((store) =>
    store.tags.allIds.map((id) => store.tags.byId[id]),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComponentID, setSelectedComponentID] = useState('');

  const selectedItems = useMemo(() => {
    if (selectedComponentID === '') return null;
    const component = components.find((c) => c.id === selectedComponentID);
    if (component == null) return null;
    return {
      component,
      file: files.find((f) => f.component === component.id),
      website: websites.find((w) => w.id === component.website),
    };
  }, [components, files, selectedComponentID, websites]);

  const fetchComponents = useFetchComponents();

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  const handleCardClick = (componentID: string) => {
    setSelectedComponentID(componentID);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedComponentID('');
    setModalOpen(false);
  };

  const location = useLocation();
  const title = useMemo(() => {
    const queries = new URLSearchParams(location.search);
    const id = queries.get('tag') ?? queries.get('website');
    const titleFactory = (icon: any, text: string) => (
      <span>
        {icon}
        <span style={{ paddingLeft: 10 }}>{text}</span>
      </span>
    );
    if (id == null)
      return titleFactory(
        <BarsOutlined style={{ color: color.primary }} />,
        'All Components',
      );
    return queries.get('tag') != null
      ? titleFactory(
          <TagFilled style={{ color: color.primary }} />,
          tags.find((t) => t.id === id)?.name,
        )
      : titleFactory(
          <GlobalOutlined style={{ color: color.primary }} />,
          websites.find((w) => w.id === id)?.domain,
        );
  }, [location.search, tags, websites]);

  const repo = useRepository();
  const set = useStore((store) => store.set);

  const [deleting, setDeleting] = useState(false);
  const confirmDeleteFactory = (compID: string) => {
    return () =>
      confirm({
        title: 'Delete Component?',
        icon: <ExclamationCircleOutlined />,
        content: "Associated components won't be deleted.",
        onOk: async () => {
          try {
            setDeleting(true);
            await repo.componentDelete(compID);
            set((store) => {
              delete store.components.byId[compID];
              store.components.allIds = store.components.allIds.filter(
                (id) => id !== compID,
              );
            });
            notification.success({ message: 'Your component deleted' });
          } catch (e) {
            console.log(e);
            notification.error({ message: 'Sorry, something went wrong' });
          } finally {
            setDeleting(false);
          }
        },
      });
  };

  const moreActionFactory = (compID: string) => (
    <Menu style={{ padding: '4px' }}>
      <Menu.Item key="detail" icon={<FileTextOutlined />}>
        <span
          style={{ padding: '0 8px' }}
          onClick={() => handleCardClick(compID)}
        >
          Detail
        </span>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<CloseCircleOutlined />} danger>
        <span
          style={{ padding: '0 8px' }}
          onClick={confirmDeleteFactory(compID)}
        >
          Delete
        </span>
      </Menu.Item>
    </Menu>
  );

  const stopPropagation = (e: any) => {
    e.stopPropagation();
  };

  return (
    <>
      <PageHeader
        title={title}
        style={{ background: 'white' }}
        extra={[<AuthButton key="auth" />]}
      />
      <CardsContainer>
        {components.length > 0 ? (
          <Row gutter={[16, 16]}>
            {components.map((comp) => (
              <Col xl={6} lg={8} md={12} sm={24} key={comp.id}>
                <Card
                  hoverable
                  cover={
                    <CardImg
                      src={files.find((f) => f.component === comp.id)?.url}
                      alt=""
                    />
                  }
                  onClick={() => handleCardClick(comp.id)}
                  bodyStyle={{ padding: 12 }}
                >
                  <Card.Meta
                    title={websites.find((s) => s.id === comp.website)?.domain}
                    description={
                      <div style={{ padding: '6px 0' }}>
                        {tags
                          .filter((t) => comp.tagIds.includes(t.id))
                          .map((t) => (
                            <Tag key={t.id}>{t.name}</Tag>
                          ))}
                      </div>
                    }
                  />
                  <MoreButtonRow onClick={stopPropagation}>
                    <Dropdown
                      overlay={moreActionFactory(comp.id)}
                      trigger={['click']}
                    >
                      <MoreButton>
                        <EllipsisOutlined style={{ fontSize: 22 }} />
                      </MoreButton>
                    </Dropdown>
                  </MoreButtonRow>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No Component Found" />
        )}
      </CardsContainer>
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        shouldCloseOnOverlayClick
        style={{ overlay: { background: '#0008' } }}
      >
        {selectedItems != null ? (
          <ComponentDetail
            component={selectedItems.component}
            file={selectedItems.file}
            website={selectedItems.website}
          />
        ) : null}
      </Modal>
    </>
  );
};

const CardsContainer = styled.div`
  padding: 16px;
`;

const CardImg = styled.img`
  image-rendering: -webkit-optimize-contrast;
`;

const MoreButtonRow = styled.div`
  display: flex;
  margin-top: 8px;
  justify-content: flex-end;
`;

const MoreButton = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 4px;
  padding: 2px;
  :hover {
    background: #0002;
  }
`;

export default Main;
