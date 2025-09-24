import React, { useState } from 'react';
import { Calendar, MapPin, Star, Clock, Utensils, Coffee, Palette, Mountain, ShoppingBag, Music, Sparkles, Users, Compass, Search } from 'lucide-react';

export default function RioNidoItineraryBuilder() {
  // Rio Nido Lodge configuration
  const hotelConfig = {
    name: "Rio Nido Lodge",
    address: "4444 Wood Road, Guerneville, CA 95446",
    coordinates: { lat: 38.5024, lng: -122.9911 },
    neighborhood: "guerneville",
    walkingRadius: "quarter-mile"
  };

  const [guestData, setGuestData] = useState({
    name: '',
    location: hotelConfig.name,
    neighborhood: hotelConfig.neighborhood,
    interests: [],
    budgetRange: 'medium',
    travelStyle: 'moderate',
    dietaryRestrictions: '',
    mobility: 'full',
    groupSize: 2,
    tripDuration: 3,
    walkingRadius: hotelConfig.walkingRadius,
    signatureExperience: ''
  });

  const [itinerary, setItinerary] = useState(null);
  const [usedBusinesses, setUsedBusinesses] = useState([]);
  const [emailAddress, setEmailAddress] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [alternativesModal, setAlternativesModal] = useState({ isOpen: false, dayIndex: null, activityIndex: null });
  const [shareableLink, setShareableLink] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [feedback, setFeedback] = useState({});
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    businessClicks: {},
    bookingAttempts: {},
    switchRequests: {},
    expandedDetails: {}
  });

  // Update current time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Mock weather data
  const getWeatherMessage = () => {
    const hour = currentTime.getHours();
    const messages = [
      "🌞 Perfect day for outdoor activities!",
      "☁️ Cloudy but great for wine tasting!",
      "🌧️ Rainy day - indoor alternatives available",
      "❄️ Crisp morning perfect for coffee and cozy spots"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Business location coordinates
  const getBusinessCoordinates = (businessName) => {
    const coordinates = {
      'Boon Eat + Drink': { lat: 38.5041, lng: -122.9956 },
      'Furthermore Wines': { lat: 38.4982, lng: -123.0156 },
      'Williams Selyem': { lat: 38.4901, lng: -123.0201 },
      'Coffee Bazaar': { lat: 38.5031, lng: -122.9966 },
      'Graze at Rio Nido Lodge': { lat: 38.5024, lng: -122.9911 }
    };
    return coordinates[businessName] || { lat: 38.5024, lng: -122.9911 };
  };

  const openGoogleMaps = (business) => {
    const coords = getBusinessCoordinates(business.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&destination_place_id=${encodeURIComponent(business.name)}`;
    window.open(url, '_blank');
    trackAnalytics('directions_click', business.name);
  };

  const isBusinessOpen = (business) => {
    if (!business.hours) return null;
    const hour = currentTime.getHours();
    return hour >= business.hours.open && hour < business.hours.close;
  };

  const generateShareableLink = () => {
    if (!itinerary) return;
    
    const itineraryData = {
      guest: guestData.name,
      days: itinerary.days.length,
      style: guestData.travelStyle,
      interests: guestData.interests,
      timestamp: Date.now()
    };
    
    const encodedData = btoa(JSON.stringify(itineraryData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${encodedData}`;
    setShareableLink(shareUrl);
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Shareable link copied to clipboard!');
    });
    
    trackAnalytics('itinerary_shared', guestData.name);
  };

  const provideFeedback = (businessName, isPositive) => {
    setFeedback(prev => ({
      ...prev,
      [businessName]: isPositive
    }));
    
    trackAnalytics('feedback_given', businessName, { positive: isPositive });
  };

  const generateCalendarEvent = (day) => {
    const events = day.activities.map((activity, index) => {
      const startTime = activity.time.replace(/\s/g, '').toLowerCase();
      const date = new Date(Date.now() + (day.day - 1) * 24 * 60 * 60 * 1000);
      
      return `BEGIN:VEVENT
DTSTART:${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}T${startTime.includes('am') ? startTime.replace(/[^\d]/g, '').padStart(4, '0') : String(parseInt(startTime.replace(/[^\d]/g, '')) + 1200).padStart(4, '0')}00
DTEND:${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}T${startTime.includes('am') ? String(parseInt(startTime.replace(/[^\d]/g, '')) + 200).padStart(4, '0') : String(parseInt(startTime.replace(/[^\d]/g, '')) + 1400).padStart(4, '0')}00
SUMMARY:${activity.activity.name}
DESCRIPTION:${activity.activity.description}
LOCATION:${activity.activity.name}, Guerneville, CA
END:VEVENT`;
    }).join('\n');

    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rio Nido Lodge//Itinerary//EN
${events}
END:VCALENDAR`;

    const blob = new Blob([calendar], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rio-Nido-Day-${day.day}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    
    trackAnalytics('calendar_download', `Day ${day.day}`);
  };

  // Complete business database with geographic clusters and time-appropriate scheduling
  const businessClusters = {
    lodge: {
      food: [
        { 
          name: "Graze at Rio Nido Lodge", 
          type: "Lodge Restaurant", 
          description: "Farm-to-table dining at your lodge with Russian River wines", 
          rating: 4.8, 
          priceRange: "$$",
          localInsight: "Ask about the seasonal tasting menu featuring local Guerneville farms",
          driveTime: "0 min - at your lodge",
          category: "food",
          cluster: "lodge",
          hours: { open: 7, close: 22, timeAppropriate: ['morning', 'lunch', 'evening'] }
        }
      ]
    },
    
    guerneville: {
      food: [
        { 
          name: "Boon Eat + Drink", 
          type: "Farm-to-Table Restaurant", 
          description: "Celebrity Chef Crista Luedtke's flagship with Russian River wine pairings", 
          rating: 4.7, 
          priceRange: "$$",
          localInsight: "Ask about their seasonal tasting menu - changes monthly based on local farm harvests",
          driveTime: "8 min drive",
          category: "food",
          cluster: "guerneville",
          hours: { open: 11, close: 22, timeAppropriate: ['lunch', 'evening'] }
        },
        { 
          name: "Saucy Mama's Pizza", 
          type: "Artisan Pizza", 
          description: "Wood-fired pizza with local ingredients and craft beer selection", 
          rating: 4.5, 
          priceRange: "$",
          localInsight: "Tuesday night is locals' night with special pizza deals",
          driveTime: "7 min drive",
          category: "food",
          cluster: "guerneville",
          hours: { open: 11, close: 21, timeAppropriate: ['lunch', 'evening'] }
        },
        { 
          name: "Big Bottom Market", 
          type: "Gourmet Deli & Market", 
          description: "Famous for their maple bacon biscuits and artisanal sandwiches", 
          rating: 4.6, 
          priceRange: "$",
          localInsight: "Get there early - the maple bacon biscuits sell out by 10am on weekends",
          driveTime: "8 min drive",
          category: "food",
          cluster: "guerneville",
          hours: { open: 7, close: 16, timeAppropriate: ['morning', 'lunch'] }
        }
      ],
      coffee: [
        { 
          name: "Coffee Bazaar", 
          type: "Local Roastery", 
          description: "Local roastery with 'Russian River Blend' and homemade pastries", 
          rating: 4.4, 
          priceRange: "$",
          localInsight: "Try the 'Russian River Blend' - roasted weekly in small batches",
          driveTime: "6 min drive",
          category: "coffee",
          cluster: "guerneville",
          hours: { open: 7, close: 17, timeAppropriate: ['morning', 'afternoon'] }
        }
      ],
      dessert: [
        { 
          name: "Nimble & Finn's", 
          type: "Ice Cream & Coffee", 
          description: "Artisanal ice cream with unique flavors like lavender honey", 
          rating: 4.7, 
          priceRange: "$",
          localInsight: "The lavender honey is made from Russian River Valley lavender farms",
          driveTime: "9 min drive",
          category: "dessert",
          cluster: "guerneville",
          hours: { open: 11, close: 21, timeAppropriate: ['afternoon', 'evening'] }
        }
      ],
      nature: [
        { 
          name: "Russian River Beach", 
          type: "River Beach", 
          description: "Sandy river beach perfect for swimming and sunbathing", 
          rating: 4.5, 
          priceRange: "Free",
          localInsight: "Water is warmest in late afternoon - perfect after exploring",
          driveTime: "5 min drive",
          category: "nature",
          cluster: "guerneville",
          hours: { open: 6, close: 20, timeAppropriate: ['morning', 'afternoon', 'evening'] }
        }
      ]
    },

    wineries: {
      wine: [
        { 
          name: "Furthermore Wines", 
          type: "Boutique Artisan Winery", 
          description: "Small-production winery where the winemaker often pours personally", 
          rating: 4.9, 
          priceRange: "$$",
          localInsight: "Call ahead - the winemaker loves sharing the story behind each vintage",
          driveTime: "12 min drive",
          category: "wine",
          cluster: "wineries",
          hours: { open: 11, close: 17, timeAppropriate: ['afternoon'] }
        },
        { 
          name: "Williams Selyem", 
          type: "Legendary Cult Pinot Producer", 
          description: "Iconic cult winery with library wines and exclusive tastings", 
          rating: 4.9, 
          priceRange: "$$$",
          localInsight: "Ask about library wine tastings - some bottles from the 1980s",
          driveTime: "14 min drive",
          category: "wine",
          cluster: "wineries",
          hours: { open: 11, close: 16, timeAppropriate: ['afternoon'] }
        },
        { 
          name: "Gary Farrell Winery", 
          type: "Elevated Tasting Experience", 
          description: "Panoramic vineyard views with award-winning Pinot and Chardonnay", 
          rating: 4.8, 
          priceRange: "$$",
          localInsight: "Book the terrace tasting for stunning Russian River Valley views",
          driveTime: "15 min drive",
          category: "wine",
          cluster: "wineries",
          hours: { open: 11, close: 17, timeAppropriate: ['afternoon'] }
        },
        { 
          name: "Lynmar Estate", 
          type: "Biodynamic Winery & Gardens", 
          description: "Biodynamic farming with farm-to-table herb pairings", 
          rating: 4.7, 
          priceRange: "$$",
          localInsight: "Take the garden tour - they use herbs from their gardens in tastings",
          driveTime: "13 min drive",
          category: "wine",
          cluster: "wineries",
          hours: { open: 10, close: 17, timeAppropriate: ['afternoon'] }
        },
        { 
          name: "Merry Edwards Winery", 
          type: "Pioneering Female Winemaker", 
          description: "Temple to Pinot Noir from pioneering female vintner", 
          rating: 4.8, 
          priceRange: "$$",
          localInsight: "Ask about Merry's story - she's a Russian River Valley pioneer",
          driveTime: "11 min drive",
          category: "wine",
          cluster: "wineries",
          hours: { open: 10, close: 16, timeAppropriate: ['afternoon'] }
        }
      ]
    },

    coastal: {
      food: [
        { 
          name: "Jilly's Roadhouse", 
          type: "Coastal American", 
          description: "Scenic Highway 1 roadhouse with ocean views and hearty portions", 
          rating: 4.6, 
          priceRange: "$$",
          localInsight: "Sit on the deck for ocean views - weekend brunch is legendary",
          driveTime: "22 min drive to Jenner",
          category: "food",
          cluster: "coastal",
          hours: { open: 8, close: 20, timeAppropriate: ['morning', 'lunch', 'evening'] }
        },
        { 
          name: "Cafe Aquatica", 
          type: "Waterfront Cafe", 
          description: "Jenner waterfront cafe where Russian River meets the Pacific", 
          rating: 4.4, 
          priceRange: "$",
          localInsight: "Perfect spot to watch harbor seals at the river mouth",
          driveTime: "20 min drive to Jenner",
          category: "food",
          cluster: "coastal",
          hours: { open: 8, close: 16, timeAppropriate: ['morning', 'lunch'] }
        },
        { 
          name: "The Blue Heron", 
          type: "Historic Duncan Mills", 
          description: "Historic restaurant in Victorian Duncan Mills with comfort food", 
          rating: 4.5, 
          priceRange: "$$",
          localInsight: "Try their famous pot roast - recipe hasn't changed since 1970s",
          driveTime: "18 min drive to Duncan Mills",
          category: "food",
          cluster: "coastal",
          hours: { open: 11, close: 21, timeAppropriate: ['lunch', 'evening'] }
        },
        { 
          name: "Duncan Mills General Store & Cafe", 
          type: "Historic Breakfast Spot", 
          description: "Victorian-era general store with hearty breakfast and local atmosphere", 
          rating: 4.3, 
          priceRange: "$",
          localInsight: "The pancakes are massive - perfect for sharing after hiking",
          driveTime: "18 min drive to Duncan Mills",
          category: "food",
          cluster: "coastal",
          hours: { open: 7, close: 14, timeAppropriate: ['morning', 'lunch'] }
        }
      ],
      nature: [
        { 
          name: "Goat Rock Beach", 
          type: "Dramatic Coastal Beach", 
          description: "Where Russian River meets Pacific, famous harbor seal colony", 
          rating: 4.8, 
          priceRange: "Free",
          localInsight: "Visit during pupping season (March-May) to see baby harbor seals",
          driveTime: "25 min drive to Jenner coast",
          category: "nature",
          cluster: "coastal",
          hours: { open: 6, close: 20, timeAppropriate: ['morning', 'afternoon', 'evening'] }
        }
      ]
    }
  };

  // Signature experiences searchable within 15 miles
  const signatureExperiences = [
    {
      id: 'redwood_meditation',
      name: 'Private Redwood Grove Meditation',
      description: 'Guided meditation among 800-year-old redwoods at dawn',
      duration: '90 minutes',
      priceRange: '$$$',
      location: 'Armstrong Redwoods State Reserve',
      distance: '1.2 miles from lodge',
      bookingRequired: true
    },
    {
      id: 'wine_country_insider',
      name: 'Hidden Winery & Culinary Tour',
      description: 'Private access to appointment-only wineries with chef pairings',
      duration: '6 hours',
      priceRange: '$$$',
      location: 'Westside Road Wine Corridor',
      distance: '10-15 miles from lodge',
      bookingRequired: true
    },
    {
      id: 'river_adventure',
      name: 'Russian River Adventure Package',
      description: 'Private kayaking, swimming spots, and riverside picnic',
      duration: '4 hours',
      priceRange: '$$',
      location: 'Russian River beaches & tributaries',
      distance: '0-8 miles from lodge',
      bookingRequired: true
    },
    {
      id: 'coastal_photography',
      name: 'Sonoma Coast Photography Workshop',
      description: 'Professional photographer guides you to hidden coastal gems',
      duration: '5 hours',
      priceRange: '$$',
      location: 'Jenner & Goat Rock Beach area',
      distance: '20-25 miles from lodge',
      bookingRequired: true
    },
    {
      id: 'foraging_tour',
      name: 'Wild Mushroom & Foraging Experience',
      description: 'Expert-guided foraging tour with farm-to-table cooking class',
      duration: '4 hours',
      priceRange: '$$',
      location: 'Occidental & Sebastopol hills',
      distance: '12-15 miles from lodge',
      bookingRequired: true
    }
  ];

  const interests = [
    { id: 'food', label: 'Local Food & Dining', icon: Utensils },
    { id: 'coffee', label: 'Coffee Culture', icon: Coffee },
    { id: 'wine', label: 'Wine & Tasting', icon: '🍷' },
    { id: 'nature', label: 'Nature & Outdoors', icon: Mountain },
    { id: 'arts', label: 'Arts & Culture', icon: Palette },
    { id: 'shopping', label: 'Local Shopping', icon: ShoppingBag },
    { id: 'music', label: 'Music & Nightlife', icon: Music },
    { id: 'wellness', label: 'Wellness & Spa', icon: Sparkles }
  ];

  const travelStyles = [
    { 
      value: 'stay_local', 
      label: 'Stay Local', 
      description: 'Lodge area & walking distance only (0-5 min)',
      clusters: ['lodge', 'guerneville']
    },
    { 
      value: 'relaxed', 
      label: 'Relaxed Pace', 
      description: 'Short drives welcome (5-12 min)',
      clusters: ['lodge', 'guerneville']
    },
    { 
      value: 'moderate', 
      label: 'Moderate Activity', 
      description: 'Wine country exploring (up to 15 min)',
      clusters: ['lodge', 'guerneville', 'wineries']
    },
    { 
      value: 'day_trip', 
      label: 'Day Trip Explorer', 
      description: 'Full Russian River Valley (15-25 min drives)',
      clusters: ['lodge', 'guerneville', 'wineries', 'coastal']
    }
  ];

  // Analytics tracking functions
  const trackAnalytics = (eventType, businessName, additionalData = {}) => {
    setAnalytics(prev => {
      const newAnalytics = { ...prev };
      
      switch (eventType) {
        case 'business_click':
          newAnalytics.businessClicks[businessName] = (newAnalytics.businessClicks[businessName] || 0) + 1;
          break;
        case 'booking_attempt':
          newAnalytics.bookingAttempts[businessName] = (newAnalytics.bookingAttempts[businessName] || 0) + 1;
          break;
        case 'switch_request':
          newAnalytics.switchRequests[businessName] = (newAnalytics.switchRequests[businessName] || 0) + 1;
          break;
        case 'expanded_details':
          newAnalytics.expandedDetails[businessName] = (newAnalytics.expandedDetails[businessName] || 0) + 1;
          break;
      }
      
      return newAnalytics;
    });
    
    console.log(`Analytics: ${eventType} for ${businessName}`, additionalData);
  };

  // Booking integration functions
  const getBookingInfo = (business) => {
    const bookingMethods = {
      'Boon Eat + Drink': { type: 'phone', value: '(707) 869-0780', opentable: true },
      'Furthermore Wines': { type: 'phone', value: '(707) 579-1900', tock: true },
      'Williams Selyem': { type: 'phone', value: '(707) 433-6425', appointment: true },
      'Gary Farrell Winery': { type: 'website', value: 'https://garyfarrellwinery.com/visit', online: true },
      'Jilly\'s Roadhouse': { type: 'phone', value: '(707) 865-2827', walkins: true },
      'Graze at Rio Nido Lodge': { type: 'internal', value: 'lodge-concierge', direct: true }
    };
    
    return bookingMethods[business.name] || { type: 'phone', value: 'Call for reservations' };
  };

  const handleBookingClick = (business) => {
    trackAnalytics('booking_attempt', business.name, { 
      category: business.category,
      rating: business.rating,
      priceRange: business.priceRange 
    });
    
    const bookingInfo = getBookingInfo(business);
    
    switch (bookingInfo.type) {
      case 'phone':
        window.location.href = `tel:${bookingInfo.value}`;
        break;
      case 'website':
        window.open(bookingInfo.value, '_blank');
        break;
      case 'internal':
        alert('We\'ll contact our concierge team to make this reservation for you!');
        break;
      default:
        alert(`Please call ${bookingInfo.value} to make a reservation`);
    }
  };

  // Helper function to check if a business is appropriate for a given time
  const isTimeAppropriate = (business, timeSlot) => {
    if (!business.hours || !business.hours.timeAppropriate) return true;
    return business.hours.timeAppropriate.includes(timeSlot);
  };

  // Helper function to get businesses appropriate for specific time slots
  const getTimeAppropriateBusinesses = (categories, clusterNames, used, timeSlot) => {
    const available = [];
    
    clusterNames.forEach(clusterName => {
      const cluster = businessClusters[clusterName];
      if (!cluster) return;
      
      categories.forEach(category => {
        if (cluster[category]) {
          const categoryBusinesses = cluster[category].filter(
            business => !used.includes(business.name) && isTimeAppropriate(business, timeSlot)
          );
          available.push(...categoryBusinesses);
        }
      });
    });
    
    return available;
  };

  // Function to select a business from available options
  const selectBusiness = (options, used) => {
    if (!options.length) return null;
    
    const availableOptions = options.filter(business => !used.includes(business.name));
    if (!availableOptions.length) return null;
    
    const prioritized = availableOptions.sort((a, b) => {
      const aInterestMatch = guestData.interests.includes(a.category) ? 1 : 0;
      const bInterestMatch = guestData.interests.includes(b.category) ? 1 : 0;
      
      if (aInterestMatch !== bInterestMatch) {
        return bInterestMatch - aInterestMatch;
      }
      
      return b.rating - a.rating;
    });
    
    const selected = prioritized[0];
    used.push(selected.name);
    return selected;
  };

  // Geographic clustering algorithm for efficient day trips
  const generateEfficientItinerary = () => {
    if (!guestData.interests.length) return;

    setAnalytics(prev => ({ ...prev, totalViews: prev.totalViews + 1 }));

    const allowedClusters = travelStyles.find(style => style.value === guestData.travelStyle)?.clusters || ['lodge', 'guerneville'];
    const days = [];
    const usedBusinessesTracker = [];
    
    for (let day = 1; day <= guestData.tripDuration; day++) {
      let dayCluster;
      if (day === 1 || guestData.travelStyle === 'stay_local') {
        dayCluster = 'guerneville';
      } else if (day === 2 && allowedClusters.includes('wineries')) {
        dayCluster = 'wineries';
      } else if (day === 3 && allowedClusters.includes('coastal')) {
        dayCluster = 'coastal';
      } else {
        dayCluster = allowedClusters[day % allowedClusters.length];
      }

      const dayActivities = [];
      
      // Morning activity (8:30 AM)
      const morningOptions = getTimeAppropriateBusinesses(
        ['coffee', 'food'], 
        [dayCluster, 'lodge', 'guerneville'], 
        usedBusinessesTracker, 
        'morning'
      );
      if (morningOptions.length > 0) {
        const morning = selectBusiness(morningOptions, usedBusinessesTracker);
        if (morning) {
          dayActivities.push({
            time: '8:30 AM',
            activity: morning,
            type: 'morning'
          });
        }
      }

      // Add signature experience if selected
      if (day === 2 && guestData.signatureExperience) {
        const signature = signatureExperiences.find(exp => exp.id === guestData.signatureExperience);
        if (signature) {
          dayActivities.push({
            time: '10:00 AM',
            activity: {
              ...signature,
              category: 'signature',
              rating: 5.0,
              driveTime: signature.distance,
              hours: { timeAppropriate: ['morning', 'afternoon'] }
            },
            type: 'signature'
          });
        }
      }

      // Main afternoon activity
      const mainInterests = guestData.interests.filter(i => !['coffee'].includes(i));
      const mainOptions = getTimeAppropriateBusinesses(
        mainInterests, 
        [dayCluster], 
        usedBusinessesTracker, 
        'afternoon'
      );
      if (mainOptions.length > 0) {
        const main = selectBusiness(mainOptions, usedBusinessesTracker);
        if (main) {
          dayActivities.push({
            time: guestData.signatureExperience && day === 2 ? '2:00 PM' : '11:00 AM',
            activity: main,
            type: 'main'
          });
        }
      }

      // Lunch (1:00 PM)
      const lunchOptions = getTimeAppropriateBusinesses(
        ['food'], 
        [dayCluster, 'guerneville'], 
        usedBusinessesTracker, 
        'lunch'
      );
      if (lunchOptions.length > 0) {
        const lunch = selectBusiness(lunchOptions, usedBusinessesTracker);
        if (lunch) {
          dayActivities.push({
            time: '1:00 PM',
            activity: lunch,
            type: 'lunch'
          });
        }
      }

      // Evening activity/dinner (7:00 PM)
      const eveningClusters = dayCluster === 'coastal' ? ['coastal'] : [dayCluster, 'guerneville', 'lodge'];
      const eveningOptions = getTimeAppropriateBusinesses(
        ['food'], 
        eveningClusters, 
        usedBusinessesTracker, 
        'evening'
      );
      if (eveningOptions.length > 0) {
        const evening = selectBusiness(eveningOptions, usedBusinessesTracker);
        if (evening) {
          dayActivities.push({
            time: '7:00 PM',
            activity: evening,
            type: 'evening'
          });
        }
      }

      days.push({
        day,
        date: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        }),
        clusterFocus: dayCluster.charAt(0).toUpperCase() + dayCluster.slice(1),
        activities: dayActivities
      });
    }

    setItinerary({ days });
    setUsedBusinesses(usedBusinessesTracker);
  };

  // Function to get alternatives for a specific activity
  const getAlternatives = (currentActivity, timeSlot, dayCluster) => {
    const allowedClusters = travelStyles.find(style => style.value === guestData.travelStyle)?.clusters || ['lodge', 'guerneville'];
    const relevantClusters = dayCluster === 'coastal' ? ['coastal'] : [dayCluster, 'guerneville', 'lodge'];
    
    const alternatives = getTimeAppropriateBusinesses(
      [currentActivity.category], 
      relevantClusters,
      usedBusinesses,
      timeSlot
    );
    
    return alternatives.filter(alt => alt.name !== currentActivity.name);
  };

  const switchActivity = (dayIndex, activityIndex, newActivity) => {
    const newItinerary = { ...itinerary };
    const oldActivity = newItinerary.days[dayIndex].activities[activityIndex].activity;
    
    const newUsed = usedBusinesses.filter(name => name !== oldActivity.name);
    newUsed.push(newActivity.name);
    
    newItinerary.days[dayIndex].activities[activityIndex].activity = newActivity;
    
    setItinerary(newItinerary);
    setUsedBusinesses(newUsed);
    setAlternativesModal({ isOpen: false, dayIndex: null, activityIndex: null });
    
    trackAnalytics('switch_request', newActivity.name, { 
      replaced: oldActivity.name,
      day: dayIndex + 1 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">R</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rio Nido Lodge</h1>
                <p className="text-sm text-gray-600">Your Personal Russian River Valley Guide</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">{getWeatherMessage()}</div>
              <div className="text-xs text-gray-500">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!itinerary ? (
          // Guest Preferences Form
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Perfect Guerneville Experience</h2>
              <p className="text-gray-600 mb-8">Tell us about your preferences and we'll craft a personalized itinerary featuring the best local businesses, wineries, and hidden gems.</p>
              
              {/* Guest Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name</label>
                <input
                  type="text"
                  value={guestData.name}
                  onChange={(e) => setGuestData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              {/* Trip Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Duration</label>
                <select
                  value={guestData.tripDuration}
                  onChange={(e) => setGuestData(prev => ({ ...prev, tripDuration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={1}>1 Day</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days</option>
                  <option value={4}>4 Days</option>
                  <option value={5}>5 Days</option>
                </select>
              </div>

              {/* Group Size */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
                <select
                  value={guestData.groupSize}
                  onChange={(e) => setGuestData(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={1}>Solo traveler</option>
                  <option value={2}>Couple</option>
                  <option value={3}>Small group (3-4)</option>
                  <option value={4}>Family (5+)</option>
                </select>
              </div>

              {/* Interests */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">What interests you most? (Select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {interests.map((interest) => {
                    const IconComponent = interest.icon;
                    return (
                      <button
                        key={interest.id}
                        onClick={() => {
                          const newInterests = guestData.interests.includes(interest.id)
                            ? guestData.interests.filter(i => i !== interest.id)
                            : [...guestData.interests, interest.id];
                          setGuestData(prev => ({ ...prev, interests: newInterests }));
                        }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          guestData.interests.includes(interest.id)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <div className="text-center">
                          {typeof IconComponent === 'string' ? (
                            <span className="text-2xl mb-2 block">{interest.icon}</span>
                          ) : (
                            <IconComponent className="h-6 w-6 mx-auto mb-2" />
                          )}
                          <span className="text-sm font-medium">{interest.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Style */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Travel Style</label>
                <div className="space-y-3">
                  {travelStyles.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setGuestData(prev => ({ ...prev, travelStyle: style.value }))}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        guestData.travelStyle === style.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{style.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Signature Experience */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Add a Signature Experience (Optional)</label>
                <div className="space-y-3">
                  {signatureExperiences.map((experience) => (
                    <button
                      key={experience.id}
                      onClick={() => setGuestData(prev => ({ 
                        ...prev, 
                        signatureExperience: prev.signatureExperience === experience.id ? '' : experience.id 
                      }))}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        guestData.signatureExperience === experience.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{experience.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{experience.description}</div>
                          <div className="text-xs text-gray-500 mt-2">
                            {experience.duration} • {experience.priceRange} • {experience.distance}
                          </div>
                        </div>
                        <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 ml-2" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateEfficientItinerary}
                disabled={!guestData.name || !guestData.interests.length}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium py-4 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Compass className="h-5 w-5" />
                  <span>Create My Russian River Valley Itinerary</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          // Generated Itinerary
          <div className="space-y-6">
            {/* Itinerary Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{guestData.name}'s Russian River Valley Adventure</h2>
                  <p className="text-gray-600 mt-1">
                    {guestData.tripDuration} day{guestData.tripDuration > 1 ? 's' : ''} • {guestData.groupSize} guest{guestData.groupSize > 1 ? 's' : ''} • {travelStyles.find(s => s.value === guestData.travelStyle)?.label}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={generateShareableLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Share Itinerary
                  </button>
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Email Itinerary
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Itineraries */}
            {itinerary.days.map((day, dayIndex) => (
              <div key={dayIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Day {day.day}</h3>
                      <p className="text-green-100">{day.date} • {day.clusterFocus} Focus</p>
                    </div>
                    <button
                      onClick={() => generateCalendarEvent(day)}
                      className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Calendar className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    {day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="border-l-4 border-green-500 pl-6 relative">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-green-500 rounded-full"></div>
                        
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-900">{activity.time}</span>
                              {isBusinessOpen(activity.activity) !== null && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  isBusinessOpen(activity.activity) 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {isBusinessOpen(activity.activity) ? 'Open' : 'Closed'}
                                </span>
                              )}
                            </div>
                            
                            <h4 className="text-lg font-bold text-gray-900 mb-1">{activity.activity.name}</h4>
                            <p className="text-gray-600 mb-2">{activity.activity.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{activity.activity.rating}</span>
                              </div>
                              <span>•</span>
                              <span>{activity.activity.priceRange}</span>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{activity.activity.driveTime}</span>
                              </div>
                            </div>
                            
                            {activity.activity.localInsight && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
                                <p className="text-sm text-yellow-800">
                                  <span className="font-medium">Local Insight:</span> {activity.activity.localInsight}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => openGoogleMaps(activity.activity)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Directions
                              </button>
                              
                              <button
                                onClick={() => handleBookingClick(activity.activity)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Book/Call
                              </button>
                              
                              <button
                                onClick={() => setAlternativesModal({ 
                                  isOpen: true, 
                                  dayIndex, 
                                  activityIndex 
                                })}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                Switch
                              </button>
                              
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => provideFeedback(activity.activity.name, true)}
                                  className={`p-1 rounded ${
                                    feedback[activity.activity.name] === true 
                                      ? 'bg-green-100 text-green-600' 
                                      : 'text-gray-400 hover:text-green-600'
                                  }`}
                                >
                                  👍
                                </button>
                                <button
                                  onClick={() => provideFeedback(activity.activity.name, false)}
                                  className={`p-1 rounded ${
                                    feedback[activity.activity.name] === false 
                                      ? 'bg-red-100 text-red-600' 
                                      : 'text-gray-400 hover:text-red-600'
                                  }`}
                                >
                                  👎
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Generate New Itinerary Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setItinerary(null);
                  setUsedBusinesses([]);
                  setFeedback({});
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Create New Itinerary
              </button>
            </div>
          </div>
        )}

        {/* Alternatives Modal */}
        {alternativesModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Alternative Options</h3>
                  <button
                    onClick={() => setAlternativesModal({ isOpen: false, dayIndex: null, activityIndex: null })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                {alternativesModal.dayIndex !== null && alternativesModal.activityIndex !== null && (
                  <div className="space-y-3">
                    {getAlternatives(
                      itinerary.days[alternativesModal.dayIndex].activities[alternativesModal.activityIndex].activity,
                      itinerary.days[alternativesModal.dayIndex].activities[alternativesModal.activityIndex].type,
                      itinerary.days[alternativesModal.dayIndex].clusterFocus.toLowerCase()
                    ).map((alternative, index) => (
                      <button
                        key={index}
                        onClick={() => switchActivity(alternativesModal.dayIndex, alternativesModal.activityIndex, alternative)}
                        className="w-full p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors text-left"
                      >
                        <div className="font-medium text-gray-900">{alternative.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{alternative.description}</div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{alternative.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{alternative.priceRange}</span>
                          <span>•</span>
                          <span>{alternative.driveTime}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Email Itinerary</h3>
                  <button
                    onClick={() => setIsEmailModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      alert(`Itinerary sent to ${emailAddress}!`);
                      setIsEmailModalOpen(false);
                      setEmailAddress('');
                    }}
                    disabled={!emailAddress}
                    className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Itinerary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}