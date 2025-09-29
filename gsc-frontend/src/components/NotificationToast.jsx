import React from 'react';

export default function NotificationToast({ message, type }) {
  return (
    <div className={`fixed top-4 right-4 bg-${type === 'error' ? 'red' : 'green'}-500 text-white px-4 py-2 rounded shadow`}>
      {message}
    </div>
  );
}
