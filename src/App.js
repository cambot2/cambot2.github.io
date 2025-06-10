import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Music, Clock, Mail, Check, Settings, AlertCircle } from 'lucide-react';
import './App.css';

const SessionSync = () => {
  const [bandMembers] = useState([
    { id: 1, name: 'Josh', instrument: 'Guitar', color: 'bg-blue-500', email: 'josh@example.com' },
    { id: 2, name: 'Clay', instrument: 'Guitar', color: 'bg-green-500', email: 'clay@example.com' },
    { id: 3, name: 'Dan', instrument: 'Guitar/Vocals', color: 'bg-red-500', email: 'dan@example.com' },
    { id: 4, name: 'Matt', instrument: 'Bass', color: 'bg-purple-500', email: 'matt@example.com' },
    { id: 5, name: 'Cam', instrument: 'Drums', color: 'bg-yellow-500', email: 'cam@example.com' },
    { id: 6, name: 'Sean', instrument: 'Keys', color: 'bg-orange-500', email: 'sean@example.com' }
  ]);

  const [currentUser, setCurrentUser] = useState(bandMembers[0]);
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [jamSessions, setJamSessions] = useState([]);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [calendarError, setCalendarError] = useState('');

  // Generate time slots for the day (just 7 PM)
  const timeSlots = ['19:00'];

  // Initialize availability structure
  useEffect(() => {
    const initAvailability = {};
    bandMembers.forEach(member => {
      initAvailability[member.id] = {};
    });
    setAvailability(initAvailability);
  }, []);

  // Google Calendar API integration (simulation for now)
  const initializeGoogleCalendar = async () => {
    try {
      // Simulated connection for demo
      setTimeout(() => {
        setIsCalendarConnected(true);
        setCalendarError('');
        alert('Calendar connected! (Demo mode - set up Google API for real integration)');
      }, 1500);
    } catch (error) {
      setCalendarError('Failed to connect to Google Calendar. In a real app, you would need API keys and authentication.');
      console.error('Calendar connection error:', error);
    }
  };

  const createRealCalendarEvent = async (session) => {
    if (!isCalendarConnected) {
      setCalendarError('Please connect to Google Calendar first');
      return;
    }

    try {
      const startDateTime = new Date(`${session.date}T19:00:00`);
      const endDateTime = new Date(`${session.date}T22:00:00`);
      
      const event = {
        summary: 'Band Session - SessionSync',
        description: `Jam session with: ${session.members.map(m => `${m.name} (${m.instrument})`).join(', ')}`,
        location: 'Rehearsal Studio',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Chicago'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Chicago'
        },
        attendees: session.members.map(member => ({
          email: member.email,
          displayName: member.name
        })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      };

      // Simulated API response for demo
      console.log('Would create calendar event:', event);
      alert(`✅ Calendar event created!\n\nTitle: ${event.summary}\nDate: ${session.date}\nTime: 7-10 PM\nAttendees: ${event.attendees.map(a => a.displayName).join(', ')}\n\n(Demo mode - set up Google API for real calendar invites)`);
      
      return { success: true, eventId: 'demo_event_' + Date.now() };
    } catch (error) {
      setCalendarError('Failed to create calendar event: ' + error.message);
      console.error('Calendar event creation error:', error);
      return { success: false, error };
    }
  };

  const toggleAvailability = (memberId, date, time) => {
    setAvailability(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [`${date}-${time}`]: !prev[memberId]?.[`${date}-${time}`]
      }
    }));
  };

  const getAvailableMembers = (date, time) => {
    return bandMembers.filter(member => 
      availability[member.id]?.[`${date}-${time}`]
    );
  };

  const createJamSession = async (date, time, availableMembers) => {
    const sessionId = `${date}-${time}`;
    const newSession = {
      id: sessionId,
      date,
      time,
      members: availableMembers,
      created: new Date().toLocaleString(),
      status: 'scheduled',
      calendarEventId: null
    };

    setJamSessions(prev => {
      const updated = prev.filter(session => session.id !== sessionId);
      return [...updated, newSession];
    });

    // Create real calendar event if connected
    if (isCalendarConnected) {
      const result = await createRealCalendarEvent(newSession);
      if (result?.success) {
        // Update session with calendar event ID
        setJamSessions(prev => 
          prev.map(s => s.id === sessionId ? {...s, calendarEventId: result.eventId} : s)
        );
      }
    } else {
      // Fallback simulation
      alert(`🎵 Jam session scheduled!\n\nDate: ${date}\nTime: 7-10 PM\nMembers: ${availableMembers.map(m => m.name).join(', ')}\n\nConnect Google Calendar for automatic invites!`);
    }
  };

  const getUpcomingDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">SessionSync</h1>
          </div>
          <p className="text-purple-200">Coordinate band availability and schedule sessions automatically</p>
          
          {/* Calendar Connection Status */}
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={initializeGoogleCalendar}
              disabled={isCalendarConnected}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isCalendarConnected 
                  ? 'bg-green-500 text-white cursor-default' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              {isCalendarConnected ? 'Google Calendar Connected' : 'Connect Google Calendar'}
            </button>
            
            {calendarError && (
              <div className="flex items-center gap-2 bg-red-500/20 text-red-200 px-3 py-2 rounded-lg max-w-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{calendarError}</span>
              </div>
            )}
          </div>
        </div>

        {/* User Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center gap-4 mb-4">
            <Users className="w-5 h-5 text-white" />
            <h2 className="text-xl font-semibold text-white">Switch User View</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {bandMembers.map(member => (
              <button
                key={member.id}
                onClick={() => setCurrentUser(member)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentUser.id === member.id
                    ? `${member.color} text-white scale-105`
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {member.name} ({member.instrument})
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <Calendar className="w-5 h-5 text-white" />
            <h2 className="text-xl font-semibold text-white">Two Week Availability - 7-10 PM Sessions</h2>
            <div className="text-sm text-purple-200">
              Viewing as: <span className="font-semibold text-white">{currentUser.name}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-white font-semibold p-3">Time</th>
                  {getUpcomingDates().map(date => (
                    <th key={date} className="text-center text-white font-semibold p-2 min-w-24">
                      <div className="text-xs">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-xs text-purple-200">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time} className="border-t border-white/10">
                    <td className="text-white p-2 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        7-10 PM
                      </div>
                    </td>
                    {getUpcomingDates().map(date => {
                      const availableMembers = getAvailableMembers(date, time);
                      const isCurrentUserAvailable = availability[currentUser.id]?.[`${date}-${time}`];
                      const canCreateSession = availableMembers.length >= 3;
                      const existingSession = jamSessions.find(s => s.id === `${date}-${time}`);

                      return (
                        <td key={`${date}-${time}`} className="p-1">
                          <div className="space-y-1">
                            {/* Current user availability toggle */}
                            <button
                              onClick={() => toggleAvailability(currentUser.id, date, time)}
                              className={`w-full p-1 rounded text-xs font-medium transition-all ${
                                isCurrentUserAvailable
                                  ? `${currentUser.color} text-white`
                                  : 'bg-white/20 text-white hover:bg-white/30'
                              }`}
                            >
                              {isCurrentUserAvailable ? '✓' : '-'}
                            </button>

                            {/* Show other available members */}
                            {availableMembers.length > 0 && (
                              <div className="text-xs">
                                <div className="text-white text-center">{availableMembers.length}</div>
                                <div className="flex flex-wrap gap-0.5 justify-center">
                                  {availableMembers.map(member => (
                                    <div
                                      key={member.id}
                                      className={`${member.color} w-2 h-2 rounded-full`}
                                      title={member.name}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Auto-schedule button or session status */}
                            {existingSession ? (
                              <div className="bg-green-500 text-white p-1 rounded text-xs text-center">
                                <Check className="w-3 h-3 mx-auto" />
                              </div>
                            ) : canCreateSession ? (
                              <button
                                onClick={() => createJamSession(date, time, availableMembers)}
                                className="w-full bg-green-500 hover:bg-green-600 text-white p-1 rounded text-xs font-medium transition-colors flex items-center justify-center"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scheduled Sessions */}
        {jamSessions.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <Music className="w-5 h-5 text-white" />
              <h2 className="text-xl font-semibold text-white">Scheduled Sessions</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jamSessions.map(session => (
                <div key={session.id} className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-white font-semibold">
                      {new Date(session.date).toLocaleDateString()} at 7-10 PM
                    </span>
                  </div>
                  <div className="text-sm text-purple-200 mb-3">
                    {session.members.length} members attending
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {session.members.map(member => (
                      <span
                        key={member.id}
                        className={`${member.color} text-white px-2 py-1 rounded-full text-xs`}
                      >
                        {member.name}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => createRealCalendarEvent(session)}
                    disabled={!isCalendarConnected}
                    className={`w-full p-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      isCalendarConnected 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    {session.calendarEventId ? 'Resend Calendar Invite' : 'Send Calendar Invite'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3">How it works:</h3>
          <div className="text-purple-200 space-y-2">
            <p>1. Switch between band member views using the buttons</p>
            <p>2. Click time slots to mark availability for the selected member</p>
            <p>3. When 3+ members are available, a green "+" button appears</p>
            <p>4. Click it to schedule the session</p>
            <p>5. Connect Google Calendar for real calendar invites</p>
          </div>
          
          <div className="mt-4 p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
            <h4 className="text-orange-200 font-semibold mb-2">🎹 Latest Update:</h4>
            <div className="text-orange-100 text-sm">
              <p><strong>Sean (Keys)</strong> has joined the band! He appears in orange and can coordinate his keyboard parts with the three guitarists.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSync;
