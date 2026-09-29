import { redirect } from 'next/navigation';

export default function CandidatesRedirectPage() {
  const candidatePortalUrl = process.env.NEXT_PUBLIC_CANDIDATE_PORTAL_URL || 'http://localhost:3002';
  redirect(candidatePortalUrl);
}
