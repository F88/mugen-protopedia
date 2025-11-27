import { describe, expect, it, vi } from 'vitest';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { analyzePrototypesForServer } from '@/lib/utils/prototype-analysis.server';
import {
  buildAnniversaries,
  buildAnniversarySlice,
} from '@/lib/utils/prototype-analysis-helpers';
import type { PrototypeAnalysis } from '@/lib/utils/prototype-analysis.types';

// Helper function for tests
function analyzePrototypes(
  prototypes: NormalizedPrototype[],
  options?: Parameters<typeof analyzePrototypesForServer>[1],
): PrototypeAnalysis {
  const serverAnalysis = analyzePrototypesForServer(prototypes, options);

  if (prototypes.length === 0) {
    return {
      ...serverAnalysis,
      anniversaries: {
        birthdayCount: 0,
        birthdayPrototypes: [],
        newbornCount: 0,
        newbornPrototypes: [],
      },
    };
  }

  const { birthdayPrototypes, newbornPrototypes } =
    buildAnniversaries(prototypes);
  const anniversaries = buildAnniversarySlice(
    birthdayPrototypes,
    newbornPrototypes,
  );

  return {
    ...serverAnalysis,
    anniversaries,
  };
}

// Mock the logger to avoid actual logging during tests
vi.mock('@/lib/logger.client', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(() => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    })),
  },
}));

// Mock the protopedia client to avoid actual API calls during tests
vi.mock('@/lib/protopedia-client', () => ({
  protopedia: {
    listPrototypes: vi.fn(),
  },
}));

