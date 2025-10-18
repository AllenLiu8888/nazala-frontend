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
        {timelineEvents.map((event) => (
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
                  <div className="text-cyan-200 bg-slate-900 py-2 px-4 text-sm rounded-base font-medium">
                    {event.option_test}
                  </div>
                  
                  {/* Result (if any) */}
                  {event.result && (
                    <div className="text-[10px] text-cyan-300 px-0 py-1 inline-block mt-2">
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
