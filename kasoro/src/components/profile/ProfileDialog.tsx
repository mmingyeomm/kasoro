"use client"

import { useState, useRef, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    // Save profile data
    // Commented out as backend implementation is not available yet
    /*
    const profileData = {
      name,
      bio,
      profileImage
    };

    fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Profile updated successfully:', data);
        onClose();
      })
      .catch(error => {
        console.error('Error updating profile:', error);
      });
    */
    
    console.log('Profile data:', { name, bio, profileImage });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-purple-dark">
            Edit Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center gap-2">
            <div 
              className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer border-2 border-purple-primary hover:opacity-90 transition-opacity"
              onClick={handleImageClick}
            >
              {profileImage ? (
                <Image 
                  src={profileImage} 
                  alt="Profile" 
                  fill 
                  style={{ objectFit: 'cover' }} 
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*"
              className="hidden" 
            />
            <span className="text-sm text-gray-500">Click to upload profile image</span>
          </div>

          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your display name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-primary"
            />
          </div>

          {/* Bio Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={handleBioChange}
              placeholder="Tell us about yourself"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-purple-dark transition-colors"
          >
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}