describe('analyzePrototypes', () => {
  describe('empty input', () => {
    it('should return empty analysis for empty array', () => {
      const result = analyzePrototypes([]);

      expect(result.totalCount).toBe(0);
      expect(result.statusDistribution).toEqual({});
      expect(result.prototypesWithAwards).toBe(0);
      expect(result.topTags).toEqual([]);
      expect(result.averageAgeInDays).toBe(0);
      expect(result.yearDistribution).toEqual({});
      expect(result.topTeams).toEqual([]);
      expect(result.analyzedAt).toBeDefined();
    });
  });

  describe('status distribution analysis', () => {
    it('should correctly count status distribution', () => {
      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, status: 1 }),
        createMockPrototype({ id: 2, status: 1 }),
        createMockPrototype({ id: 3, status: 0 }),
        createMockPrototype({ id: 4, status: undefined }),
      ];

      const result = analyzePrototypes(prototypes);

      expect(result.statusDistribution).toEqual({
        1: 2,
        0: 1,
        unknown: 1,
      });
      expect(result.totalCount).toBe(4);
    });
  });

  describe('awards analysis', () => {
    it('should correctly count prototypes with awards', () => {
      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, awards: ['Award A', 'Award B'] }),
        createMockPrototype({ id: 2, awards: ['Award C'] }),
        createMockPrototype({ id: 3, awards: [] }),
        createMockPrototype({ id: 4, awards: undefined }),
      ];

      const result = analyzePrototypes(prototypes);

      expect(result.prototypesWithAwards).toBe(2);
    });

    it('should handle undefined awards', () => {
      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, awards: undefined }),
        createMockPrototype({ id: 2, awards: undefined }),
      ];

      const result = analyzePrototypes(prototypes);

      expect(result.prototypesWithAwards).toBe(0);
    });
  });

  describe('tags analysis', () => {
    it('should correctly analyze tag frequency', () => {
      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, tags: ['Arduino', 'IoT'] }),
        createMockPrototype({ id: 2, tags: ['Arduino', 'Sensor'] }),
        createMockPrototype({ id: 3, tags: ['IoT'] }),
        createMockPrototype({ id: 4, tags: [] }),
        createMockPrototype({ id: 5, tags: undefined }),
      ];

      const result = analyzePrototypes(prototypes);

      expect(result.topTags).toEqual([
        { tag: 'Arduino', count: 2 },
        { tag: 'IoT', count: 2 },
        { tag: 'Sensor', count: 1 },
      ]);
    });

    it('should limit to top 30 tags', () => {
      const prototypes: NormalizedPrototype[] = [];
      // Create prototypes with 35 different tags
      for (let i = 0; i < 35; i++) {
        prototypes.push(
          createMockPrototype({
            id: i,
            tags: [`tag${i}`, `tag${i}`, `tag${i}`], // Each tag appears 3 times
          }),
        );
      }

      const result = analyzePrototypes(prototypes);

      expect(result.topTags).toHaveLength(30);
      expect(result.topTags[0].count).toBe(3);
    });
  });

  describe('age analysis', () => {
    it('should calculate correct average age', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: yesterday.toISOString() }),
        createMockPrototype({ id: 2, releaseDate: weekAgo.toISOString() }),
      ];

      const result = analyzePrototypes(prototypes);

      // Average should be approximately 4 days ((1 + 7) / 2)
      expect(result.averageAgeInDays).toBeCloseTo(4, 0);
    });

    it('should handle invalid dates', () => {
      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: 'invalid-date' }),
        createMockPrototype({ id: 2, releaseDate: '' }),
      ];

      const result = analyzePrototypes(prototypes);

      expect(result.averageAgeInDays).toBe(0);
    });
  });

  describe('year distribution analysis', () => {
    it('should correctly distribute prototypes by year', () => {
      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: '2023-01-01T00:00:00Z' }),
        createMockPrototype({ id: 2, releaseDate: '2023-06-01T00:00:00Z' }),
        createMockPrototype({ id: 3, releaseDate: '2024-01-01T00:00:00Z' }),
      ];

      const result = analyzePrototypes(prototypes);

      expect(result.yearDistribution).toEqual({
        2023: 2,
        2024: 1,
      });
    });

    it('should ignore invalid years', () => {
      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: 'invalid-date' }),
        createMockPrototype({ id: 2, releaseDate: '1800-01-01T00:00:00Z' }), // Before 1900
      ];

      const result = analyzePrototypes(prototypes);

      expect(result.yearDistribution).toEqual({});
    });
  });

  describe('team analysis', () => {
    it('should correctly analyze team activity', () => {
      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, teamNm: 'Team A' }),
        createMockPrototype({ id: 2, teamNm: 'Team A' }),
        createMockPrototype({ id: 3, teamNm: 'Team B' }),
        createMockPrototype({ id: 4, teamNm: '  Team A  ' }), // With whitespace
        createMockPrototype({ id: 5, teamNm: '' }),
        createMockPrototype({ id: 6, teamNm: '' }), // Empty team name
      ];

      const result = analyzePrototypes(prototypes);

      expect(result.topTeams).toEqual([
        { team: 'Team A', count: 3 },
        { team: 'Team B', count: 1 },
      ]);
    });

    it('should limit to top 30 teams', () => {
      const prototypes: NormalizedPrototype[] = [];
      // Create prototypes with 35 different teams
      for (let i = 0; i < 35; i++) {
        prototypes.push(
          createMockPrototype({
            id: i,
            teamNm: `Team ${i}`,
          }),
        );
        prototypes.push(
          createMockPrototype({
            id: i + 100,
            teamNm: `Team ${i}`,
          }),
        );
      }

      const result = analyzePrototypes(prototypes);

      expect(result.topTeams).toHaveLength(30);
      expect(result.topTeams[0].count).toBe(2);
    });
  });

  describe('comprehensive analysis', () => {
    it('should handle complex data set correctly', () => {
      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({
          id: 1,
          status: 1,
          awards: ['Excellence Award'],
          tags: ['Arduino', 'IoT'],
          releaseDate: '2023-01-01T00:00:00Z',
          teamNm: 'Innovation Team',
        }),
        createMockPrototype({
          id: 2,
          status: 1,
          awards: [],
          tags: ['Arduino', 'Sensor'],
          releaseDate: '2023-06-01T00:00:00Z',
          teamNm: 'Hardware Team',
        }),
        createMockPrototype({
          id: 3,
          status: 0,
          awards: ['Special Award', 'Innovation Award'],
          tags: ['IoT', 'Cloud'],
          releaseDate: '2024-01-01T00:00:00Z',
          teamNm: 'Innovation Team',
        }),
      ];

      const result = analyzePrototypes(prototypes);

      expect(result.totalCount).toBe(3);
      expect(result.statusDistribution).toEqual({
        1: 2,
        0: 1,
      });
      expect(result.prototypesWithAwards).toBe(2);
      expect(result.topTags).toContainEqual({ tag: 'Arduino', count: 2 });
      expect(result.topTags).toContainEqual({ tag: 'IoT', count: 2 });
      expect(result.yearDistribution).toEqual({
        2023: 2,
        2024: 1,
      });
      expect(result.topTeams).toContainEqual({
        team: 'Innovation Team',
        count: 2,
      });
      expect(result.topTeams).toContainEqual({
        team: 'Hardware Team',
        count: 1,
      });
      expect(result.averageAgeInDays).toBeGreaterThan(0);
      expect(result.analyzedAt).toBeDefined();
    });
  });

  describe('performance tests with large datasets', () => {
    it('should handle 1000 prototypes efficiently', () => {
      const prototypes: NormalizedPrototype[] = [];
      const startYear = 2020;
      const endYear = 2024;
      const statusOptions = [0, 1, 2];
      // Generate approximately 1000 different tag options for realistic diversity
      const tagOptions: string[] = [];
      const tagCategories = [
        'Arduino',
        'Raspberry Pi',
        'ESP32',
        'ESP8266',
        'STM32',
        'PIC',
        'AVR',
        'ARM',
        'RISC-V',
        'FPGA',
        'IoT',
        'Edge Computing',
        'Fog Computing',
        'Smart City',
        'Smart Home',
        'Wearable',
        'Embedded',
        'Real-time',
        'Mesh Network',
        'LoRa',
        'Sensor',
        'Actuator',
        'Temperature',
        'Humidity',
        'Pressure',
        'Accelerometer',
        'Gyroscope',
        'GPS',
        'Camera',
        'Microphone',
        'AI',
        'ML',
        'Deep Learning',
        'Neural Network',
        'Computer Vision',
        'NLP',
        'Reinforcement Learning',
        'Supervised Learning',
        'Unsupervised Learning',
        'Transfer Learning',
        'Web',
        'Mobile',
        'Desktop',
        'Cross-platform',
        'Progressive Web App',
        'Single Page App',
        'Responsive',
        'Accessibility',
        'Performance',
        'SEO',
        'Cloud',
        'AWS',
        'Azure',
        'GCP',
        'Serverless',
        'Microservices',
        'Container',
        'Kubernetes',
        'Docker',
        'CI/CD',
        'Hardware',
        'Software',
        'Firmware',
        'RTOS',
        'Linux',
        'Windows',
        'macOS',
        'Android',
        'iOS',
        'Embedded Linux',
        'Python',
        'JavaScript',
        'TypeScript',
        'Java',
        'C++',
        'C',
        'Rust',
        'Go',
        'Swift',
        'Kotlin',
        'React',
        'Vue',
        'Angular',
        'Node.js',
        'Express',
        'Django',
        'Flask',
        'Spring',
        'Laravel',
        'Rails',
        'Database',
        'SQL',
        'NoSQL',
        'MongoDB',
        'PostgreSQL',
        'MySQL',
        'Redis',
        'Elasticsearch',
        'Neo4j',
        'GraphQL',
        'Security',
        'Encryption',
        'Authentication',
        'Authorization',
        'OAuth',
        'JWT',
        'Blockchain',
        'Cryptocurrency',
        'Smart Contract',
        'DeFi',
        'Game',
        'Unity',
        'Unreal',
        '2D',
        '3D',
        'VR',
        'AR',
        'Mixed Reality',
        'WebGL',
        'Graphics',
        'Audio',
        'Video',
        'Streaming',
        'Real-time Communication',
        'WebRTC',
        'FFmpeg',
        'OpenCV',
        'Image Processing',
        'Signal Processing',
        'DSP',
        'Robotics',
        'Automation',
        'Control System',
        'PID',
        'Servo',
        'Motor',
        'Drone',
        'UAV',
        'AGV',
        'Manufacturing',
        'Data Science',
        'Analytics',
        'Visualization',
        'Dashboard',
        'BI',
        'ETL',
        'Data Pipeline',
        'Stream Processing',
        'Batch Processing',
        'MapReduce',
        'Network',
        'TCP/IP',
        'HTTP',
        'WebSocket',
        'REST',
        'SOAP',
        'gRPC',
        'MQTT',
        'CoAP',
        'Bluetooth',
        'Testing',
        'Unit Test',
        'Integration Test',
        'E2E Test',
        'Performance Test',
        'Load Test',
        'Security Test',
        'Automation Test',
        'TDD',
        'BDD',
        'DevOps',
        'Infrastructure',
        'Monitoring',
        'Logging',
        'Alerting',
        'Deployment',
        'Configuration Management',
        'IaC',
        'Terraform',
        'Ansible',
        'Open Source',
        'MIT',
        'GPL',
        'Apache',
        'BSD',
        'Creative Commons',
        'Documentation',
        'Tutorial',
        'Workshop',
        'Hackathon',
        'Prototype',
        'MVP',
        'Proof of Concept',
        'Research',
        'Innovation',
        'Startup',
        'Enterprise',
        'Educational',
        'Commercial',
        'Non-profit',
      ];

      // Generate 1000 unique tags by combining categories with numbers
      for (
        let i = 0;
        i < tagCategories.length && tagOptions.length < 1000;
        i++
      ) {
        tagOptions.push(tagCategories[i]);
        // Add numbered variants for popular categories
        if (i < 50) {
          for (let j = 1; j <= 19 && tagOptions.length < 1000; j++) {
            tagOptions.push(`${tagCategories[i]} ${j}`);
          }
        }
      }
      const awardOptions = [
        'Excellence Award',
        'Innovation Award',
        'Special Award',
        'Best Design',
        'Best Implementation',
      ];

      // Generate 1000 diverse prototypes
      for (let i = 0; i < 1000; i++) {
        const year =
          startYear + Math.floor(Math.random() * (endYear - startYear + 1));
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const releaseDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00Z`;

        // Random tags (0-5 tags per prototype)
        const tagCount = Math.floor(Math.random() * 6);
        const tags: string[] = [];
        for (let t = 0; t < tagCount; t++) {
          const tag = tagOptions[Math.floor(Math.random() * tagOptions.length)];
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        }

        // Random awards (0-3 awards per prototype, 30% chance of having awards)
        const awards: string[] = [];
        if (Math.random() < 0.3) {
          const awardCount = Math.floor(Math.random() * 4);
          for (let a = 0; a < awardCount; a++) {
            const award =
              awardOptions[Math.floor(Math.random() * awardOptions.length)];
            if (!awards.includes(award)) {
              awards.push(award);
            }
          }
        }

        prototypes.push(
          createMockPrototype({
            id: i + 1,
            prototypeNm: `Prototype ${i + 1}`,
            status:
              statusOptions[Math.floor(Math.random() * statusOptions.length)],
            releaseDate,
            teamNm: `Team ${Math.floor(i / 50) + 1}`, // 20 different teams
            tags,
            awards,
          }),
        );
      }

      const startTime = performance.now();
      const result = analyzePrototypes(prototypes);
      const endTime = performance.now();
      const elapsedMs = endTime - startTime;

      // Performance assertion - should complete within reasonable time
      expect(elapsedMs).toBeLessThan(1000); // Less than 1 second

      // Validate results
      expect(result.totalCount).toBe(1000);
      expect(Object.keys(result.statusDistribution).length).toBeGreaterThan(0);
      expect(result.topTags.length).toBeLessThanOrEqual(30);
      expect(result.topTeams.length).toBeLessThanOrEqual(30);
      expect(result.averageAgeInDays).toBeGreaterThan(0);
      expect(Object.keys(result.yearDistribution).length).toBeGreaterThan(0);
      expect(result.analyzedAt).toBeDefined();
    });

    it('should handle 10000 prototypes efficiently', () => {
      const prototypes: NormalizedPrototype[] = [];
      const startYear = 2015;
      const endYear = 2024;
      const statusOptions = [0, 1, 2, 3];
      // Generate approximately 10000 different tag options for realistic diversity
      const tagOptions: string[] = [];
      const tagCategories = [
        'Arduino',
        'Raspberry Pi',
        'ESP32',
        'ESP8266',
        'STM32',
        'PIC',
        'AVR',
        'ARM',
        'RISC-V',
        'FPGA',
        'IoT',
        'Edge Computing',
        'Fog Computing',
        'Smart City',
        'Smart Home',
        'Wearable',
        'Embedded',
        'Real-time',
        'Mesh Network',
        'LoRa',
        'Sensor',
        'Actuator',
        'Temperature',
        'Humidity',
        'Pressure',
        'Accelerometer',
        'Gyroscope',
        'GPS',
        'Camera',
        'Microphone',
        'AI',
        'ML',
        'Deep Learning',
        'Neural Network',
        'Computer Vision',
        'NLP',
        'Reinforcement Learning',
        'Supervised Learning',
        'Unsupervised Learning',
        'Transfer Learning',
        'Web',
        'Mobile',
        'Desktop',
        'Cross-platform',
        'Progressive Web App',
        'Single Page App',
        'Responsive',
        'Accessibility',
        'Performance',
        'SEO',
        'Cloud',
        'AWS',
        'Azure',
        'GCP',
        'Serverless',
        'Microservices',
        'Container',
        'Kubernetes',
        'Docker',
        'CI/CD',
        'Hardware',
        'Software',
        'Firmware',
        'RTOS',
        'Linux',
        'Windows',
        'macOS',
        'Android',
        'iOS',
        'Embedded Linux',
        'Python',
        'JavaScript',
        'TypeScript',
        'Java',
        'C++',
        'C',
        'Rust',
        'Go',
        'Swift',
        'Kotlin',
        'React',
        'Vue',
        'Angular',
        'Node.js',
        'Express',
        'Django',
        'Flask',
        'Spring',
        'Laravel',
        'Rails',
        'Database',
        'SQL',
        'NoSQL',
        'MongoDB',
        'PostgreSQL',
        'MySQL',
        'Redis',
        'Elasticsearch',
        'Neo4j',
        'GraphQL',
        'Security',
        'Encryption',
        'Authentication',
        'Authorization',
        'OAuth',
        'JWT',
        'Blockchain',
        'Cryptocurrency',
        'Smart Contract',
        'DeFi',
        'Game',
        'Unity',
        'Unreal',
        '2D',
        '3D',
        'VR',
        'AR',
        'Mixed Reality',
        'WebGL',
        'Graphics',
        'Audio',
        'Video',
        'Streaming',
        'Real-time Communication',
        'WebRTC',
        'FFmpeg',
        'OpenCV',
        'Image Processing',
        'Signal Processing',
        'DSP',
        'Robotics',
        'Automation',
        'Control System',
        'PID',
        'Servo',
        'Motor',
        'Drone',
        'UAV',
        'AGV',
        'Manufacturing',
        'Data Science',
        'Analytics',
        'Visualization',
        'Dashboard',
        'BI',
        'ETL',
        'Data Pipeline',
        'Stream Processing',
        'Batch Processing',
        'MapReduce',
        'Network',
        'TCP/IP',
        'HTTP',
        'WebSocket',
        'REST',
        'SOAP',
        'gRPC',
        'MQTT',
        'CoAP',
        'Bluetooth',
        'Testing',
        'Unit Test',
        'Integration Test',
        'E2E Test',
        'Performance Test',
        'Load Test',
        'Security Test',
        'Automation Test',
        'TDD',
        'BDD',
        'DevOps',
        'Infrastructure',
        'Monitoring',
        'Logging',
        'Alerting',
        'Deployment',
        'Configuration Management',
        'IaC',
        'Terraform',
        'Ansible',
        'Open Source',
        'MIT',
        'GPL',
        'Apache',
        'BSD',
        'Creative Commons',
        'Documentation',
        'Tutorial',
        'Workshop',
        'Hackathon',
        'Prototype',
        'MVP',
        'Proof of Concept',
        'Research',
        'Innovation',
        'Startup',
        'Enterprise',
        'Educational',
        'Commercial',
        'Non-profit',
        // Extended categories for 10000 scale
        'Frontend',
        'Backend',
        'Full-stack',
        'API',
        'Microservice',
        'Monolith',
        'Distributed',
        'Concurrent',
        'Parallel',
        'Async',
        'Framework',
        'Library',
        'SDK',
        'CLI',
        'GUI',
        'Terminal',
        'Console',
        'Interface',
        'Protocol',
        'Standard',
        'Algorithm',
        'Data Structure',
        'Optimization',
        'Compression',
        'Serialization',
        'Deserialization',
        'Parsing',
        'Validation',
        'Transformation',
        'Migration',
        'Monitoring',
        'Observability',
        'Tracing',
        'Profiling',
        'Debugging',
        'Error Handling',
        'Exception',
        'Recovery',
        'Resilience',
        'Fault Tolerance',
        'Performance',
        'Scalability',
        'Reliability',
        'Availability',
        'Consistency',
        'Durability',
        'Integrity',
        'Confidentiality',
        'Privacy',
        'Compliance',
      ];

      // Generate 10000 unique tags by combining categories with numbers
      for (
        let i = 0;
        i < tagCategories.length && tagOptions.length < 10000;
        i++
      ) {
        tagOptions.push(tagCategories[i]);
        // Add numbered variants
        const maxVariants = Math.min(
          99,
          Math.floor((10000 - tagCategories.length) / tagCategories.length),
        );
        for (let j = 1; j <= maxVariants && tagOptions.length < 10000; j++) {
          tagOptions.push(`${tagCategories[i]} ${j}`);
        }
      }
      const awardOptions = [
        'Excellence Award',
        'Innovation Award',
        'Special Award',
        'Best Design',
        'Best Implementation',
        'Popular Choice',
        'Technical Achievement',
        'Creative Solution',
        'Industry Impact',
        'Future Vision',
      ];

      // Generate 10000 diverse prototypes
      for (let i = 0; i < 10000; i++) {
        const year =
          startYear + Math.floor(Math.random() * (endYear - startYear + 1));
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const releaseDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00Z`;

        // Random tags (0-8 tags per prototype)
        const tagCount = Math.floor(Math.random() * 9);
        const tags: string[] = [];
        for (let t = 0; t < tagCount; t++) {
          const tag = tagOptions[Math.floor(Math.random() * tagOptions.length)];
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        }

        // Random awards (0-4 awards per prototype, 25% chance of having awards)
        const awards: string[] = [];
        if (Math.random() < 0.25) {
          const awardCount = Math.floor(Math.random() * 5);
          for (let a = 0; a < awardCount; a++) {
            const award =
              awardOptions[Math.floor(Math.random() * awardOptions.length)];
            if (!awards.includes(award)) {
              awards.push(award);
            }
          }
        }

        prototypes.push(
          createMockPrototype({
            id: i + 1,
            prototypeNm: `Prototype ${i + 1}`,
            status:
              statusOptions[Math.floor(Math.random() * statusOptions.length)],
            releaseDate,
            teamNm: `Team ${Math.floor(i / 100) + 1}`, // 100 different teams
            tags,
            awards,
          }),
        );
      }

      const startTime = performance.now();
      const result = analyzePrototypes(prototypes);
      const endTime = performance.now();
      const elapsedMs = endTime - startTime;

      // Performance assertion - should complete within reasonable time (allowing more time for 10k records)
      expect(elapsedMs).toBeLessThan(5000); // Less than 5 seconds

      // Validate results
      expect(result.totalCount).toBe(10000);
      expect(Object.keys(result.statusDistribution).length).toBeGreaterThan(0);
      expect(result.topTags.length).toBeLessThanOrEqual(30);
      expect(result.topTeams.length).toBeLessThanOrEqual(30);
      expect(result.averageAgeInDays).toBeGreaterThan(0);
      expect(Object.keys(result.yearDistribution).length).toBeGreaterThan(0);
      expect(result.analyzedAt).toBeDefined();

      // Additional validation for large dataset
      expect(result.prototypesWithAwards).toBeGreaterThan(0);
      expect(result.prototypesWithAwards).toBeLessThan(10000);

      // Verify top 10 limitations are working
      expect(result.topTags.length).toBeLessThanOrEqual(30);
      expect(result.topTeams.length).toBeLessThanOrEqual(30);

      // Check that counts are reasonable
      const totalTagCount = result.topTags.reduce(
        (sum, tag) => sum + tag.count,
        0,
      );
      expect(totalTagCount).toBeGreaterThan(0);

      const totalTeamCount = result.topTeams.reduce(
        (sum, team) => sum + team.count,
        0,
      );
      expect(totalTeamCount).toBe(3000); // Top 30 teams (100 prototypes each = 3000 total)
    });
  });
});

