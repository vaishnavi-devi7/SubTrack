import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import API from '../api/api';
import AddSubscription from './AddSubscription';

type Subscription = {
  id: number;
  name: string;
  category: string;
  cost: string;
  currency: string;
  billing_cycle: string;
  start_date: string;
  renewal_date: string;
  status: string;
  is_trial: boolean;
  trial_end_date: string | null;
  notes: string;
  color: string;
};

type PaymentRow = {
  id: number;
  name: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
};

type ActiveView =
  | 'overview'
  | 'subscriptions'
  | 'payments'
  | 'renewals'
  | 'notifications'
  | 'savings'
  | 'usage';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: 'trial' | 'renewal';
  daysLeft: number;
};

type UsageAnalyticsItem = {
  id: number;
  name: string;
  totalHours: number;
  daysUsed: number;
  costPerUse: number;
  valueScore: number;
  label: 'High Value' | 'Underused' | 'Review Soon';
};

const pieColors = [
  '#60a5fa',
  '#34d399',
  '#f59e0b',
  '#f472b6',
  '#a78bfa',
  '#f87171',
  '#22c55e',
  '#38bdf8',
];

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchSubscriptions = async () => {
    try {
      const res = await API.get('/subscriptions');
      setSubscriptions(res.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      alert('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/subscriptions/${id}`);
      alert('Deleted successfully 🗑️');
      if (editingSubscription?.id === id) {
        setEditingSubscription(null);
      }
      fetchSubscriptions();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed ❌');
    }
  };

  const normalizedCost = (sub: Subscription) =>
    sub.billing_cycle === 'yearly' ? Number(sub.cost) / 12 : Number(sub.cost);

  const totalMonthlySpend = subscriptions.reduce((sum, sub) => {
    return sum + normalizedCost(sub);
  }, 0);

  const chartData = subscriptions.map((sub) => ({
    name: sub.name,
    cost: normalizedCost(sub),
  }));

  const categoryChartData = useMemo(() => {
    const totals: Record<string, number> = {};

    subscriptions.forEach((sub) => {
      const category = sub.category || 'Other';
      totals[category] = (totals[category] || 0) + normalizedCost(sub);
    });

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));
  }, [subscriptions]);

  const categorySummary = useMemo(() => {
    const totals: Record<string, number> = {};

    subscriptions.forEach((sub) => {
      const category = sub.category || 'Other';
      totals[category] = (totals[category] || 0) + 1;
    });

    return Object.entries(totals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [subscriptions]);

  const upcomingRenewals = useMemo(() => {
    const today = new Date();

    return [...subscriptions]
      .map((sub) => {
        const renewalDate = new Date(sub.renewal_date);
        const diffTime = renewalDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...sub,
          daysLeft,
        };
      })
      .filter((sub) => sub.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [subscriptions]);

  const recentPayments = useMemo<PaymentRow[]>(() => {
    return [...subscriptions]
      .map((sub) => {
        const renewalDate = new Date(sub.renewal_date);
        const paymentDate = new Date(renewalDate);
        paymentDate.setMonth(paymentDate.getMonth() - 1);

        const today = new Date();
        const isFuture = renewalDate.getTime() > today.getTime();

        return {
          id: sub.id,
          name: sub.name,
          amount: normalizedCost(sub),
          date: paymentDate.toLocaleDateString(),
          status: (isFuture ? 'Paid' : 'Pending') as 'Paid' | 'Pending',
        };
      })
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [subscriptions]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const today = new Date();
    const items: NotificationItem[] = [];

    subscriptions.forEach((sub) => {
      const renewalDate = new Date(sub.renewal_date);
      const renewalDiff = renewalDate.getTime() - today.getTime();
      const renewalDaysLeft = Math.ceil(
        renewalDiff / (1000 * 60 * 60 * 24)
      );

      if (renewalDaysLeft >= 0 && renewalDaysLeft <= 7) {
        items.push({
          id: `renewal-${sub.id}`,
          title: 'Upcoming Renewal',
          message: `${sub.name} renews in ${renewalDaysLeft} day${
            renewalDaysLeft !== 1 ? 's' : ''
          }.`,
          type: 'renewal',
          daysLeft: renewalDaysLeft,
        });
      }

      if (sub.is_trial && sub.trial_end_date) {
        const trialDate = new Date(sub.trial_end_date);
        const trialDiff = trialDate.getTime() - today.getTime();
        const trialDaysLeft = Math.ceil(
          trialDiff / (1000 * 60 * 60 * 24)
        );

        if (trialDaysLeft >= 0 && trialDaysLeft <= 7) {
          items.push({
            id: `trial-${sub.id}`,
            title: 'Trial Ending Soon',
            message: `${sub.name} trial ends in ${trialDaysLeft} day${
              trialDaysLeft !== 1 ? 's' : ''
            }.`,
            type: 'trial',
            daysLeft: trialDaysLeft,
          });
        }
      }
    });

    return items.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch = sub.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : sub.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, statusFilter]);

  const cancelledSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => sub.status === 'cancelled');
  }, [subscriptions]);

  const monthlySavings = useMemo(() => {
    return cancelledSubscriptions.reduce((sum, sub) => {
      return sum + normalizedCost(sub);
    }, 0);
  }, [cancelledSubscriptions]);

  const yearlySavings = useMemo(() => {
    return monthlySavings * 12;
  }, [monthlySavings]);

  const usageAnalytics = useMemo<UsageAnalyticsItem[]>(() => {
    return subscriptions.map((sub, index) => {
      const cost = normalizedCost(sub);
      const daysUsed = ((index + 3) * 4) % 28 + 1;
      const totalHours = ((index + 2) * 7) % 40 + 2;
      const costPerUse = Number((cost / daysUsed).toFixed(2));
      const valueScore = Math.max(
        1,
        Math.min(100, Math.round((totalHours * 8) / Math.max(cost, 1) * 100))
      );

      let label: 'High Value' | 'Underused' | 'Review Soon' = 'Review Soon';

      if (valueScore >= 70) {
        label = 'High Value';
      } else if (valueScore <= 35) {
        label = 'Underused';
      }

      return {
        id: sub.id,
        name: sub.name,
        totalHours,
        daysUsed,
        costPerUse,
        valueScore,
        label,
      };
    });
  }, [subscriptions]);

  const usageChartData = usageAnalytics.map((item) => ({
    name: item.name,
    hours: item.totalHours,
  }));

  const renderOverview = () => (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={statCardAnimated}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Total Monthly Spend</h3>
          <p style={statNumber}>₹{totalMonthlySpend.toFixed(2)}</p>
        </div>

        <div style={statCardAnimated}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Total Subscriptions</h3>
          <p style={statNumber}>{subscriptions.length}</p>
        </div>

        <div style={statCardAnimated}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Upcoming Alerts</h3>
          <p style={statNumber}>{notifications.length}</p>
        </div>

        <div style={statCardAnimated}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Monthly Savings</h3>
          <p style={statNumber}>₹{monthlySavings.toFixed(2)}</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={panelCardAnimated}>
          <h2 style={panelTitle}>Subscription Costs</h2>

          {subscriptions.length === 0 ? (
            <p>No chart data available.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cost" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={panelCardAnimated}>
          <h2 style={panelTitle}>Upcoming Renewals</h2>

          {upcomingRenewals.length === 0 ? (
            <p style={{ color: '#64748b' }}>No upcoming renewals.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingRenewals.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    padding: '14px',
                    backgroundColor: '#f8fbff',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: '#1e293b',
                          fontSize: '18px',
                        }}
                      >
                        {sub.name}
                      </h3>
                      <p
                        style={{
                          margin: '6px 0 0 0',
                          color: '#64748b',
                          fontSize: '14px',
                        }}
                      >
                        {new Date(sub.renewal_date).toLocaleDateString()} • ₹
                        {sub.cost}
                      </p>
                    </div>

                    <span
                      style={{
                        padding: '6px 10px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        fontWeight: 700,
                        backgroundColor:
                          sub.daysLeft <= 3
                            ? '#fee2e2'
                            : sub.daysLeft <= 7
                            ? '#fef3c7'
                            : '#dcfce7',
                        color:
                          sub.daysLeft <= 3
                            ? '#b91c1c'
                            : sub.daysLeft <= 7
                            ? '#92400e'
                            : '#166534',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sub.daysLeft === 0
                        ? 'Today'
                        : `${sub.daysLeft} day${sub.daysLeft > 1 ? 's' : ''} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={panelCardAnimated}>
          <h2 style={panelTitle}>Spending by Category</h2>

          {categoryChartData.length === 0 ? (
            <p style={{ color: '#64748b' }}>No category data available.</p>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={panelCardAnimated}>
          <h2 style={panelTitle}>Category Summary</h2>

          {categorySummary.length === 0 ? (
            <p style={{ color: '#64748b' }}>No categories found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categorySummary.map((item, index) => (
                <div
                  key={item.name}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fbff',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '999px',
                        backgroundColor: pieColors[index % pieColors.length],
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ color: '#1e293b', fontWeight: 600 }}>
                      {item.name}
                    </span>
                  </div>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderSubscriptions = () => (
    <>
      <AddSubscription
        onSuccess={fetchSubscriptions}
        editingSubscription={editingSubscription}
        clearEditing={() => setEditingSubscription(null)}
      />

      <div style={{ ...panelCardAnimated, marginBottom: '20px' }}>
        <h2 style={panelTitle}>Search & Filter</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 220px',
            gap: '16px',
            marginTop: '16px',
          }}
        >
          <input
            type="text"
            placeholder="Search subscription name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={filterInput}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={filterInput}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="paused">Paused</option>
            <option value="trial">Trial</option>
          </select>
        </div>
      </div>

      <div style={panelCardAnimated}>
        <h2 style={panelTitle}>Your Subscriptions</h2>

        {loading ? (
          <p>Loading subscriptions...</p>
        ) : filteredSubscriptions.length === 0 ? (
          <p>No matching subscriptions found.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredSubscriptions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setEditingSubscription(sub)}
                style={subscriptionCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow =
                    '0 14px 30px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(0,0,0,0.04)';
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '999px',
                    backgroundColor: sub.color,
                    marginBottom: '10px',
                  }}
                />

                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: '8px',
                    color: '#1e293b',
                  }}
                >
                  {sub.name}
                </h3>

                <p style={cardText}>Category: {sub.category}</p>
                <p style={cardText}>Cost: ₹{sub.cost}</p>
                <p style={cardText}>Billing: {sub.billing_cycle}</p>
                <p style={cardText}>
                  Renewal: {new Date(sub.renewal_date).toLocaleDateString()}
                </p>
                <p style={cardText}>Status: {sub.status}</p>
                <p style={cardText}>Notes: {sub.notes || 'No notes'}</p>

                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSubscription(sub);
                    }}
                    style={editButton}
                  >
                    Edit
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sub.id);
                    }}
                    style={deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderPayments = () => (
    <div style={panelCardAnimated}>
      <h2 style={panelTitle}>Recent Payments</h2>

      {recentPayments.length === 0 ? (
        <p style={{ color: '#64748b' }}>No payment data available.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                <th style={tableHead}>Service</th>
                <th style={tableHead}>Amount</th>
                <th style={tableHead}>Date</th>
                <th style={tableHead}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td style={tableCell}>{payment.name}</td>
                  <td style={tableCell}>₹{payment.amount.toFixed(2)}</td>
                  <td style={tableCell}>{payment.date}</td>
                  <td style={tableCell}>
                    <span
                      style={{
                        padding: '6px 10px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        fontWeight: 700,
                        backgroundColor:
                          payment.status === 'Paid' ? '#dcfce7' : '#fef3c7',
                        color:
                          payment.status === 'Paid' ? '#166534' : '#92400e',
                      }}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderRenewals = () => (
    <div style={panelCardAnimated}>
      <h2 style={panelTitle}>Upcoming Renewals</h2>

      {upcomingRenewals.length === 0 ? (
        <p style={{ color: '#64748b' }}>No upcoming renewals.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {upcomingRenewals.map((sub) => (
            <div
              key={sub.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '14px',
                padding: '14px',
                backgroundColor: '#f8fbff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: '#1e293b',
                      fontSize: '18px',
                    }}
                  >
                    {sub.name}
                  </h3>
                  <p
                    style={{
                      margin: '6px 0 0 0',
                      color: '#64748b',
                      fontSize: '14px',
                    }}
                  >
                    {new Date(sub.renewal_date).toLocaleDateString()} • ₹
                    {sub.cost}
                  </p>
                </div>

                <span
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor:
                      sub.daysLeft <= 3
                        ? '#fee2e2'
                        : sub.daysLeft <= 7
                        ? '#fef3c7'
                        : '#dcfce7',
                    color:
                      sub.daysLeft <= 3
                        ? '#b91c1c'
                        : sub.daysLeft <= 7
                        ? '#92400e'
                        : '#166534',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sub.daysLeft === 0
                    ? 'Today'
                    : `${sub.daysLeft} day${sub.daysLeft > 1 ? 's' : ''} left`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div style={panelCardAnimated}>
      <h2 style={panelTitle}>Notifications</h2>

      {notifications.length === 0 ? (
        <p style={{ color: '#64748b' }}>No alerts right now.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '14px',
                padding: '14px',
                backgroundColor:
                  item.type === 'trial' ? '#fff7ed' : '#f8fbff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: '#1e293b',
                      fontSize: '17px',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      margin: '6px 0 0 0',
                      color: '#64748b',
                    }}
                  >
                    {item.message}
                  </p>
                </div>

                <span
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor:
                      item.type === 'trial' ? '#fed7aa' : '#dbeafe',
                    color:
                      item.type === 'trial' ? '#9a3412' : '#1d4ed8',
                  }}
                >
                  {item.type === 'trial' ? 'Trial' : 'Renewal'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSavings = () => (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={statCardAnimated}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Cancelled Services</h3>
          <p style={statNumber}>{cancelledSubscriptions.length}</p>
        </div>

        <div style={statCardAnimated}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Monthly Savings</h3>
          <p style={statNumber}>₹{monthlySavings.toFixed(2)}</p>
        </div>

        <div style={statCardAnimated}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Yearly Savings</h3>
          <p style={statNumber}>₹{yearlySavings.toFixed(2)}</p>
        </div>
      </div>

      <div style={panelCardAnimated}>
        <h2 style={panelTitle}>Savings Breakdown</h2>

        {cancelledSubscriptions.length === 0 ? (
          <p style={{ color: '#64748b' }}>No cancelled subscriptions yet.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {cancelledSubscriptions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '16px',
                  backgroundColor: '#f9fbff',
                }}
              >
                <h3 style={{ marginTop: 0, color: '#1e293b' }}>{sub.name}</h3>
                <p style={cardText}>Category: {sub.category}</p>
                <p style={cardText}>Status: {sub.status}</p>
                <p style={cardText}>Billing: {sub.billing_cycle}</p>
                <p style={cardText}>
                  Saved Monthly: ₹
                  {normalizedCost(sub).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderUsage = () => (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={panelCardAnimated}>
          <h2 style={panelTitle}>Usage Hours</h2>

          {usageChartData.length === 0 ? (
            <p style={{ color: '#64748b' }}>No usage data available.</p>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={usageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#93c5fd" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={panelCardAnimated}>
          <h2 style={panelTitle}>Usage Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={statMiniCard}>
              <p style={miniLabel}>Tracked Services</p>
              <p style={miniValue}>{usageAnalytics.length}</p>
            </div>
            <div style={statMiniCard}>
              <p style={miniLabel}>Average Value Score</p>
              <p style={miniValue}>
                {usageAnalytics.length
                  ? Math.round(
                      usageAnalytics.reduce((sum, item) => sum + item.valueScore, 0) /
                        usageAnalytics.length
                    )
                  : 0}
              </p>
            </div>
            <div style={statMiniCard}>
              <p style={miniLabel}>High Value Services</p>
              <p style={miniValue}>
                {usageAnalytics.filter((item) => item.label === 'High Value').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={panelCardAnimated}>
        <h2 style={panelTitle}>Usage Analytics</h2>

        {usageAnalytics.length === 0 ? (
          <p style={{ color: '#64748b' }}>No analytics available.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  <th style={tableHead}>Service</th>
                  <th style={tableHead}>Hours</th>
                  <th style={tableHead}>Days Used</th>
                  <th style={tableHead}>Cost / Use</th>
                  <th style={tableHead}>Value Score</th>
                  <th style={tableHead}>Label</th>
                </tr>
              </thead>
              <tbody>
                {usageAnalytics.map((item) => (
                  <tr key={item.id}>
                    <td style={tableCell}>{item.name}</td>
                    <td style={tableCell}>{item.totalHours}</td>
                    <td style={tableCell}>{item.daysUsed}</td>
                    <td style={tableCell}>₹{item.costPerUse}</td>
                    <td style={tableCell}>{item.valueScore}</td>
                    <td style={tableCell}>
                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor:
                            item.label === 'High Value'
                              ? '#dcfce7'
                              : item.label === 'Underused'
                              ? '#fee2e2'
                              : '#fef3c7',
                          color:
                            item.label === 'High Value'
                              ? '#166534'
                              : item.label === 'Underused'
                              ? '#b91c1c'
                              : '#92400e',
                        }}
                      >
                        {item.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background:
          'radial-gradient(circle at top right, rgba(96,165,250,0.12), transparent 22%), linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <aside
        style={{
          width: '250px',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRight: '1px solid #e5e7eb',
          padding: '28px 18px',
          boxShadow: '4px 0 18px rgba(0,0,0,0.03)',
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: '30px',
            color: '#1e3a8a',
            fontSize: '30px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
          }}
        >
          SubTrack
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => setActiveView('overview')}
            style={sidebarButton(activeView === 'overview')}
          >
            Dashboard Overview
          </button>

          <button
            onClick={() => setActiveView('subscriptions')}
            style={sidebarButton(activeView === 'subscriptions')}
          >
            Subscriptions
          </button>

          <button
            onClick={() => setActiveView('payments')}
            style={sidebarButton(activeView === 'payments')}
          >
            Recent Payments
          </button>

          <button
            onClick={() => setActiveView('renewals')}
            style={sidebarButton(activeView === 'renewals')}
          >
            Upcoming Renewals
          </button>

          <button
            onClick={() => setActiveView('notifications')}
            style={sidebarButton(activeView === 'notifications')}
          >
            Notifications
          </button>

          <button
            onClick={() => setActiveView('savings')}
            style={sidebarButton(activeView === 'savings')}
          >
            Savings
          </button>

          <button
            onClick={() => setActiveView('usage')}
            style={sidebarButton(activeView === 'usage')}
          >
            Usage Analytics
          </button>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.reload();
          }}
          style={{
            marginTop: '30px',
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            background:
              'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            color: '#1e3a8a',
            fontWeight: 700,
            transition: 'all 0.25s ease',
          }}
        >
          Logout
        </button>
      </aside>

      <main
        style={{
          flex: 1,
          padding: '32px',
        }}
      >
        <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px', animation: 'fadeUp 0.5s ease' }}>
            <h1
              style={{
                margin: 0,
                color: '#1e3a8a',
                fontSize: '52px',
                lineHeight: 1.05,
                letterSpacing: '-1px',
                fontWeight: 800,
              }}
            >
              {activeView === 'overview' && 'Dashboard Overview'}
              {activeView === 'subscriptions' && 'Manage Subscriptions'}
              {activeView === 'payments' && 'Recent Payments'}
              {activeView === 'renewals' && 'Upcoming Renewals'}
              {activeView === 'notifications' && 'Notifications'}
              {activeView === 'savings' && 'Savings'}
              {activeView === 'usage' && 'Usage Analytics'}
            </h1>

            <p
              style={{
                color: '#6b7280',
                marginTop: '10px',
                fontSize: '20px',
              }}
            >
              Control your subscriptions with a clean premium dashboard.
            </p>
          </div>

          {activeView === 'overview' && renderOverview()}
          {activeView === 'subscriptions' && renderSubscriptions()}
          {activeView === 'payments' && renderPayments()}
          {activeView === 'renewals' && renderRenewals()}
          {activeView === 'notifications' && renderNotifications()}
          {activeView === 'savings' && renderSavings()}
          {activeView === 'usage' && renderUsage()}
        </div>
      </main>
    </div>
  );
}

const sidebarButton = (active: boolean): React.CSSProperties => ({
  width: '100%',
  textAlign: 'left',
  padding: '12px 14px',
  borderRadius: '12px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 700,
  backgroundColor: active ? '#dbeafe' : 'transparent',
  color: active ? '#1d4ed8' : '#334155',
  transition: 'all 0.25s ease',
});

const panelCardAnimated: React.CSSProperties = {
  padding: '24px',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.86)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  animation: 'fadeUp 0.55s ease',
};

const panelTitle: React.CSSProperties = {
  color: '#1e3a8a',
  marginTop: 0,
};

const statCardAnimated: React.CSSProperties = {
  background: 'rgba(255,255,255,0.86)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: '20px',
  padding: '20px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  animation: 'fadeUp 0.5s ease',
};

const statNumber: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#2563eb',
  marginTop: '10px',
};

const cardText: React.CSSProperties = {
  margin: '6px 0',
  color: '#475569',
};

const subscriptionCard: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '16px',
  backgroundColor: '#f9fbff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  cursor: 'pointer',
  transition: 'all 0.25s ease',
};

const tableHead: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid #e5e7eb',
  color: '#64748b',
  fontSize: '14px',
};

const tableCell: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #f1f5f9',
  color: '#334155',
};

const editButton: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#dbeafe',
  color: '#1d4ed8',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'all 0.2s ease',
};

const deleteButton: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#fee2e2',
  color: '#b91c1c',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'all 0.2s ease',
};

const filterInput: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontSize: '15px',
  boxSizing: 'border-box',
};

const statMiniCard: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '14px',
  padding: '14px',
  backgroundColor: '#f8fbff',
};

const miniLabel: React.CSSProperties = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
};

const miniValue: React.CSSProperties = {
  margin: '8px 0 0 0',
  color: '#1e3a8a',
  fontSize: '26px',
  fontWeight: 700,
};