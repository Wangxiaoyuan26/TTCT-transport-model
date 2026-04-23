import { NextRequest, NextResponse } from 'next/server';
import { FetchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const EXCEL_URL = 'https://coze-coding-project.tos.coze.site/create_attachment/2026-04-16/2174187310431552_f4b0a8de0ec997c5aef159f5a36cdd97_%E6%8B%9B%E6%A0%87%E7%85%A4%E8%BF%90%E8%BE%93%E6%94%B6%E5%85%A5%E6%88%90%E6%9C%AC%E5%8D%95%E4%BB%B7%E6%A8%A1%E5%9E%8B4.16.xlsx?sign=4898396290-b050a89eba-0-d07958333769423622cf89a4398776086f496ce1233a01a7fcb52872fe4b100a';

export async function GET(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new FetchClient(config, customHeaders);

    const response = await client.fetch(EXCEL_URL);

    if (response.status_code !== 0) {
      return NextResponse.json(
        { error: 'Failed to fetch Excel file', details: response.status_message },
        { status: 500 }
      );
    }

    // Extract text content from the Excel file
    const textContent = response.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');

    return NextResponse.json({
      success: true,
      title: response.title,
      content: textContent,
      rawContent: response.content,
    });
  } catch (error) {
    console.error('Error fetching Excel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
