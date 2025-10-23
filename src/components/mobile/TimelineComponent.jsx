import React from 'react';

const TimelineComponent = ({ 
  events = [], 
  loading = false, 
  error = null
}) => {
  // Process API data and convert to frontend display format
  const processTimelineEvents = (apiEvents) => {
    if (!Array.isArray(apiEvents)) return [];
    
    return apiEvents.map((event, index) => {
      const turn = event.turn || event;
      const userOpt = event.user_option || event.option || {};
      const statusRaw = turn?.status;
      const status = (statusRaw === 2 || statusRaw === 'completed') ? 'completed'
        : (statusRaw === 1 || statusRaw === 'active') ? 'active'
        : 'pending';

      return {
        originalIndex: index,
        id: `timeline-${index}-${turn?.id ?? 'no-turn'}`,
        year: turn?.year ?? `Round ${index + 1}`,
        option_test: userOpt?.text ?? 'Historical Event',
        status,
        title: turn?.question_text ?? event.title ?? 'Historical Event',
        description: event.description ?? ''
      };
    });
  };

  // Mock API data
  const mockApiData = {
    "status": true,
    "data": {
      "history": [
        {
          "turn": {
            "id": 0,
            "year": "2050",
            "question_text": "Mock data: Reflection question 1",
            "status": "completed"
          },
          "user_option": {
            "text": "Mock data: Reflection question 1 supports strict environmental protection regulations"
          }
        },
        {
          "turn": {
            "id": 1,
            "year": "2051",
            "question_text": "Mock data: Vote on economic development strategy",
            "status": "completed"
          },
          "user_option": {
            "text": "Mock data: Prioritize green economy development"
          }
        },
        {
          "turn": {
            "id": 2,
            "year": "2052",
            "question_text": "Mock data: Vote on technology development",
            "status": "active"
          },
          "user_option": {
            "text": "Mock data: Advance AI technology development"
          }
        },
        {
          "turn": {
            "id": 3,
            "year": "2053",
            "question_text": "Mock data: Vote on social policy",
            "status": "pending"
          },
          "user_option": {
            "text": "Mock data: Strengthen social equity protection"
          }
        },
        {
          "turn": {
            "id": 4,
            "year": "2054",
            "question_text": "Mock data: Reflection question 2",
            "status": "pending"
          },
          "user_option": {
            "text": "Mock data: Promote digital education"
          }
        }
      ]
    }
  };

  // Use API data or mock data
  const sourceEvents = (Array.isArray(events) && events.length > 0)
    ? events
    : mockApiData.data.history;
  const processed = processTimelineEvents(sourceEvents);
  const total = Array.isArray(sourceEvents) ? sourceEvents.length : 0;
  // 仅显示“正式轮”：去掉第一轮（Intro）和最后一轮（Reflection）
  const timelineEvents = (total > 2)
    ? processed.filter(e => e.originalIndex > 0 && e.originalIndex < total - 1)
    : processed;

  // Loading state
  if (loading) {
    return (
      <div className="border-2 border-cyan-400 rounded-xl bg-black/80 backdrop-blur-sm p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-cyan-300 text-lg">Loading historical data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border-2 border-red-400 rounded-xl bg-black/80 backdrop-blur-sm p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-red-400 text-6xl mb-4">!</div>
          <p className="text-red-400 text-lg mb-2">Loading failed</p>
          <p className="text-gray-400 text-sm text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-2 text-cyan-400/60 text-sm font-mono">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span>CHRONOLOGICAL RECORDS</span>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Enhanced timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-cyan-300 to-cyan-400 opacity-30"></div>
        
        <div className="space-y-8">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative group">
              {/* Timeline node */}
              <div className="absolute left-4 top-2 w-4 h-4 bg-cyan-400 rounded-full border-2 border-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-1 bg-cyan-300 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Content card */}
              <div className="ml-12 bg-black/40 border border-cyan-400/30 rounded-lg p-4 group-hover:border-cyan-400/60 group-hover:bg-black/60 transition-all duration-300">
                {/* Year badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                    <span className="text-cyan-400/60 font-mono text-xs tracking-wider">
                      YEAR
                    </span>
                    <span className="text-cyan-300 font-mono text-sm font-semibold tracking-wider">
                      {event.year}
                    </span>
                  </div>
                  <div className="text-cyan-400/40 text-xs font-mono">
                    #{String(index + 1).padStart(2, '0')}
                  </div>
                </div>
                
                {/* Event description */}
                <div className="text-cyan-200 text-sm leading-relaxed">
                  {event.option_test}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineComponent;
