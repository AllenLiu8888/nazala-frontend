import React from 'react';

const TimelineComponent = ({ 
  events = [], 
  loading = false, 
  error = null, 
  onRefresh = null,
  showDebugInfo = false,
  gameId = null,
  token = null 
}) => {
  // Process API data and convert to frontend display format
  const processTimelineEvents = (apiEvents) => {
    if (!Array.isArray(apiEvents)) return [];
    
    return apiEvents.map((event, index) => ({
      id: `timeline-${index}-${event.turn?.id || 'no-turn'}`,
      year: event.turn?.year || `Round ${index + 1}`,
      option_test: event.user_option?.text || 'Historical Event',
      status: event.turn?.status === 'completed' ? 'completed' : 
              event.turn?.status === 'active' ? 'active' : 'pending',
      title: event.turn?.question_text || event.title || 'Historical Event',
      description: event.description || 'Event Description'
    }));
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
  const timelineEvents = events.length > 0 
    ? processTimelineEvents(events)
    : processTimelineEvents(mockApiData.data.history);

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
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
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
    <div className="border-2 border-cyan-400 rounded-xl bg-black/80 backdrop-blur-sm p-4">


      {/* Mobile-optimized timeline */}
      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="relative">
            {/* Mobile: vertical stacked layout */}
            <div className="md:hidden">
              <div className="flex items-start space-x-3">
                {/* Status indicator */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full ${
                    event.status === 'completed' ? 'bg-green-500' : 
                    event.status === 'active' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                
                {/* Content area */}
                <div className="flex-1 min-w-0">
                  {/* Year */}
                  <div className="text-cyan-300 font-mono text-sm mb-1">
                    {event.year}
                  </div>
                  
                  {/* Event description */}
                  <div className="bg-neutral-200 text-black/80 rounded px-3 py-2 text-sm font-semibold shadow-sm">
                    {event.option_test}
                  </div>
                  
                  {/* Result (if any) */}
                  {event.result && (
                    <div className="text-[10px] text-cyan-300 bg-slate-800/70 border border-cyan-500/30 px-2 py-1 rounded inline-block mt-2">
                      {event.result}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineComponent;
