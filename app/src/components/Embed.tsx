import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

function extractHostname(url: string) {
  if (!url) return '';
  let hostname;
  if (url.indexOf('//') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }
  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];
  return hostname;
}

async function fetchSoundcloudHtml(url: string) {
  const resp = await fetch(
    'https://soundcloud.com/oembed?format=json&maxheight=300&url=' + url,
  );
  if (!resp.ok) {
    return '';
  }
  const json = await resp.json();
  return <div dangerouslySetInnerHTML={{ __html: json.html }} />;
}

function constructYoutubeHtml(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  const id = match && match[2].length === 11 ? match[2] : null;
  if (id === null) {
    return createLink(url);
  }
  return (
    <VideoWrapper>
      <Video
        title="Article Video"
        width="100%"
        height="400"
        src={'https://www.youtube.com/embed/' + id}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </VideoWrapper>
  );
}

const VideoWrapper = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
`;

const Video = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

function createLink(url: string) {
  return <a href={url}>{url}</a>;
}

const Embed: React.FC<{ url: string }> = ({ url }) => {
  const [html, setHtml] = useState<JSX.Element>();
  const [loading, setLoading] = useState(true);
  const source = extractHostname(url);

  useEffect(() => {
    async function fn() {
      try {
        switch (source) {
          case 'soundcloud.com':
            setHtml((await fetchSoundcloudHtml(url)) || createLink(url));
            break;
          case 'www.youtube.com':
            setHtml(constructYoutubeHtml(url));
            break;
          default:
            setHtml(createLink(url));
            break;
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    fn();
  }, [source, url]);
  if (loading) return <div />;
  return <div style={{ width: '100%' }}>{html}</div>;
};

export default Embed;
