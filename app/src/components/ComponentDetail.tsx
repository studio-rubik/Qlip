import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import {
  Input,
  Select,
  Button,
  Tag,
  Row,
  Col,
  Divider,
  notification,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { fromUTC } from '../common/utils';
import useRepository from '../hooks/useRepository';
import { useStore } from '../store/';
import Icons from './Icons';

type Props = {
  component: any;
  file: any;
  website: any;
  onSubmitSuccess?: () => void;
};

const ComponentDetail: React.FC<Props> = ({
  component,
  file,
  website,
  onSubmitSuccess,
}) => {
  const repo = useRepository();
  const set = useStore((store) => store.set);
  const tags = useStore((store) =>
    store.tags.allIds.map((id) => store.tags.byId[id]),
  );

  const options = tags.map((t) => (
    <Select.Option key={t.id} value={t.id}>
      {t.name}
    </Select.Option>
  ));

  const [selectedTags, setSelectedTags] = useState<string[]>(component.tagIds);

  const newTagRef = useRef<any>(null);
  const [newTagValue, setNewTagValue] = useState('');
  const [newTagEditing, setNewTagEditing] = useState(false);
  const [newTagSubmitting, setNewTagSubmitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (value: string[]) => {
    setSelectedTags(value);
  };

  const handleNewTagClick = () => {
    setNewTagEditing(true);
    setTimeout(() => {
      newTagRef.current?.focus();
    }, 50);
  };

  const handleNewTagChange = (e: any) => {
    setNewTagValue(e.target.value);
  };

  const handleNewTagBlur = () => {
    setNewTagValue('');
    setNewTagEditing(false);
  };

  const handleNewTagSubmit = async () => {
    try {
      setNewTagValue('');
      setNewTagEditing(false);
      setNewTagSubmitting(true);
      const resp = await repo.tagPost(newTagValue);
      set((store) => {
        store.tags.byId[resp.data.tag.id] = resp.data.tag;
        store.tags.allIds.push(resp.data.tag.id);
      });
      setSelectedTags((prev) => [...prev, resp.data.tag.id]);
      notification.success({ message: 'New tag created' });
    } catch (e) {
      console.log(e);
      notification.error({ message: 'Sorry, something went wrong' });
    } finally {
      setNewTagSubmitting(false);
    }
  };

  const handleUpdateClick = async () => {
    try {
      setSubmitting(true);
      await repo.componentTagsPost(component.id, selectedTags);
      set((store) => {
        component.tagIds = selectedTags;
        store.components.byId[component.id] = component;
      });
      notification.success({ message: 'Your component updated' });
      if (onSubmitSuccess != null) onSubmitSuccess();
    } catch (e) {
      console.log(e);
      notification.error({ message: 'Sorry, something went wrong' });
    } finally {
      setSubmitting(false);
    }
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (containerRef.current == null || imgRef.current == null) return;

    const rect = containerRef.current?.getBoundingClientRect();
    const w = component.width >= rect.width ? -1 : component.width;
    if (w === -1) {
      imgRef.current.style.maxWidth = '100%';
      imgRef.current.style.height = 'auto';
    } else {
      imgRef.current.style.width = w + 'px';
      imgRef.current.style.height = component.height + 'px';
    }
  }, [component.height, component.width]);

  return (
    <Container ref={containerRef}>
      <Row style={{ flex: 1 }}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <DetailImgWrapper>
            <DetailImg ref={imgRef} src={file.url} />
          </DetailImgWrapper>
        </Col>
      </Row>
      <Divider />
      <Row align="middle" gutter={[0, 24]} style={{ color: '#666' }}>
        <Icons.Clock style={iconStyle} />
        {fromUTC.toRelative(component.updatedAt)}
      </Row>
      <Row align="middle">
        <Icons.Globe style={iconStyle} />
        <a
          href={`https://${website.domain}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {website.domain}
        </a>
      </Row>
      <Row align="middle">
        <Icons.Tags style={iconStyle} />
        <Col md={{ span: 12, offset: 0 }} xs={{ span: 18 }}>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%', margin: '14px 0' }}
            placeholder="Select from Existing Tags"
            value={selectedTags}
            onChange={handleChange}
          >
            {options}
          </Select>
        </Col>
        <Col span={4}>
          {newTagEditing ? (
            <Input
              style={{
                width: 78,
                marginLeft: 12,
                verticalAlign: 'top',
              }}
              ref={newTagRef}
              disabled={newTagSubmitting}
              type="text"
              value={newTagValue}
              onChange={handleNewTagChange}
              onBlur={handleNewTagBlur}
              onPressEnter={handleNewTagSubmit}
            />
          ) : (
            <Tag
              style={{
                verticalAlign: 'middle',
                marginLeft: 12,
                marginBottom: 0,
                lineHeight: '22px',
                borderStyle: 'dashed',
              }}
              onClick={handleNewTagClick}
            >
              <PlusOutlined /> Create Tag
            </Tag>
          )}
        </Col>
      </Row>
      <Row style={{ padding: '22px 0' }} justify="center">
        <Button
          type="primary"
          shape="round"
          loading={submitting}
          onClick={handleUpdateClick}
        >
          Save
        </Button>
      </Row>
    </Container>
  );
};

const iconStyle: React.CSSProperties = {
  width: 18,
  fontSize: 18,
  marginRight: 10,
  color: '#666',
};

const Container = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
`;

const DetailImgWrapper = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DetailImg = styled.img`
  display: inline-block;
  border-radius: 10px;
`;

export default ComponentDetail;
