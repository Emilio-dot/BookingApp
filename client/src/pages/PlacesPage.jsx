import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';


import PlacesFormPage from './PlacesFormPage';

export default function PlacesPage() {
  const { action } = useParams();

  return (
    <div>
      {action !== 'new' && (
      <div className='text-center'>
          <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to={'/account/places/new'}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Add new place
          </Link>
          </div>
        )}
      {action === 'new' && (
        <PlacesFormPage />
      )}
    </div>
  );
}

