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
  const candidatesData = [
    {
      name: 'Aman Verma',
      email: 'aman.verma@example.com',
      phone: '+91 98765 43210',
      experience: '4.5 years',
      currentRole: 'Backend Java Developer',
      currentCtc: '12 LPA',
      expectedCtc: '17 LPA',
      noticePeriod: '30 days',
      skills: 'Java 17, Spring Boot, Microservices, PostgreSQL, Kafka',
      notes: 'Strong system design skills, cracked tier-1 client assessments.',
    },
    {
      name: 'Sneha Patel',
      email: 'sneha.patel@example.com',
      phone: '+91 98234 56789',
      experience: '6 years',
      currentRole: 'Senior Salesforce & Cloud Developer',
      currentCtc: '16 LPA',
      expectedCtc: '22 LPA',
      noticePeriod: '15 days',
      skills: 'Salesforce, Apex, LWC, Cloud Integrations, REST APIs',
      notes: 'Excellent client-facing communication. Certified Salesforce Developer.',
    },
    {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      phone: '+91 97123 45678',
      experience: '3.5 years',
      currentRole: 'Frontend React / Next.js Engineer',
      currentCtc: '9 LPA',
      expectedCtc: '14 LPA',
      noticePeriod: 'Immediate',
      skills: 'React, Next.js, TypeScript, Tailwind CSS, Redux Toolkit',
      notes: 'Hands-on live coding champion. Available to join immediately.',
    },
    {
      name: 'Vikramjit Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 99887 76655',
      experience: '8.5 years',
      currentRole: 'Lead Big Data Architect',
      currentCtc: '26 LPA',
      expectedCtc: '34 LPA',
      noticePeriod: '45 days',
      skills: 'Spark, Airflow, Python, Distributed Systems, Snowflake, AWS',
      notes: 'Deep expertise in high-throughput enterprise pipelines.',
    },
    {
      name: 'Pooja Sharma',
      email: 'pooja.sharma@example.com',
      phone: '+91 96543 21890',
      experience: '5 years',
      currentRole: 'Senior DevOps & SRE Engineer',
      currentCtc: '15 LPA',
      expectedCtc: '20 LPA',
      noticePeriod: '30 days',
      skills: 'Kubernetes, AWS, Terraform, Docker, CI/CD, Prometheus',
      notes: 'CKA Certified, handled 50+ microservices deployments on EKS.',
    },
    {
      name: 'Kavita Nair',
      email: 'kavita.nair@example.com',
      phone: '+91 95432 10987',
      experience: '7 years',
      currentRole: 'SAP Enterprise Consultant',
      currentCtc: '20 LPA',
      expectedCtc: '27 LPA',
      noticePeriod: '30 days',
      skills: 'SAP O2C, SD, S/4HANA, UK Statutory Localization, Integration',
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
