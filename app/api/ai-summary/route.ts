/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
      const { commits, issues, pullRequests } = await req.json();
    // Prepare a prompt for GPT-4 model
      const prompt = `
        请根据以下 GitHub 活动内容生成一份总结，并整理出所有涉及到的功能变化：\n
        1. 提交记录：\n
        ${commits.map((c: any) => c.commit.message).join('\n')}
        2. 问题记录：\n
        ${issues.map((i: any) => i.title).join('\n')}
        3. 拉取请求记录：\n
        ${pullRequests.map((pr: any) => pr.title).join('\n')}
        
        总结中应该包括：
        - 功能性变化：哪些功能进行了改进、修复或新增？
        - 影响范围：这些更新可能影响到哪些模块、功能或用户体验？
        - 其他值得关注的点。
        
        请将总结内容用中文输出。
    `;

    // OpenAI's API request for stream response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'You are a helpful assistant' },
            { role: 'user', content: prompt }
        ],
      stream: true, // Enable streaming
    });

    // Ensure that we are dealing with a stream and handle it correctly
    const readableStream = new ReadableStream({
      async start(controller) {
        // Iterate through each chunk in the stream
        for await (const chunk of stream) {
          // The content comes from the 'delta' property
          const delta = chunk.choices[0].delta;

          // Check if 'content' exists in delta and append it
          if (delta && delta.content) {
              // Push the current text chunk to the readable stream
            controller.enqueue(new TextEncoder().encode(delta.content));
          }
        }

        // Close the stream when all chunks are processed
        controller.close();
      },
    });

    // Return the stream to the client
    return new NextResponse(readableStream);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
