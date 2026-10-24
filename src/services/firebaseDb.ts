import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { firestore } from '../firebase.ts';
import { LicenseDetails, SignalItem } from '../types.ts';

export async function saveLicenseToFirestore(lic: LicenseDetails): Promise<void> {
  try {
    const docRef = doc(firestore, 'licenses', lic.id || lic.license_key);
    await setDoc(docRef, {
      id: lic.id || lic.license_key,
      license_key: lic.license_key,
      full_name: lic.full_name,
      phone: lic.phone || '',
      email: lic.email || '',
      amount: lic.amount || 'Paid',
      status: lic.status || 'pending',
      duration_label: lic.duration_label || '1 Month',
      expires_at: lic.expires_at || null,
      lifetime: Boolean(lic.lifetime),
      max_devices: lic.max_devices || 1,
      license_devices: lic.license_devices || [],
      created_at: lic.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore license save warning:', err);
  }
}

export async function fetchLicensesFromFirestore(): Promise<LicenseDetails[]> {
  try {
    const colRef = collection(firestore, 'licenses');
    const q = query(colRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as LicenseDetails);
  } catch (err) {
    console.warn('Firestore fetch licenses warning:', err);
    return [];
  }
}

export async function updateLicenseInFirestore(
  licId: string,
  patch: Partial<LicenseDetails>
): Promise<void> {
  try {
    const docRef = doc(firestore, 'licenses', licId);
    await updateDoc(docRef, {
      ...patch,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore license update warning:', err);
  }
}

export async function deleteLicenseFromFirestore(licId: string): Promise<void> {
  try {
    const docRef = doc(firestore, 'licenses', licId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore license delete warning:', err);
  }
}

export async function saveSignalToFirestore(sig: SignalItem): Promise<void> {
  try {
    const docRef = doc(firestore, 'signals', sig.id.replace('#', ''));
    await setDoc(docRef, {
      ...sig,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore signal save warning:', err);
  }
}

export async function fetchSignalsFromFirestore(): Promise<SignalItem[]> {
  try {
    const colRef = collection(firestore, 'signals');
    const q = query(colRef, orderBy('created_at', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as SignalItem);
  } catch (err) {
    console.warn('Firestore signals fetch warning:', err);
    return [];
  }
}