// Helper function to create mock prototype data
function createMockPrototype(
  overrides: Partial<NormalizedPrototype> = {},
): NormalizedPrototype {
  return {
    id: 1,
    prototypeNm: 'Test Prototype',
    summary: 'Test summary',
    status: 1,
    releaseFlg: 1,
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
    releaseDate: new Date().toISOString(),
    revision: 1,
    freeComment: '',
    teamNm: 'Test Team',
    users: ['User 1'],
    tags: [],
    awards: [],
    events: [],
    materials: [],
    licenseType: 1,
    thanksFlg: 0,
    mainUrl: 'https://example.com/main.jpg',
    videoUrl: undefined,
    officialLink: undefined,
    viewCount: 0,
    goodCount: 0,
    commentCount: 0,
    ...overrides,
  };
}

describe('Anniversary Analysis', () => {
  it('should identify birthday prototypes correctly', () => {
    const today = new Date();

    // Create prototypes with today's date in different years
    const prototypes = [
      createMockPrototype({
        id: 1,
        prototypeNm: 'Birthday Prototype 1',
        releaseDate: `${today.getFullYear() - 2}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}T00:00:00Z`,
      }),
      createMockPrototype({
        id: 2,
        prototypeNm: 'Birthday Prototype 2',
        releaseDate: `${today.getFullYear() - 5}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}T00:00:00Z`,
      }),
      createMockPrototype({
        id: 3,
        prototypeNm: 'Not Birthday Prototype',
        releaseDate: `${today.getFullYear() - 1}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${(today.getDate() + 1).toString().padStart(2, '0')}T00:00:00Z`,
      }),
    ];

    const result = analyzePrototypes(prototypes);

    expect(result.anniversaries.birthdayCount).toBe(2);
    expect(result.anniversaries.birthdayPrototypes).toHaveLength(2);

    const birthdayProto1 = result.anniversaries.birthdayPrototypes.find(
      (p) => p.id === 1,
    );
    const birthdayProto2 = result.anniversaries.birthdayPrototypes.find(
      (p) => p.id === 2,
    );

    expect(birthdayProto1).toBeDefined();
    expect(birthdayProto1?.title).toBe('Birthday Prototype 1');
    expect(birthdayProto1?.years).toBe(2);

    expect(birthdayProto2).toBeDefined();
    expect(birthdayProto2?.title).toBe('Birthday Prototype 2');
    expect(birthdayProto2?.years).toBe(5);
  });

  it('should handle leap year birthdays correctly', () => {
    const currentYear = new Date().getFullYear();
    const isCurrentLeapYear =
      (currentYear % 4 === 0 && currentYear % 100 !== 0) ||
      currentYear % 400 === 0;

    // Create a prototype with Feb 29 birthday from a leap year
    const leapYearBirthday = createMockPrototype({
      id: 1,
      prototypeNm: 'Leap Year Birthday',
      releaseDate: `${currentYear - 4}-02-29T00:00:00Z`, // 4 years ago leap year
    });

    const prototypes = [leapYearBirthday];
    const result = analyzePrototypes(prototypes);

    // If today is Feb 29 (leap year) or Feb 28 (non-leap year), it should be detected
    const today = new Date();
    const isLeapDayToday =
      today.getMonth() === 1 && today.getDate() === 29 && isCurrentLeapYear;
    const isLeapDayTodayInNonLeapYear =
      today.getMonth() === 1 && today.getDate() === 28 && !isCurrentLeapYear;

    if (isLeapDayToday || isLeapDayTodayInNonLeapYear) {
      expect(result.anniversaries.birthdayCount).toBe(1);
      expect(result.anniversaries.birthdayPrototypes[0].years).toBe(4);
    } else {
      expect(result.anniversaries.birthdayCount).toBe(0);
    }
  });

  it('should return empty anniversaries for empty data', () => {
    const result = analyzePrototypes([]);

    expect(result.anniversaries.birthdayCount).toBe(0);
    expect(result.anniversaries.birthdayPrototypes).toEqual([]);
    expect(result.anniversaries.newbornCount).toBe(0);
    expect(result.anniversaries.newbornPrototypes).toEqual([]);
  });

  it('should handle invalid release dates gracefully', () => {
    const prototypes = [
      createMockPrototype({
        id: 1,
        prototypeNm: 'Invalid Date Prototype',
        releaseDate: 'invalid-date',
      }),
    ];

    const result = analyzePrototypes(prototypes);

    expect(result.anniversaries.birthdayCount).toBe(0);
    expect(result.anniversaries.birthdayPrototypes).toEqual([]);
    expect(result.anniversaries.newbornCount).toBe(0);
    expect(result.anniversaries.newbornPrototypes).toEqual([]);
  });
});

