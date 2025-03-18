/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, TextInput, Select, Alert, Spinner } from 'flowbite-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionManager() {
  interface Subscription {
    id: string;
    repo: string;
    plan: string;
  }

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [repo, setRepo] = useState('');
  const [plan, setPlan] = useState('basic');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // 使用 useRouter 钩子

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/subscriptions');
        setSubscriptions(response.data);
      } catch (error: any) {
        setMessage(`Error: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/subscriptions', { repo, plan });
      setSubscriptions([...subscriptions, response.data]);
      setRepo('');
      setPlan('basic');
      setMessage('Subscription created!');
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, newPlan: string) => {
    setLoading(true);
    try {
      const response = await axios.put('/api/subscriptions', { id, plan: newPlan });
      setSubscriptions(subscriptions.map(sub => (sub.id === id ? response.data : sub)));
      setMessage('Subscription updated!');
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete('/api/subscriptions', { data: { id } });
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      setMessage('Subscription deleted!');
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 新增的函数：用于处理点击订阅项时的导航
  const handleNavigateToDetail = (id: string) => {
    router.push(`/subscriptions/${id}`);
  };
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Your Subscriptions</h1>
      {message && <Alert color="info">{message}</Alert>}
        <>
          <Card>
            <TextInput
              placeholder="Repository name"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="mb-4"
            />
            <Select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="mb-4"
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </Select>
            <Button onClick={handleSubscribe} gradientMonochrome="info">
              Subscribe
            </Button>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center p-4">
              <Spinner size="lg" />
            </div>
          ) : (
          <ul className="mt-6 space-y-4">
            {subscriptions.map((sub) => (
              <Card key={sub.id}
                className="p-4 cursor-pointer border border-transparent hover:border-primary hover:shadow-md transition duration-300 rounded-2xl"
                onClick={() => handleNavigateToDetail(sub.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{sub.repo}</h3>
                    <p className="text-sm text-gray-500">{sub.plan}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleUpdate(sub.id, 'premium')} size="xs">
                      Upgrade to Premium
                    </Button>
                    <Button onClick={() => handleDelete(sub.id)} size="xs" color="failure">
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </ul>
          )}
        </>
    </div>
  );
}
