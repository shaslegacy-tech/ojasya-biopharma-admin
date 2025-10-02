'use client';
import React from 'react';

interface AvatarProps {
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

export default function Avatar({ firstName, lastName, imageUrl }: AvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="flex items-center">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${firstName} ${lastName}`}
          className="w-14 h-14 rounded-full object-cover"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0daba9] to-[#78cfce] flex items-center justify-center">
          <span className="text-lg font-bold text-black">{initials}</span>
        </div>
      )}
      <span className="ml-3 font-medium text-black">{firstName} {lastName}</span>
    </div>
  );
}
