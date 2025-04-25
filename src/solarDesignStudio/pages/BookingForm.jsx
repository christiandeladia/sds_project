import React, { useState } from 'react';
import { sendToTelegram } from '../shared/utils/sendToTelegram';

/**
 * BookingForm.jsx
 * A standalone component for step 7 of the wizard:
 * collects visit date, name, phone, and email,
 * then submits to Telegram along with formData.
 */
const BookingForm = ({ formData, onBack, onSuccess }) => {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== 'idle') return;
    setStatus('sending');

    const payload = {
      action: 'BOOK_SITE_VISIT',
      timestamp: new Date().toISOString(),
      data: {
        ...formData,
        visitDate: date,
        name,
        phone,
        email
      }
    };

    const success = await sendToTelegram(payload);
    setStatus(success ? 'sent' : 'idle');
    if (success) {
      onSuccess();
    } else {
      alert('Failed to send—please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Schedule Your Site Visit</h2>
      <label className="block">
        <span className="block mb-1">Date</span>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </label>
      <label className="block">
        <span className="block mb-1">Name</span>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </label>
      <label className="block">
        <span className="block mb-1">Phone Number</span>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </label>
      <label className="block">
        <span className="block mb-1">Email Address</span>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </label>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border rounded"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={status !== 'idle'}
          className={`px-4 py-2 text-white rounded ${status !== 'idle' ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          {status === 'sending' ? 'Sending…' : 'Submit'}
        </button>
      </div>
    </form>
  );
};
    
export default BookingForm;
