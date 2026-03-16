require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Incident = require('../models/Incident');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster-mgmt');
  await User.deleteMany({});
  await Incident.deleteMany({});

  const citizen = await User.create({
    name: 'John Citizen',
    email: 'citizen@test.com',
    password: '123456',
    role: 'citizen',
  });

  const authority = await User.create({
    name: 'Jane Authority',
    email: 'authority@test.com',
    password: '123456',
    role: 'authority',
  });

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: '123456',
    role: 'admin',
  });

  await Incident.create([
    {
      title: 'Major Flood in Downtown',
      description: 'Water level rising rapidly near Main St. Several vehicles are submerged and residents require immediate evacuation assistance. Emergency services requested.',
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      status: 'pending',
      reportedBy: citizen._id,
    },
    {
      title: 'Industrial Fire near Warehouse District',
      description: 'Thick black smoke visible from the east side industrial park. Chemical smell in the air. Proceed with caution.',
      location: { type: 'Point', coordinates: [-122.395, 37.755] },
      status: 'verified',
      reportedBy: citizen._id,
      assignedTo: authority._id,
    },
    {
      title: 'Significant Earthquake Damage',
      description: 'Structural damage to several older buildings in the historic district. Power lines are downed and roads are partially blocked by debris.',
      location: { type: 'Point', coordinates: [-122.44, 37.8] },
      status: 'resolved',
      reportedBy: citizen._id,
      assignedTo: authority._id,
    },
    {
      title: 'Severe Multi-Vehicle Collision',
      description: 'Highway 101 Southbound blocked due to a severe crash involving a semi-truck and 4 passenger vehicles. Medical units needed.',
      location: { type: 'Point', coordinates: [-122.401, 37.721] },
      status: 'pending',
      reportedBy: citizen._id,
    },
    {
      title: 'False Alarm - Reported Gas Leak',
      description: 'Initial report of a major gas leak. Fire department investigated and found it to be a minor issue already handled by maintenance.',
      location: { type: 'Point', coordinates: [-122.48, 37.73] },
      status: 'rejected',
      reportedBy: citizen._id,
      assignedTo: authority._id,
    },
    {
      title: 'Landslide Blocking Mountain Pass',
      description: 'Heavy rains have caused a landslide over the main mountain pass road, rendering it completely impassable. Road crews notified.',
      location: { type: 'Point', coordinates: [-122.50, 37.76] },
      status: 'verified',
      reportedBy: citizen._id,
      assignedTo: authority._id,
    },
  ]);

  console.log('Seed done. Users: citizen@test.com, authority@test.com, admin@test.com (pass: 123456)');
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
