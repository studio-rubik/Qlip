import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Row, Col, Card } from 'antd';
import Modal from 'react-modal';

import useRepository from '../hooks/useRepository';
import { useStore } from '../store/';
import styled from 'styled-components';

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
  const params = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImgURL, setSelectedImgURL] = useState('');

  useEffect(() => {
    repo.componentsFilter().then((resp) => {
      set((store) => {
        store.components = resp.data.components;
        store.componentFiles = resp.data.componentFiles;
      });
    });
  }, [repo, set]);

  const handleCardClick = (url: string) => {
    setSelectedImgURL(url);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImgURL('');
    setModalOpen(false);
  };

  return (
    <>
      <Row gutter={16}>
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
              onClick={() =>
                handleCardClick(files.find((f) => f.component === comp.id)?.url)
              }
            >
              <Card.Meta
                title={websites.find((s) => s.id === comp.website)?.domain}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Modal
        isOpen={modalOpen}
        shouldCloseOnOverlayClick
        onRequestClose={closeModal}
      >
        <DetailImg src={selectedImgURL} />
      </Modal>
    </>
  );
};

const ImgWrapper = styled.div``;

const CardImg = styled.img`
  image-rendering: -webkit-optimize-contrast;
`;

const DetailImg = styled.img``;

export default Main;
