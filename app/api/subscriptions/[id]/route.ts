/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { auth } from '~/auth';
import { NextResponse, NextRequest } from 'next/server';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

const GITHUB_API_URL = 'https://api.github.com/repos';
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

// 获取仓库的详细信息，包括名称
async function fetchRepositoryInfo(repo: string) {
  const response = await axios.get(`${GITHUB_API_URL}/${repo}`, {
    headers: {
      Authorization: `token ${GITHUB_API_TOKEN}`,
    },
  });
  return response.data;
}

// 获取指定仓库的提交信息
async function fetchCommits(repo: string, date: string) {
  const response = await axios.get(`${GITHUB_API_URL}/${repo}/commits`, {
    headers: {
      Authorization: `token ${GITHUB_API_TOKEN}`,
    },
    params: {
      since: dayjs(date).startOf('day').toISOString(),
      until: dayjs(date).endOf('day').toISOString(),
    },
  });
  return response.data;
}

// 获取指定仓库的议题信息
async function fetchIssues(repo: string, date: string) {
  const response = await axios.get(`${GITHUB_API_URL}/${repo}/issues`, {
    headers: {
      Authorization: `token ${GITHUB_API_TOKEN}`,
    },
    params: {
      since: dayjs(date).startOf('day').toISOString(),
      state: 'all',
    },
  });
  return response.data.filter((issue: any) => dayjs(issue.created_at).isSame(date, 'day'));
}

// 获取指定仓库的拉取请求信息
async function fetchPullRequests(repo: string, date: string) {
  const response = await axios.get(`${GITHUB_API_URL}/${repo}/pulls`, {
    headers: {
      Authorization: `token ${GITHUB_API_TOKEN}`,
    },
    params: {
      state: 'all',
    },
  });
  return response.data.filter((pr: any) => dayjs(pr.created_at).isSame(date, 'day'));
}

// 处理 GET 请求 - 获取指定订阅的更新信息
export async function GET(req: NextRequest) {
  const url = new URL(req.url); 
  const id = url.pathname.split("/").pop(); // 获取路径中的 id

  const session = await auth();
  if (session && session.user) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id },
      });

      if (!subscription) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
      }

      const url = new URL(req.url);
      const date = url.searchParams.get('date') || dayjs().format('YYYY-MM-DD');

      // 获取 GitHub 仓库的详细信息，包括名称
      const repositoryInfo = await fetchRepositoryInfo(subscription.repo);

      // 获取 GitHub 仓库的动态
      const [commits, issues, pullRequests] = await Promise.all([
        fetchCommits(subscription.repo, date),
        fetchIssues(subscription.repo, date),
        fetchPullRequests(subscription.repo, date),
      ]);

      return NextResponse.json({
        repositoryName: repositoryInfo.name,
        commits,
        issues,
        pullRequests,
      });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to fetch subscription updates' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
