/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Card, Alert, Spinner, Datepicker } from 'flowbite-react';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';

export default function SubscriptionDetail() {
  const [commits, setCommits] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/subscriptions/${id}?date=${selectedDate}`);
        const { commits, issues, pullRequests } = response.data;
        setCommits(commits);
        setIssues(issues);
        setPullRequests(pullRequests);
      } catch (error: any) {
        setMessage(`Error: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, selectedDate]);

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
  };

  const typeStyles = {
    commits: {
      card: 'bg-blue-100 border-blue-300 text-blue-800',
      title: 'text-blue-800 mt-4',
    },
    issues: {
      card: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      title: 'text-yellow-800 mt-4',
    },
    pullRequests: {
      card: 'bg-green-100 border-green-300 text-green-800',
      title: 'text-green-800 mt-4',
    },
  };

  const renderCard = (data: any[], type: 'commits' | 'issues' | 'pullRequests') => {

    return data.map((item, index) => (
      <Card key={index} className={`p-4 ${typeStyles[type].card} border-l-4`}>
        <div className="flex items-center space-x-4">
          <Image
            src={item.user?.avatar_url || item.commit?.author?.avatar_url || item.author?.avatar_url || '/default-avatar.png'}
            alt={item.user?.login || item.commit?.author?.name || item.author?.login || 'Author'}
            width={40}
            height={40}
            className="rounded-full border-2 border-white shadow-sm"
          />
          <div>
            <h3 className={`text-lg font-semibold ${typeStyles[type].title}`}>{item.user?.login || item.commit?.author?.name}</h3>
            <p className="text-sm text-gray-500">{item.title || item.commit?.message}</p>
            <p className="text-xs text-gray-400 mt-4">{dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}</p>
            <a href={item.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              View More
            </a>
          </div>
        </div>
      </Card>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Repository Updates</h1>
      {message && <Alert color="info">{message}</Alert>}

      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Select Date
        </label>
        <Datepicker
          id="date"
          value={new Date(selectedDate)}
          onChange={(date: Date | null) => handleDateChange(date)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-4">
          <Spinner size="lg" />
        </div>
      ) : (
        <div>
          <h2 className={`text-xl font-semibold ${typeStyles.commits.title}`}>Commits</h2>
          {commits.length === 0 ? (
            <p>No commits found for this date.</p>
          ) : (
            <ul className="space-y-4">{renderCard(commits, 'commits')}</ul>
          )}

          <h2 className={`text-xl font-semibold ${typeStyles.issues.title}`}>Issues</h2>
          {issues.length === 0 ? (
            <p>No issues found for this date.</p>
          ) : (
            <ul className="space-y-4">{renderCard(issues, 'issues')}</ul>
          )}

          <h2 className={`text-xl font-semibold ${typeStyles.pullRequests.title}`}>Pull Requests</h2>
          {pullRequests.length === 0 ? (
            <p>No pull requests found for this date.</p>
          ) : (
            <ul className="space-y-4">{renderCard(pullRequests, 'pullRequests')}</ul>
          )}
        </div>
      )}
    </div>
  );
}
