/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { commits, issues, pullRequests, startDate, endDate } = await req.json();

    // Ensure the startDate and endDate are passed and formatted correctly
    const formattedStartDate = startDate || '未知日期';
    const formattedEndDate = endDate || '未知日期';

    // Prepare a prompt for GPT-4 model
    const prompt = `
      你接下来将收到一个GitHub开源项目的最新进展，包含以下数据：
        - **commits**：最新的提交记录。
        - **issues**：当前打开或关闭的问题。
        - **pullRequests**：当前的拉取请求（PR）。

        请根据这些数据生成一份详细的中文报告，报告内容应包括：

        1. **项目名称和日期**：报告的标题部分。
        2. **新增功能**：列出所有新增的功能和模块。
        3. **主要改进**：列出所有重要的功能或代码改进。
        4. **修复问题**：列出修复的bug或已解决的技术问题。
        5. **特性变化**：描述这些新增功能和改进对项目本身的影响和变化，具体到用户体验、性能或其他重要方面。
        6. **修改意图**：分析开发者进行这些修改的目的或意图，可能是为了提高性能、提升用户体验、兼容性改进等。

        请根据以下数据生成报告：

        - **commits**: 包含最新的提交记录（${commits.map((c: any) => c.commit.message).join('\n')}）。
        - **issues**: 包含项目当前的所有问题（${issues.map((i: any) => i.title).join('\n')}），包括打开和关闭的问题。
        - **pullRequests**: 包含当前的所有拉取请求（${pullRequests.map((pr: any) => pr.title).join('\n')}）。

        ### 报告模板：

        # 项目名称 - 进展报告（${formattedStartDate} 至 ${formattedEndDate}）


        ## 新增功能
        - 功能名称：简短描述
        - 功能名称：简短描述

        ## 主要改进
        - 改进内容：简短描述
        - 改进内容：简短描述

        ## 修复问题
        - 修复问题描述：简短说明
        - 修复问题描述：简短说明

        ## 特性变化
        - 变化内容：描述新增功能和改进如何影响项目，可能的性能提升、用户体验提升或其他特性变化。

        ## 修改意图
        - 修改意图：分析修改背后的目的，是否是为了兼容新的依赖、提升性能、修复现有问题或是新增功能等。



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
