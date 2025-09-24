import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Car, Utensils, Camera, Star, Wifi, Coffee, Bed } from 'lucide-react';

const RioNidoItineraryBuilder = () => {
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [guestInfo, setGuestInfo] = useState({
    names: '',
    dates: '',
    groupSize: ''
  });

  const activities = [
    {
      id: 1,
      category: 'Wine & Dining',
      name: 'Russian River Valley Wine Tasting',
      location: 'Healdsburg Area',
      duration: '4-6 hours',
      description: 'Visit 3-4 boutique wineries along scenic backroads',
      tips: 'Book tastings in advance, designate a driver'
    },
    {
      id: 2,
      category: 'Outdoor',
      name: 'Armstrong Redwoods State Natural Reserve',
      location: 'Guerneville',
      duration: '2-3 hours',
      description: 'Walk among ancient coast redwoods on peaceful trails',
      tips: 'Easy walking trails, great for photos'
    },
    {
      id: 3,
      category: 'River Fun',
      name: 'Russian River Canoeing',
      location: 'Monte Rio to Guerneville',
      duration: '3-4 hours',
      description: 'Gentle float down the scenic Russian River',
      tips: 'Seasonal (May-October), bring sunscreen and water'
    },
    {
      id: 4,
      category: 'Local Culture',
      name: 'Explore Downtown Guerneville',
      location: 'Main Street, Guerneville',
      duration: '1-2 hours',
      description: 'Browse unique shops, art galleries, and cafes',
      tips: 'Perfect for evening strolls, many pet-friendly spots'
    },
    {
      id: 5,
      category: 'Dining',
      name: 'Farm-to-Table Restaurants',
      location: 'Forestville, Sebastopol',
      duration: '2 hours',
      description: 'Fresh, local cuisine at renowned restaurants',
      tips: 'Make reservations, try seasonal specialties'
    },
    {
      id: 6,
      category: 'Wellness',
      name: 'Spa & Hot Springs',
      location: 'Calistoga, Harbin Hot Springs',
      duration: 'Half day',
      description: 'Relax in natural hot springs and luxury spas',
      tips: 'Book treatments ahead, bring swimwear'
    },
    {
      id: 7,
      category: 'Adventure',
      name: 'Sonoma Coast Beaches',
      location: 'Jenner, Bodega Bay',
      duration: '4-5 hours',
      description: 'Dramatic coastline, tide pools, and lighthouse visits',
      tips: 'Dress in layers, check tide times for tide pooling'
    },
    {
      id: 8,
      category: 'Local Culture',
      name: 'Antique Shopping in Sebastopol',
      location: 'Sebastopol',
      duration: '2-3 hours',
      description: 'Browse vintage finds and local artisan goods',
      tips: 'Bring cash for best deals, great rainy day activity'
    }
  ];

  const accommodationAmenities = [
    { icon: Bed, text: 'Luxury King Beds' },
    { icon: Wifi, text: 'Complimentary WiFi' },
    { icon: Coffee, text: 'In-Room Coffee Bar' },
    { icon: Car, text: 'Free Parking' }
  ];

  const handleActivityToggle = (activityId) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const generateItinerary = () => {
    const selected = activities.filter(activity => 
      selectedActivities.includes(activity.id)
    );
    
    if (selected.length === 0) {
      alert('Please select at least one activity to create your itinerary!');
      return;
    }

    // Create a simple text itinerary
    let itinerary = `Rio Nido Lodge - Personal Itinerary\n\n`;
    itinerary += `Guest(s): ${guestInfo.names || 'Your Name'}\n`;
    itinerary += `Dates: ${guestInfo.dates || 'Your Dates'}\n`;
    itinerary += `Group Size: ${guestInfo.groupSize || 'Your Group Size'}\n\n`;
    itinerary += `SELECTED ACTIVITIES:\n\n`;
    
    selected.forEach((activity, index) => {
      itinerary += `${index + 1}. ${activity.name}\n`;
      itinerary += `   Location: ${activity.location}\n`;
      itinerary += `   Duration: ${activity.duration}\n`;
      itinerary += `   ${activity.description}\n`;
      itinerary += `   Tip: ${activity.tips}\n\n`;
    });

    // Create a downloadable text file
    const blob = new Blob([itinerary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rio-nido-lodge-itinerary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">The Rio Nido Lodge</h1>
            <p className="text-xl text-gray-600 mb-4">Mercantile & Cafe</p>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Create your personalized Russian River Valley experience. Select activities below to build your custom itinerary and make the most of your stay.
            </p>
          </div>
        </div>
      </header>

      {/* Guest Information */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Users className="mr-3 text-green-600" />
            Guest Information
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guest Name(s)
              </label>
              <input
                type="text"
                placeholder="Enter your name(s)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={guestInfo.names}
                onChange={(e) => setGuestInfo(prev => ({...prev, names: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stay Dates
              </label>
              <input
                type="text"
                placeholder="e.g., March 15-17, 2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={guestInfo.dates}
                onChange={(e) => setGuestInfo(prev => ({...prev, dates: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Size
              </label>
              <input
                type="text"
                placeholder="e.g., 2 adults"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={guestInfo.groupSize}
                onChange={(e) => setGuestInfo(prev => ({...prev, groupSize: e.target.value}))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Calendar className="mr-3 text-green-600" />
            Choose Your Activities
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                  selectedActivities.includes(activity.id)
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                }`}
                onClick={() => handleActivityToggle(activity.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    {activity.category}
                  </span>
                  {selectedActivities.includes(activity.id) && (
                    <Star className="w-5 h-5 text-green-600 fill-current" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {activity.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {activity.location}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {activity.duration}
                  </p>
                </div>
                <p className="text-gray-700 mb-3">{activity.description}</p>
                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded italic">
                  💡 {activity.tips}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accommodation Features */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Rio Nido Lodge Experience
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {accommodationAmenities.map((amenity, index) => (
              <div key={index} className="text-center p-4">
                <amenity.icon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">{amenity.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Generate Itinerary Button */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="text-center">
          <button
            onClick={generateItinerary}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Calendar className="inline-block mr-2" />
            Download My Custom Itinerary
          </button>
          <p className="text-gray-500 mt-4">
            Selected activities: {selectedActivities.length}
          </p>
        </div>
      </section>
    </div>
  );
};

export default RioNidoItineraryBuilder;