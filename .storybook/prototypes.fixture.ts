import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { faker } from '@faker-js/faker';

export const fullfilledPrototype: Prototype = {
  id: 7627,
  prototypeNm: 'Home Assistant Bot',
  tags: ['Robotics', 'Home Automation', 'AI Assistant'],
  teamNm: 'Team RoboHome',
  users: ['Alice Smith', 'Bob Johnson'],
  summary:
    'A compact robot assistant designed to automate household chores and provide daily insights.',
  status: 3,
  releaseFlg: 1,
  createId: 1001,
  createDate: '2020-05-20T10:15:00Z',
  updateId: 1002,
  updateDate: '2025-01-10T08:30:00Z',
  releaseDate: '2021-06-15T09:00:00Z',
  revision: 4,
  awards: ['Best Innovation 2024', 'Community Choice 2023'],
  freeComment:
    'Our Home Assistant Bot focuses on blending seamlessly into everyday life. The project started as a weekend experiment and evolved into a full-fledged prototype. We leveraged modular hardware and open-source software to keep iterating quickly and gather feedback from real households.',
  systemDescription:
    'The bot uses a modular chassis powered by an ARM-based controller with integrated sensors for navigation. Voice commands are processed via an on-device model to preserve privacy. Optional cloud connectivity unlocks daily briefing features and remote monitoring.',
  viewCount: 14567,
  goodCount: 982,
  commentCount: 126,
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  // mainUrl: 'https://protopedia.net/pic/sample-main.jpg',
  mainUrl: '/img/P-640x360.png',
  relatedLink: 'https://blog.robohome.dev/assistant-bot-overview',
  relatedLink2: 'https://github.com/robohome/home-assistant-bot',
  relatedLink3: 'https://docs.robohome.dev/hardware',
  relatedLink4: 'https://community.robohome.dev/posts/assistant-bot',
  relatedLink5: 'https://twitter.com/robohome/status/assistant-bot',
  licenseType: 0,
  thanksFlg: 0,
  events: ['Maker Faire Tokyo 2023', 'Tech Expo 2024'],
  officialLink: 'https://protopedia.net/prototype/7627',
  materials: ['ARM Cortex Controller', '3D Printed Chassis', 'LIDAR Sensor', 'Li-Po Battery Pack'],
};

export const minimalPrototype: Prototype = {
  ...fullfilledPrototype,
  id: 9001,
  prototypeNm: 'Minimal Prototype',
  summary: undefined,
  status: 2,
  tags: [],
  users: ['Solo Maker'],
  awards: [],
  freeComment: '',
  systemDescription: undefined,
  videoUrl: undefined,
  relatedLink: undefined,
  relatedLink2: undefined,
  relatedLink3: undefined,
  relatedLink4: undefined,
  relatedLink5: undefined,
  events: [],
  materials: [],
  viewCount: 10,
  goodCount: 1,
  commentCount: 0,
  releaseFlg: 0,
  officialLink: '',
};

// Generate random past date with today's day (6th) but different year/month
const generateAnniversaryDate = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 6
  const currentDay = currentDate.getDate(); // 6

  // Generate a random year between 2020 and 2024 (past years)
  const randomYear = faker.date.between({ from: '2008-01-01', to: '2024-12-31' }).getFullYear();

  // Create date with same day (6th) but random past year/month
  const anniversaryDate = new Date(randomYear, currentMonth, currentDay, 9, 0, 0);

  return anniversaryDate.toISOString();
};

export const anniversaryMinimalPrototype: Prototype = {
  ...minimalPrototype,
  id: 9001,
  prototypeNm: 'Anniversary Minimal Prototype',
  status: 1,
  releaseDate: generateAnniversaryDate(),
};
