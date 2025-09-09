import { getAuth } from 'firebase/auth';

export async function approveCompany(companyUid: string) {
  const auth = getAuth();
  const cu = auth.currentUser;
  if (!cu) throw new Error('Inte inloggad');

  const token = await cu.getIdToken(true); // force refresh
  const res = await fetch('/api/admin/approve-company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ companyUid, sendEmail: true }),
  });

  let payload: any = null;
  try { payload = await res.json(); } catch { }
  if (!res.ok) throw new Error(payload?.error || res.statusText || 'Godkännandet misslyckades');
  return payload; // { ok:true, companyUid, isApproved:true, status:'approved' }
}
