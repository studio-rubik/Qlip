import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card,
  Tag,
  Modal as AntModal,
  PageHeader,
  Empty,
  Menu,
  Dropdown,
  Spin,
  notification,
} from 'antd';
import {
  EllipsisOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Modal from 'react-modal';
import InfiniteScroll from 'react-infinite-scroll-component';

import color from '../common/color';
import useRepository, { useFetchComponents } from '../hooks/useRepository';
import { useStore } from '../store/';
import styled from 'styled-components';

import Icons from './Icons';
import ComponentDetail from './ComponentDetail';
import AuthButton from './AuthButton';

const { confirm } = AntModal;

const LIMIT = 50;
const ROW_HEIGHT = 1;
const ROW_GAP = 20;

function resizeGridItem(
  gridItem: HTMLElement,
  cover: HTMLElement,
  body: HTMLElement,
) {
  const rowSpan = Math.ceil(
    (cover.getBoundingClientRect().height +
      body.getBoundingClientRect().height +
      ROW_GAP) /
      (ROW_HEIGHT + ROW_GAP),
  );
  gridItem.style.gridRowEnd = 'span ' + rowSpan;
}

function resizeGridItemByCoverImg(img: HTMLImageElement) {
  const cover = img.parentElement;
  const card = cover?.parentElement;
  const gridItem = card?.parentElement;
  const body = card?.querySelector('.ant-card-body');
  if (
    gridItem instanceof HTMLElement &&
    cover instanceof HTMLElement &&
    body instanceof HTMLElement
  ) {
    resizeGridItem(gridItem, cover, body);
  }
}

async function resizeAllCards() {
  const allItems = document.getElementsByClassName('grid-item');
  for (const item of Array.from(allItems)) {
    const cover = item.querySelector('.ant-card-cover img');
    const body = item.querySelector('.ant-card-body');
    if (
      item instanceof HTMLElement &&
      cover instanceof HTMLElement &&
      body instanceof HTMLElement
    ) {
      resizeGridItem(item, cover, body);
    }
  }
}

const Main = () => {
  const token = useStore((store) => store.idToken);
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
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetchedMore, setFetchedMore] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', resizeAllCards);
  }, []);

  useEffect(() => {
    resizeAllCards();
  }, [components]);

  useEffect(() => {
    async function fn() {
      if (token) {
        // Re-initialize after url changed.
        setLoading(true);
        setHasMore(true);
        setFetchedMore(false);

        try {
          const hasMore = await fetchComponents({ limit: LIMIT, offset: 0 });
          setOffset(LIMIT);
          setHasMore(hasMore);
        } catch (e) {
          console.debug(e);
        } finally {
          setLoading(false);
        }
      }
    }
    fn();
  }, [fetchComponents, token]);

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
        <span style={{ paddingLeft: 10, color: '#333' }}>{text}</span>
      </span>
    );
    if (id == null)
      return titleFactory(
        <Icons.List style={{ color: color.primary }} />,
        'All Components',
      );
    return queries.get('tag') != null
      ? titleFactory(
          <Icons.Tag style={{ color: color.primary }} />,
          tags.find((t) => t.id === id)?.name,
        )
      : titleFactory(
          <Icons.Globe style={{ color: color.primary }} />,
          websites.find((w) => w.id === id)?.domain,
        );
  }, [location.search, tags, websites]);

  const repo = useRepository();
  const set = useStore((store) => store.set);

  const confirmDeleteFactory = (compID: string) => {
    return () =>
      confirm({
        title: 'Delete Component?',
        icon: <ExclamationCircleOutlined />,
        onOk: async () => {
          try {
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
          }
        },
      });
  };

  const stopPropagation = (e: any) => {
    e.stopPropagation();
  };

  const moreActionFactory = (compID: string) => (
    <Menu style={{ padding: '4px' }}>
      <Menu.Item
        key="detail"
        icon={<FileTextOutlined />}
        onClick={(e) => {
          e.domEvent.stopPropagation();
          handleCardClick(compID);
        }}
      >
        <span style={{ padding: '0 8px' }}>Detail</span>
      </Menu.Item>
      <Menu.Item
        danger
        key="delete"
        icon={<CloseCircleOutlined />}
        onClick={(e) => {
          e.domEvent.stopPropagation();
          confirmDeleteFactory(compID)();
        }}
      >
        <span style={{ padding: '0 8px' }}>Delete</span>
      </Menu.Item>
    </Menu>
  );

  const loaded = true;

  const fetchData = async () => {
    setLoading(true);
    try {
      const hasMore = await fetchComponents({ limit: LIMIT, offset }, false);
      setOffset((prev) => prev + LIMIT);
      setHasMore(hasMore);
    } catch (e) {
      console.debug(e);
    } finally {
      setFetchedMore(true);
      setLoading(false);
    }
  };

  const MoreButton: React.FC<{ compID: string }> = ({ compID }) => (
    <Dropdown overlay={moreActionFactory(compID)} trigger={['click']}>
      <More onClick={stopPropagation}>
        <EllipsisOutlined style={{ fontSize: 22 }} />
      </More>
    </Dropdown>
  );

  return (
    <>
      <PageHeader
        title={title}
        style={{ background: 'white', padding: '10px 20px' }}
        extra={[<AuthButton key="auth" />]}
      />
      {loaded ? (
        <>
          <InfiniteScroll
            dataLength={components.length}
            next={fetchData}
            hasMore={hasMore}
            loader={
              <SpinWrapper>
                <Spin />
              </SpinWrapper>
            }
            endMessage={fetchedMore ? <EndMsg>EOF</EndMsg> : null}
          >
            {components.length > 0 ? (
              <Cards className="grid">
                {components.map((comp) => (
                  <GridItem className="grid-item" key={comp.id}>
                    <Card
                      hoverable
                      cover={
                        <CardImg
                          src={files.find((f) => f.component === comp.id)?.url}
                          onLoad={(e) =>
                            resizeGridItemByCoverImg(e.currentTarget)
                          }
                          alt=""
                        />
                      }
                      onClick={() => handleCardClick(comp.id)}
                      bodyStyle={{ padding: 10 }}
                    >
                      <CardDomainRow>
                        <div>
                          <Icons.Globe />
                          <CardDomainText>
                            {
                              websites.find((s) => s.id === comp.website)
                                ?.domain
                            }
                          </CardDomainText>
                        </div>
                        {tags.filter((t) => comp.tagIds.includes(t.id))
                          .length === 0 ? (
                          <MoreButton compID={comp.id} />
                        ) : null}
                      </CardDomainRow>
                      {tags.filter((t) => comp.tagIds.includes(t.id)).length >
                      0 ? (
                        <TagRow>
                          <div>
                            {tags
                              .filter((t) => comp.tagIds.includes(t.id))
                              .map((t) => (
                                <Tag key={t.id}>{t.name}</Tag>
                              ))}
                          </div>
                          <MoreButton compID={comp.id} />
                        </TagRow>
                      ) : null}
                    </Card>
                  </GridItem>
                ))}
              </Cards>
            ) : loading ? null : (
              <Empty description="No Component Found" />
            )}
          </InfiniteScroll>
          <Modal
            isOpen={modalOpen}
            onRequestClose={closeModal}
            shouldCloseOnOverlayClick
            style={ModalStyle}
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
      ) : (
        <Spin />
      )}
    </>
  );
};

const ModalStyle: Modal.Styles = {
  content: { borderRadius: 10 },
  overlay: { background: '#0008' },
};

const Cards = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: ${ROW_HEIGHT}px;
  grid-gap: ${ROW_GAP}px;
`;

const GridItem = styled.div``;

const CardImg = styled.img`
  image-rendering: -webkit-optimize-contrast;
`;

const CardDomainRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 14px;
`;

const CardDomainText = styled.span`
  margin-left: 5px;
`;

const TagRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 6px;
`;

const More = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 4px;
  padding: 2px;
  :hover {
    background: #0002;
  }
`;

const SpinWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`;

const EndMsg = styled.p`
  margin-top: 50px;
  text-align: center;
  color: #999;
`;

export default Main;
