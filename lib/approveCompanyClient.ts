import { getAuth } from 'firebase/auth';

export async function approveCompany(companyUid: string) {
  const token = await getAuth().currentUser?.getIdToken();
  if (!token) throw new Error('Inte inloggad');

  const res = await fetch('/api/admin/approve-company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ companyUid, sendEmail: true }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
