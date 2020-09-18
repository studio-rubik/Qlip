import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col, Card, Tag, PageHeader } from 'antd';
import Modal from 'react-modal';

import useRepository, {
  useFetchComponents,
  useFetchTags,
  useFetchWebsites,
} from '../hooks/useRepository';
import { useStore } from '../store/';
import styled from 'styled-components';

import ComponentDetail from './ComponentDetail';

const Main = () => {
  const repo = useRepository();
  const set = useStore((store) => store.set);
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

  return (
    <>
      <PageHeader
        title="Headers"
        onBack={() => null}
        style={{ background: 'white' }}
      />
      <CardsContainer>
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
              >
                <div>
                  <div>
                    {websites.find((s) => s.id === comp.website)?.domain}
                  </div>
                  <div>
                    {tags
                      .filter((t) => comp.tagIds.includes(t.id))
                      .map((t) => (
                        <Tag key={t.id}>{t.name}</Tag>
                      ))}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </CardsContainer>
      <Modal
        isOpen={modalOpen}
        shouldCloseOnOverlayClick
        onRequestClose={closeModal}
      >
        {selectedItems != null ? (
          <ComponentDetail
            component={selectedItems.component}
            file={selectedItems.file}
            website={selectedItems.website}
            onSubmitSuccess={closeModal}
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

export default Main;
