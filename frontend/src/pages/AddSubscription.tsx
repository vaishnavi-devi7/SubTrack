import { useEffect, useState } from 'react';
import API from '../api/api';

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

type AddSubscriptionProps = {
  onSuccess: () => void;
  editingSubscription: Subscription | null;
  clearEditing: () => void;
};

type FormDataType = {
  name: string;
  category: string;
  customCategory: string;
  cost: string;
  currency: string;
  billing_cycle: string;
  start_date: string;
  renewal_date: string;
  status: string;
  is_trial: boolean;
  trial_end_date: string;
  notes: string;
  color: string;
};

const categoryOptions = [
  'Entertainment',
  'Studies',
  'Productivity',
  'Finance',
  'Health',
  'Shopping',
  'Music',
  'Video',
  'Cloud',
  'AI Tools',
  'Other',
  'Custom',
];

const emptyForm: FormDataType = {
  name: '',
  category: 'Entertainment',
  customCategory: '',
  cost: '',
  currency: 'INR',
  billing_cycle: 'monthly',
  start_date: '',
  renewal_date: '',
  status: 'active',
  is_trial: false,
  trial_end_date: '',
  notes: '',
  color: '#93C5FD',
};

export default function AddSubscription({
  onSuccess,
  editingSubscription,
  clearEditing,
}: AddSubscriptionProps) {
  const [formData, setFormData] = useState<FormDataType>(emptyForm);

  useEffect(() => {
    if (editingSubscription) {
      const matchedCategory = categoryOptions.includes(editingSubscription.category)
        ? editingSubscription.category
        : 'Custom';

      setFormData({
        name: editingSubscription.name,
        category: matchedCategory,
        customCategory:
          matchedCategory === 'Custom' ? editingSubscription.category : '',
        cost: editingSubscription.cost,
        currency: editingSubscription.currency,
        billing_cycle: editingSubscription.billing_cycle || 'monthly',
        start_date: formatDateForInput(editingSubscription.start_date),
        renewal_date: formatDateForInput(editingSubscription.renewal_date),
        status: editingSubscription.status,
        is_trial: editingSubscription.is_trial,
        trial_end_date: editingSubscription.trial_end_date
          ? formatDateForInput(editingSubscription.trial_end_date)
          : '',
        notes: editingSubscription.notes || '',
        color: editingSubscription.color || '#93C5FD',
      });
    } else {
      setFormData(emptyForm);
    }
  }, [editingSubscription]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const finalCategory =
        formData.category === 'Custom'
          ? formData.customCategory.trim() || 'Custom'
          : formData.category;

      const today = new Date();
      let finalStartDate = formData.start_date;
      let finalRenewalDate = formData.renewal_date;

      if (formData.billing_cycle === 'monthly') {
        const start = new Date(today);
        const renewal = new Date(today);
        renewal.setMonth(renewal.getMonth() + 1);

        finalStartDate = toDateInputValue(start);
        finalRenewalDate = toDateInputValue(renewal);
      }

      if (formData.billing_cycle === 'yearly') {
        const start = new Date(today);
        const renewal = new Date(today);
        renewal.setFullYear(renewal.getFullYear() + 1);

        finalStartDate = toDateInputValue(start);
        finalRenewalDate = toDateInputValue(renewal);
      }

      if (formData.billing_cycle === 'custom') {
        if (!formData.start_date || !formData.renewal_date) {
          alert('Please select start date and renewal date for custom billing');
          return;
        }
      }

      const payload = {
        name: formData.name.trim(),
        category: finalCategory,
        cost: Number(formData.cost),
        currency: formData.currency,
        billing_cycle: formData.billing_cycle,
        start_date: finalStartDate,
        renewal_date: finalRenewalDate,
        status: formData.status,
        is_trial: formData.is_trial,
        trial_end_date: formData.is_trial
          ? formData.trial_end_date || null
          : null,
        notes: formData.notes.trim(),
        color: formData.color,
      };

      if (!payload.name) {
        alert('Please enter subscription name');
        return;
      }

      if (!payload.category) {
        alert('Please select category');
        return;
      }

      if (!payload.cost || Number.isNaN(payload.cost)) {
        alert('Please enter valid cost');
        return;
      }

      if (payload.is_trial && !payload.trial_end_date) {
        alert('Please select trial end date');
        return;
      }

      if (editingSubscription) {
        await API.put(`/subscriptions/${editingSubscription.id}`, payload);
        alert('Subscription updated successfully ✅');
      } else {
        await API.post('/subscriptions', payload);
        alert('Subscription added successfully ✅');
      }

      setFormData(emptyForm);
      clearEditing();
      onSuccess();
    } catch (error) {
      console.error('Subscription submit error:', error);
      alert('Operation failed ❌');
    }
  };

  const showAutoRenewalNote =
    formData.billing_cycle === 'monthly' || formData.billing_cycle === 'yearly';

  return (
    <div
      style={{
        padding: '28px',
        borderRadius: '24px',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.08)',
        marginBottom: '30px',
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: '24px',
          color: '#1e3a8a',
          textAlign: 'center',
          fontSize: '26px',
        }}
      >
        {editingSubscription ? 'Edit Subscription' : 'Add Subscription'}
      </h2>

      <input
        name="name"
        placeholder="Subscription Name"
        value={formData.name}
        onChange={handleChange}
        style={inputStyle}
      />

      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        style={inputStyle}
      >
        {categoryOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {formData.category === 'Custom' && (
        <input
          name="customCategory"
          placeholder="Enter custom category"
          value={formData.customCategory}
          onChange={handleChange}
          style={inputStyle}
        />
      )}

      <input
        name="cost"
        type="number"
        placeholder="Cost"
        value={formData.cost}
        onChange={handleChange}
        style={inputStyle}
      />

      <select
        name="currency"
        value={formData.currency}
        onChange={handleChange}
        style={inputStyle}
      >
        <option value="INR">INR</option>
        <option value="USD">USD</option>
      </select>

      <select
        name="billing_cycle"
        value={formData.billing_cycle}
        onChange={handleChange}
        style={inputStyle}
      >
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
        <option value="custom">Custom</option>
      </select>

      {showAutoRenewalNote && (
        <div
          style={{
            marginTop: '-4px',
            marginBottom: '16px',
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {formData.billing_cycle === 'monthly' &&
            'Next renewal will be auto-set to 1 month from today.'}
          {formData.billing_cycle === 'yearly' &&
            'Next renewal will be auto-set to 1 year from today.'}
        </div>
      )}

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        style={inputStyle}
      >
        <option value="active">Active</option>
        <option value="cancelled">Cancelled</option>
        <option value="paused">Paused</option>
      </select>

      {formData.billing_cycle === 'custom' && (
        <>
          <label style={labelStyle}>Start Date</label>
          <input
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            style={inputStyle}
          />

          <label style={labelStyle}>Renewal Date</label>
          <input
            name="renewal_date"
            type="date"
            value={formData.renewal_date}
            onChange={handleChange}
            style={inputStyle}
          />
        </>
      )}

      <textarea
        name="notes"
        placeholder="Notes"
        value={formData.notes}
        onChange={handleChange}
        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
      />

      <label style={labelStyle}>Color</label>
      <input
        name="color"
        type="color"
        value={formData.color}
        onChange={handleChange}
        style={{
          width: '100%',
          height: '48px',
          borderRadius: '12px',
          border: '1px solid #cbd5e1',
          marginBottom: '16px',
          backgroundColor: '#ffffff',
          padding: '6px',
          boxSizing: 'border-box',
        }}
      />

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
          color: '#475569',
          fontWeight: 500,
        }}
      >
        <input
          name="is_trial"
          type="checkbox"
          checked={formData.is_trial}
          onChange={handleChange}
        />
        Trial Subscription
      </label>

      {formData.is_trial && (
        <>
          <label style={labelStyle}>Trial End Date</label>
          <input
            name="trial_end_date"
            type="date"
            value={formData.trial_end_date}
            onChange={handleChange}
            style={inputStyle}
          />
        </>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#60a5fa',
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
        </button>

        {editingSubscription && (
          <button
            onClick={() => {
              setFormData(emptyForm);
              clearEditing();
            }}
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#e5e7eb',
              color: '#334155',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function formatDateForInput(dateString: string) {
  return new Date(dateString).toISOString().split('T')[0];
}

function toDateInputValue(date: Date) {
  return date.toISOString().split('T')[0];
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  color: '#64748b',
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  marginBottom: '16px',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontSize: '15px',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
};