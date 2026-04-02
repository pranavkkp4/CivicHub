import { useState } from 'react';
import { User, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <User className="w-8 h-8 mr-3 text-kaleo-terracotta" />
          Profile
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">Keep your account details aligned with the work you do across the platform.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-kaleo-terracotta rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-kaleo-charcoal">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-kaleo-charcoal/60 flex items-center mt-1">
              <Mail className="w-4 h-4 mr-2" />
              {user?.email}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-kaleo-charcoal mb-2">First name</label>
            <input
              type="text"
              value={user?.first_name || ''}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Last name</label>
            <input
              type="text"
              value={user?.last_name || ''}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30 disabled:opacity-50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Email address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg opacity-50"
            />
          </div>
        </div>

        <div className="flex justify-end mt-8">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-3 bg-kaleo-terracotta text-white rounded-lg hover:bg-kaleo-charcoal transition-colors"
            >
            {isEditing ? 'Save changes' : 'Edit profile'}
            </button>
          </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-' },
          { label: 'Study activity', value: '0' },
          { label: 'Routines followed', value: '0' },
          { label: 'Eco actions', value: '0' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-kaleo-charcoal/60 text-sm">{stat.label}</p>
            <p className="text-xl font-semibold text-kaleo-charcoal mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
