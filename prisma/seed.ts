import { PrismaClient, JobStatus, InterviewStatus, InterviewMode } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Interview Schedule System...');

  // 1. Ensure Admin Account
  const adminEmail = 'admin@forcecraver.com';
  const passwordHash = await bcrypt.hash('Fcadmin@123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: 'Forcecraver Administrator' },
    create: {
      email: adminEmail,
      name: 'Forcecraver Administrator',
      passwordHash,
    },
  });
  console.log(`Admin account verified: ${admin.email}`);

  // 2. Fetch Active Jobs to link interviews to
  const activeJobs = await prisma.job.findMany({
    where: { status: JobStatus.ACTIVE },
    take: 10,
  });

  if (activeJobs.length === 0) {
    console.log('No active jobs found in DB. Please ensure jobs exist.');
  }

  // 3. Create or upsert Candidates
  // 3. Create or upsert Candidates with Screening & Hiring Decisions
  const candidatesData = [
    {
      firstName: 'Aman',
      lastName: 'Verma',
      name: 'Aman Verma',
      email: 'aman.verma@example.com',
      phone: '+91 98765 43210',
      location: 'Bangalore, Karnataka',
      experience: '4.5 Years',
      currentRole: 'Backend Java Developer',
      currentCompany: 'Tata Consultancy Services',
      currentCtc: '12 LPA',
      expectedCtc: '17 LPA',
      noticePeriod: '30 Days',
      skills: 'Java 17, Spring Boot, Microservices, PostgreSQL, Kafka, Redis',
      resumeUrl: 'https://drive.google.com/file/d/aman-verma-resume/view',
      linkedinUrl: 'https://linkedin.com/in/aman-verma-dev',
      companyName: 'Novigo',
      jobTitle: 'Senior Java Backend Developer',
      jdShiftTiming: 'Day Shift (India)',
      jdSalaryBudget: '18 LPA',
      screeningStatus: 'SCREENING_PASSED',
      screenedBy: 'Sarthak (Lead Recruiter)',
      screeningDate: new Date(),
      screeningResponse: 'Candidate has 4.5 years of solid backend experience in Spring Boot & distributed caching. Fluent communication, comfortable with Bangalore hybrid schedule.',
      screeningNotes: 'Cracked technical screening questions on multithreading and database indexing. Recommended for client technical round.',
      techSkillsRating: 5,
      communicationRating: 4,
      interviewStatus: 'L2_SCHEDULED',
      finalDecision: 'PENDING',
      finalDecisionNotes: 'L2 interview scheduled with Novigo Tech Architect.',
      notes: 'Strong system design skills, cracked tier-1 client assessments.',
    },
    {
      firstName: 'Sneha',
      lastName: 'Patel',
      name: 'Sneha Patel',
      email: 'sneha.patel@example.com',
      phone: '+91 98234 56789',
      location: 'Pune, Maharashtra',
      experience: '6 Years',
      currentRole: 'Senior Salesforce Developer',
      currentCompany: 'Accenture India',
      currentCtc: '16 LPA',
      expectedCtc: '22 LPA',
      noticePeriod: '15 Days',
      skills: 'Salesforce, Apex, LWC, Cloud Integrations, REST APIs, SOQL',
      resumeUrl: 'https://drive.google.com/file/d/sneha-patel-resume/view',
      linkedinUrl: 'https://linkedin.com/in/sneha-patel-salesforce',
      companyName: 'Galaxy Technologies',
      jobTitle: 'DBA & BRM Specialist',
      jdShiftTiming: 'Day Shift (India)',
      jdSalaryBudget: '22 LPA',
      screeningStatus: 'SCREENING_PASSED',
      screenedBy: 'Priya Nambiar',
      screeningDate: new Date(),
      screeningResponse: 'Certified Salesforce Platform Developer II. Excellent grasp on asynchronous Apex and lightning web components. Available to join within 15 days.',
      screeningNotes: 'Very clear communicator and confident in client-facing discussions.',
      techSkillsRating: 5,
      communicationRating: 5,
      interviewStatus: 'L1_SCHEDULED',
      finalDecision: 'PENDING',
      finalDecisionNotes: 'Initial screening passed. Round 1 scheduled with Galaxy Tech team.',
      notes: 'Excellent client-facing communication. Certified Salesforce Developer.',
    },
    {
      firstName: 'Rohan',
      lastName: 'Mehta',
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      phone: '+91 97123 45678',
      location: 'Gurgaon / Delhi NCR',
      experience: '3.5 Years',
      currentRole: 'Frontend React / Next.js Engineer',
      currentCompany: 'Zomato Tech',
      currentCtc: '9 LPA',
      expectedCtc: '14 LPA',
      noticePeriod: 'Immediate',
      skills: 'React.js, Next.js 15, TypeScript, Tailwind CSS, Redux Toolkit, GraphQL',
      resumeUrl: 'https://drive.google.com/file/d/rohan-mehta-resume/view',
      linkedinUrl: 'https://linkedin.com/in/rohan-mehta-frontend',
      companyName: 'Novigo',
      jobTitle: 'React Frontend Engineer',
      jdShiftTiming: 'Day Shift (India)',
      jdSalaryBudget: '15 LPA',
      screeningStatus: 'SCREENING_PASSED',
      screenedBy: 'Sarthak (Lead Recruiter)',
      screeningDate: new Date(),
      screeningResponse: 'Passionate frontend developer with strong component architecture and live-coding speed. Ready to join immediately.',
      screeningNotes: 'Reviewed portfolio projects - very clean code and responsive UI implementation.',
      techSkillsRating: 4,
      communicationRating: 4,
      interviewStatus: 'L1_SCHEDULED',
      finalDecision: 'PENDING',
      finalDecisionNotes: 'Round 1 live coding session scheduled with Novigo panel.',
      notes: 'Hands-on live coding champion. Available to join immediately.',
    },
    {
      firstName: 'Vikramjit',
      lastName: 'Singh',
      name: 'Vikramjit Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 99887 76655',
      location: 'Hyderabad, Telangana',
      experience: '8.5 Years',
      currentRole: 'Lead Big Data Architect',
      currentCompany: 'Wipro Technologies',
      currentCtc: '26 LPA',
      expectedCtc: '34 LPA',
      noticePeriod: '45 Days',
      skills: 'Apache Spark, PySpark, Airflow, Python, Snowflake, AWS EMR, Kafka',
      resumeUrl: 'https://drive.google.com/file/d/vikram-singh-resume/view',
      linkedinUrl: 'https://linkedin.com/in/vikramjit-singh-data',
      companyName: 'Datapath',
      jobTitle: 'Data Tech Lead / Architect',
      jdShiftTiming: 'US Overlap Shift',
      jdSalaryBudget: '35 LPA',
      screeningStatus: 'SHORTLISTED',
      screenedBy: 'Sarthak (Lead Recruiter)',
      screeningDate: new Date(),
      screeningResponse: 'Architected petabyte-scale data lakes and real-time streaming pipelines. Experienced with US stakeholder management and distributed compute optimization.',
      screeningNotes: 'Top-tier data architect profile. Fits the high-budget requirement for Datapath.',
      techSkillsRating: 5,
      communicationRating: 5,
      interviewStatus: 'L2_SCHEDULED',
      finalDecision: 'PENDING',
      finalDecisionNotes: 'Round 2 architecture review scheduled with VP of Engineering.',
      notes: 'Deep expertise in high-throughput enterprise pipelines.',
    },
    {
      firstName: 'Pooja',
      lastName: 'Sharma',
      name: 'Pooja Sharma',
      email: 'pooja.sharma@example.com',
      phone: '+91 96543 21890',
      location: 'Noida, UP',
      experience: '5 Years',
      currentRole: 'Senior DevOps & SRE Engineer',
      currentCompany: 'Cognizant',
      currentCtc: '15 LPA',
      expectedCtc: '20 LPA',
      noticePeriod: '30 Days',
      skills: 'Kubernetes, AWS, Terraform, Docker, CI/CD, Prometheus, Grafana, Linux',
      resumeUrl: 'https://drive.google.com/file/d/pooja-sharma-resume/view',
      linkedinUrl: 'https://linkedin.com/in/pooja-sharma-devops',
      companyName: 'Novigo',
      jobTitle: 'DevOps & Cloud Engineer',
      jdShiftTiming: 'Day Shift (India)',
      jdSalaryBudget: '21 LPA',
      screeningStatus: 'SCREENING_PASSED',
      screenedBy: 'Alok Kulkarni',
      screeningDate: new Date(),
      screeningResponse: 'CKA Certified Kubernetes Administrator with hands-on infrastructure-as-code production deployments.',
      screeningNotes: 'Demonstrated real-world troubleshooting on EKS live during technical assessment.',
      techSkillsRating: 5,
      communicationRating: 5,
      interviewStatus: 'COMPLETED',
      finalDecision: 'FINAL_SELECT',
      finalDecisionNotes: 'Outstanding candidate! Recommended for immediate offer release at 20 LPA by Novigo panel.',
      notes: 'CKA Certified, handled 50+ microservices deployments on EKS.',
    },
    {
      firstName: 'Kavita',
      lastName: 'Nair',
      name: 'Kavita Nair',
      email: 'kavita.nair@example.com',
      phone: '+91 95432 10987',
      location: 'Mumbai, Maharashtra',
      experience: '7 Years',
      currentRole: 'SAP Enterprise Consultant',
      currentCompany: 'Capgemini',
      currentCtc: '20 LPA',
      expectedCtc: '27 LPA',
      noticePeriod: '30 Days',
      skills: 'SAP O2C, SD, S/4HANA, UK Statutory Localization, EDI Integration',
      resumeUrl: 'https://drive.google.com/file/d/kavita-nair-resume/view',
      linkedinUrl: 'https://linkedin.com/in/kavita-nair-sap',
      companyName: 'Trootech',
      jobTitle: 'SAP O2C Architect',
      jdShiftTiming: 'UK Shift (1 PM - 10 PM)',
      jdSalaryBudget: '28 LPA',
      screeningStatus: 'SCREENING_PASSED',
      screenedBy: 'Simon Wright',
      screeningDate: new Date(),
      screeningResponse: 'Extensive UK client delivery experience, well-versed in order-to-cash lifecycle and S/4HANA migration projects.',
      screeningNotes: 'Very strong consulting pedigree with international client exposure.',
      techSkillsRating: 5,
      communicationRating: 5,
      interviewStatus: 'L3_SCHEDULED',
      finalDecision: 'OFFER_RELEASED',
      finalDecisionNotes: 'Executive interview cleared. Offer released at 27 LPA; awaiting signed acceptance.',
      notes: 'Extensive UK and European client implementation experience.',
    },
  ];

  const createdCandidates = [];
  for (const c of candidatesData) {
    const candidate = await prisma.candidate.upsert({
      where: { id: `cand-${c.email}` },
      update: c,
      create: {
        id: `cand-${c.email}`,
        ...c,
      },
    });
    createdCandidates.push(candidate);
  }
  console.log(`Created/Verified ${createdCandidates.length} Candidates.`);

  // 4. Create Realistic Interview Schedules
  // Clean past sample seed interviews if any to prevent duplicate proliferation
  await prisma.interview.deleteMany({
    where: {
      referenceCode: { startsWith: 'FC-SEED-' },
    },
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Match jobs with candidates
  const sampleInterviews = [
    {
      referenceCode: 'FC-SEED-101',
      jobId: activeJobs[0]?.id || null,
      companyName: activeJobs[0]?.companyName || 'Novigo',
      jobTitle: activeJobs[0]?.jobTitle || 'Senior Java Backend Developer',
      candidateId: createdCandidates[0].id,
      interviewDate: today,
      startTime: '02:30 PM',
      endTime: '03:15 PM',
      timezone: 'IST (UTC+5:30)',
      roundNumber: 2,
      roundName: 'Round 2 - Technical Deep Dive',
      mode: InterviewMode.GOOGLE_MEET,
      meetingLink: 'https://meet.google.com/fc-novigo-tech',
      locationAddress: 'Google Meet Video Call',
      interviewerName: 'Rahul Verma (Technical Architect)',
      interviewerRole: 'Client Tech Panel',
      interviewerEmail: 'rverma@novigo.com',
      status: InterviewStatus.SCHEDULED,
      adminNotes: 'Candidate is well prepared with Spring Boot and Kafka architecture.',
    },
    {
      referenceCode: 'FC-SEED-102',
      jobId: activeJobs[1]?.id || null,
      companyName: activeJobs[1]?.companyName || 'Novigo',
      jobTitle: activeJobs[1]?.jobTitle || 'React Frontend Engineer',
      candidateId: createdCandidates[2].id,
      interviewDate: today,
      startTime: '04:00 PM',
      endTime: '04:45 PM',
      timezone: 'IST (UTC+5:30)',
      roundNumber: 1,
      roundName: 'Round 1 - Frontend Live Coding',
      mode: InterviewMode.GOOGLE_MEET,
      meetingLink: 'https://meet.google.com/fc-novigo-react',
      locationAddress: 'Google Meet Video Call',
      interviewerName: 'Deepak Soni (Lead UI Engineer)',
      interviewerRole: 'Client Tech Panel',
      interviewerEmail: 'dsoni@novigo.com',
      status: InterviewStatus.SCHEDULED,
      adminNotes: 'Requested to review state management and TypeScript code samples.',
    },
    {
      referenceCode: 'FC-SEED-103',
      jobId: activeJobs[2]?.id || null,
      companyName: activeJobs[2]?.companyName || 'Datapath',
      jobTitle: activeJobs[2]?.jobTitle || 'Data Tech Lead / Architect',
      candidateId: createdCandidates[3].id,
      interviewDate: tomorrow,
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      timezone: 'IST (UTC+5:30)',
      roundNumber: 2,
      roundName: 'Round 2 - Architecture & System Design',
      mode: InterviewMode.ZOOM,
      meetingLink: 'https://zoom.us/j/9847291823',
      locationAddress: 'Zoom Meeting Room',
      interviewerName: 'Mark Henderson (VP of Engineering)',
      interviewerRole: 'Client Director',
      interviewerEmail: 'm.henderson@datapath.io',
      status: InterviewStatus.SCHEDULED,
      adminNotes: 'High priority requirement. Datapath requested senior architectural profiles.',
    },
    {
      referenceCode: 'FC-SEED-104',
      jobId: activeJobs[3]?.id || null,
      companyName: activeJobs[3]?.companyName || 'Galaxy Technologies',
      jobTitle: activeJobs[3]?.jobTitle || 'DBA & BRM Specialist',
      candidateId: createdCandidates[1].id,
      interviewDate: tomorrow,
      startTime: '03:30 PM',
      endTime: '04:15 PM',
      timezone: 'IST (UTC+5:30)',
      roundNumber: 1,
      roundName: 'Round 1 - Screening & Experience Fitment',
      mode: InterviewMode.TEAMS,
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/galaxy-fc-interview',
      locationAddress: 'Microsoft Teams Call',
      interviewerName: 'Priya Nambiar (Talent Acquisition Lead)',
      interviewerRole: 'Client HR & Panel',
      interviewerEmail: 'pnambiar@galaxytech.com',
      status: InterviewStatus.SCHEDULED,
      adminNotes: 'Notice period is 15 days which matches client preference.',
    },
    {
      referenceCode: 'FC-SEED-105',
      jobId: activeJobs[4]?.id || null,
      companyName: activeJobs[4]?.companyName || 'Trootech',
      jobTitle: activeJobs[4]?.jobTitle || 'SAP O2C Architect',
      candidateId: createdCandidates[5].id,
      interviewDate: dayAfter,
      startTime: '05:00 PM',
      endTime: '06:00 PM',
      timezone: 'IST (UTC+5:30)',
      roundNumber: 3,
      roundName: 'Round 3 - Client Executive Round',
      mode: InterviewMode.GOOGLE_MEET,
      meetingLink: 'https://meet.google.com/trootech-sap-final',
      locationAddress: 'Google Meet Video Call',
      interviewerName: 'Simon Wright (Enterprise Director)',
      interviewerRole: 'UK Client Lead',
      interviewerEmail: 'simon.w@trootech.co.uk',
      status: InterviewStatus.SCHEDULED,
      adminNotes: 'Cleared technical rounds with outstanding score.',
    },
    {
      referenceCode: 'FC-SEED-106',
      jobId: activeJobs[0]?.id || null,
      companyName: activeJobs[0]?.companyName || 'Novigo',
      jobTitle: activeJobs[0]?.jobTitle || 'DevOps & Cloud Engineer',
      candidateId: createdCandidates[4].id,
      interviewDate: yesterday,
      startTime: '03:00 PM',
      endTime: '03:45 PM',
      timezone: 'IST (UTC+5:30)',
      roundNumber: 2,
      roundName: 'Round 2 - Cloud Infrastructure Assessment',
      mode: InterviewMode.GOOGLE_MEET,
      meetingLink: 'https://meet.google.com/novigo-devops-eval',
      locationAddress: 'Google Meet Video Call',
      interviewerName: 'Alok Kulkarni (Head of DevOps)',
      interviewerRole: 'Client Tech Panel',
      interviewerEmail: 'akulkarni@novigo.com',
      status: InterviewStatus.SELECTED,
      rating: 5,
      feedback: 'Outstanding hands-on expertise in Terraform and AWS EKS. Candidate demonstrated real-world troubleshooting live. Highly recommended for immediate offer rollout.',
      adminNotes: 'Offer discussion initiated with client HR.',
    },
  ];

  for (const item of sampleInterviews) {
    await prisma.interview.create({
      data: item,
    });
  }

  console.log(`Successfully seeded ${sampleInterviews.length} sample interviews.`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