describe('Newborn Analysis', () => {
  it('should identify prototypes published today correctly', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Create prototypes with today's date
    const prototypes = [
      createMockPrototype({
        id: 1,
        prototypeNm: 'Newborn Prototype 1',
        releaseDate: today.toISOString(),
      }),
      createMockPrototype({
        id: 2,
        prototypeNm: 'Newborn Prototype 2',
        releaseDate: today.toISOString(),
      }),
      createMockPrototype({
        id: 3,
        prototypeNm: 'Old Prototype',
        releaseDate: yesterday.toISOString(),
      }),
    ];

    const result = analyzePrototypes(prototypes);

    expect(result.anniversaries.newbornCount).toBe(2);
    expect(result.anniversaries.newbornPrototypes).toHaveLength(2);

    const newborn1 = result.anniversaries.newbornPrototypes.find(
      (p) => p.id === 1,
    );
    const newborn2 = result.anniversaries.newbornPrototypes.find(
      (p) => p.id === 2,
    );

    expect(newborn1).toBeDefined();
    expect(newborn1?.title).toBe('Newborn Prototype 1');

    expect(newborn2).toBeDefined();
    expect(newborn2?.title).toBe('Newborn Prototype 2');
  });

  it("should not identify yesterday's prototypes as newborn", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const prototypes = [
      createMockPrototype({
        id: 1,
        prototypeNm: 'Yesterday Prototype',
        releaseDate: yesterday.toISOString(),
      }),
    ];

    const result = analyzePrototypes(prototypes);

    expect(result.anniversaries.newbornCount).toBe(0);
    expect(result.anniversaries.newbornPrototypes).toEqual([]);
  });

  it("should not identify tomorrow's prototypes as newborn", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const prototypes = [
      createMockPrototype({
        id: 1,
        prototypeNm: 'Tomorrow Prototype',
        releaseDate: tomorrow.toISOString(),
      }),
    ];

    const result = analyzePrototypes(prototypes);

    expect(result.anniversaries.newbornCount).toBe(0);
    expect(result.anniversaries.newbornPrototypes).toEqual([]);
  });

  it('should handle different times on the same day as newborn', () => {
    const today = new Date();
    const todayMorning = new Date(today);
    todayMorning.setHours(0, 0, 0, 0);
    const todayEvening = new Date(today);
    todayEvening.setHours(23, 59, 59, 999);

    const prototypes = [
      createMockPrototype({
        id: 1,
        prototypeNm: 'Morning Prototype',
        releaseDate: todayMorning.toISOString(),
      }),
      createMockPrototype({
        id: 2,
        prototypeNm: 'Evening Prototype',
        releaseDate: todayEvening.toISOString(),
      }),
    ];

    const result = analyzePrototypes(prototypes);

    expect(result.anniversaries.newbornCount).toBe(2);
    expect(result.anniversaries.newbornPrototypes).toHaveLength(2);
  });

  it('should handle empty data for newborn analysis', () => {
    const result = analyzePrototypes([]);

    expect(result.anniversaries.newbornCount).toBe(0);
    expect(result.anniversaries.newbornPrototypes).toEqual([]);
  });

  it('should handle invalid dates in newborn analysis', () => {
    const prototypes = [
      createMockPrototype({
        id: 1,
        prototypeNm: 'Invalid Date Prototype',
        releaseDate: 'invalid-date',
      }),
    ];

    const result = analyzePrototypes(prototypes);

    expect(result.anniversaries.newbornCount).toBe(0);
    expect(result.anniversaries.newbornPrototypes).toEqual([]);
  });
});
