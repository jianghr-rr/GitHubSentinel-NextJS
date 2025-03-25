/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Card, Alert, Spinner, Datepicker, Modal, Button } from 'flowbite-react';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import isBetween from 'dayjs/plugin/isBetween';
import Link from 'next/link';

// 使用 dayjs 插件
dayjs.extend(isBetween);

export default function SubscriptionDetail() {
  const [repositoryName, setRepositoryName] = useState('');
  const [commits, setCommits] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState(dayjs().subtract(1, 'month').format('YYYY-MM-DD'));
  const [selectedEndDate, setSelectedEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/subscriptions/${id}?startDate=${selectedStartDate}&endDate=${selectedEndDate}`);
        const { commits, issues, pullRequests, repositoryName } = response.data;
        setCommits(commits);
        setIssues(issues);
        setPullRequests(pullRequests);
        setRepositoryName(repositoryName);
      } catch (error: any) {
        setMessage(`Error: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, selectedStartDate, selectedEndDate]);

  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedStartDate(dayjs(date).format('YYYY-MM-DD'));
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedEndDate(dayjs(date).format('YYYY-MM-DD'));
  };

  const handleSummaryGeneration = async () => {
    setAiSummary('');
    setIsModalOpen(true);

    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commits,
          issues,
          pullRequests,
          startDate: selectedStartDate,
          endDate: selectedEndDate,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader!.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setAiSummary((prevContent) => prevContent + chunk);
        }
      }
    } catch (error) {
      setMessage(`Failed to generate AI summary ${error}`);
    }
  };

  const renderCard = (data: any[], type: string) => {
    return data.map((item, index) => {
      let cardColor = '';
      switch (type) {
        case 'commits':
          cardColor = 'bg-blue-100'; // 蓝色卡片
          break;
        case 'issues':
          cardColor = 'bg-yellow-100'; // 黄色卡片
          break;
        case 'pullRequests':
          cardColor = 'bg-green-100'; // 绿色卡片
          break;
        default:
          cardColor = 'bg-gray-100'; // 默认灰色
          break;
      }

      console.log('item', item);
      const avatarUrl = item.commit?.author?.avatar_url || item.author?.avatar_url || item.user?.avatar_url; // 获取头像 URL

      return (
        <Card key={index} className={`mb-4 ${cardColor}`}>
          <div className="flex items-center">
            {/* 头像 */}
            <Image
              src={avatarUrl || '/default-avatar.png'} // 默认头像，如果没有提供
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full mr-4"
            />
            <div>
              <h5 className="text-lg font-medium text-gray-900">
                {item.title || item.commit?.message}
              </h5>
              <p className="text-sm text-gray-500">
                {type === 'commits' && `Committed by ${item.commit.author.name} on ${dayjs(item.commit.author.date).format('YYYY-MM-DD')}`}
                {type === 'issues' && `Created on ${dayjs(item.created_at).format('YYYY-MM-DD')}`}
                {type === 'pullRequests' && `Created on ${dayjs(item.created_at).format('YYYY-MM-DD')}`}
              </p>
            </div>
          </div>

          {/* 点击卡片跳转到详情页 */}
          <Link target='_blank' href={item.html_url} className="text-blue-600 hover:text-blue-800">
            View details
          </Link>
        </Card>
      );
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Repository: {repositoryName}</h1>
      {message && <Alert color="info">{message}</Alert>}

      <div className="mb-4">
        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <Datepicker
          id="start-date"
          value={new Date(selectedStartDate)}
          onChange={(date: Date | null) => handleStartDateChange(date)}
          className="mt-1 block w-full"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
          End Date
        </label>
        <Datepicker
          id="end-date"
          value={new Date(selectedEndDate)}
          onChange={(date: Date | null) => handleEndDateChange(date)}
          className="mt-1 block w-full"
        />
      </div>

      <button 
        onClick={handleSummaryGeneration} 
        className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Generate AI Summary
      </button>

      {loading ? (
        <div className="flex justify-center items-center p-4">
          <Spinner size="lg" />
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold">Commits</h2>
          {commits.length === 0 ? (
            <p>No commits found for this date range.</p>
          ) : (
            <ul>{renderCard(commits, 'commits')}</ul>
          )}

          <h2 className="text-xl font-semibold">Issues</h2>
          {issues.length === 0 ? (
            <p>No issues found for this date range.</p>
          ) : (
            <ul>{renderCard(issues, 'issues')}</ul>
          )}

          <h2 className="text-xl font-semibold">Pull Requests</h2>
          {pullRequests.length === 0 ? (
            <p>No pull requests found for this date range.</p>
          ) : (
            <ul>{renderCard(pullRequests, 'pullRequests')}</ul>
          )}
        </div>
      )}

      {isModalOpen && (
        <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Modal.Header>AI Summary</Modal.Header>
          <Modal.Body>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {aiSummary}
            </ReactMarkdown>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
