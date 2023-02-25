import type { NextApiRequest, NextApiResponse } from "next";

const notionDatabaseUrl = (databaseId: string) =>
  `https://api.notion.com/v1/databases/${databaseId}/query`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.query.token == null || req.query.id == null) {
      res.status(400).json({
        statusCode: 400,
        message: "Missing token or id query parameter",
      });

      return;
    }

    const { token, id } = req.query;
    const url = notionDatabaseUrl(id as string);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      res
        .status(response.status)
        .json({ statusCode: response.status, message: response.statusText });

      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
}
