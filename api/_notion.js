const NOTION_VERSION = '2022-06-28';

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

async function createPage(databaseId, properties) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Notion API error');
  return data;
}

async function updatePage(pageId, properties) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ properties }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Notion API error');
  return data;
}

module.exports = { createPage, updatePage };
