// src/api/index.ts
const API_BASE = "http://localhost:8000/api";

export async function apiGet(endpoint: string) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
  return res.json();
}

// 使用例子：
// const members = await apiGet("/members");
// const contentData = await apiGet(`/documents/${id}`); 
// 注意内容接口现在返回的是 { content: "..." }，记得取 .content