import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ArtisanProfile, BuyerProfile, BuyerBusinessType, LanguageCode, UserRole } from '../types';

export interface UserAccount {
  id: string; // Unique generated account ID (e.g. "art_1725200000000_abc123" or "buyer_1725200000000_xyz789")
  name: string; // "Sam"
  email: string;
  password: string;
  role: 'artisan' | 'buyer';
  createdAt: string;
  artisanProfile?: ArtisanProfile;
  buyerProfile?: BuyerProfile;
}

export interface AuthContextType {
  user: { uid: string; email?: string | null; name?: string } | null;
  role: 'artisan' | 'buyer' | null;
  artisan: ArtisanProfile | null;
  buyerProfile: BuyerProfile | null;
  loading: boolean;
  login: (
    identifier: string,
    password: string,
    rolePreference?: 'artisan' | 'buyer'
  ) => Promise<{ role: 'artisan' | 'buyer'; account: UserAccount }>;
  signup: (
    email: string,
    password: string,
    profileData: {
      name: string;
      businessName?: string;
      craftType: string;
      experienceYears?: number;
      location?: string;
      state?: string;
      phone?: string;
      preferredLanguage?: LanguageCode;
      bio?: string;
    }
  ) => Promise<UserAccount>;
  signupBuyer: (
    email: string,
    password: string,
    buyerData: {
      businessName: string;
      contactPerson: string;
      phone: string;
      businessType: BuyerBusinessType | string;
      cityState: string;
    }
  ) => Promise<UserAccount>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<ArtisanProfile>) => Promise<void>;
  updateBuyerProfile: (updates: Partial<BuyerProfile>) => Promise<void>;
  setRole: (role: 'artisan' | 'buyer') => void;
}

// Storage Keys
const SESSION_STORAGE_KEY = 'kalaconnect_current_session';
const ACCOUNTS_REGISTRY_KEY = 'kalaconnect_accounts_list';

// Helper to get all stored accounts
function getStoredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : Object.values(parsed);
  } catch {
    return [];
  }
}

// Helper to save all stored accounts
function saveStoredAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts registry:', err);
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email?: string | null; name?: string } | null>(null);
  const [role, setRoleState] = useState<'artisan' | 'buyer' | null>(null);
  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setRole = (newRole: 'artisan' | 'buyer') => {
    setRoleState(newRole);
    localStorage.setItem('kalaconnect_user_role', newRole);
  };

  // Initialize Session on mount: Restore ONLY if valid session exists
  useEffect(() => {
    let isMounted = true;

    try {
      const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session && session.id) {
          const accounts = getStoredAccounts();
          const matchedAccount = accounts.find((acc) => acc.id === session.id);

          if (matchedAccount) {
            setUser({
              uid: matchedAccount.id,
              email: matchedAccount.email,
              name: matchedAccount.name,
            });
            setRoleState(matchedAccount.role);
            localStorage.setItem('kalaconnect_user_role', matchedAccount.role);

            if (matchedAccount.role === 'buyer' && matchedAccount.buyerProfile) {
              setBuyerProfile(matchedAccount.buyerProfile);
              setArtisan(null);
            } else if (matchedAccount.role === 'artisan' && matchedAccount.artisanProfile) {
              setArtisan(matchedAccount.artisanProfile);
              setBuyerProfile(null);
            }
          } else if (session.role) {
            // Session had standalone profile
            setUser({
              uid: session.id,
              email: session.email || '',
              name: session.name || '',
            });
            setRoleState(session.role);
            if (session.role === 'buyer') {
              setBuyerProfile(session.buyerProfile || null);
              setArtisan(null);
            } else {
              setArtisan(session.artisanProfile || session.profile || null);
              setBuyerProfile(null);
            }
          }
        }
      } else {
        // No active session — User is strictly LOGGED OUT
        setUser(null);
        setRoleState(null);
        setArtisan(null);
        setBuyerProfile(null);
      }
    } catch (e) {
      console.warn('Session init error:', e);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setUser(null);
      setRoleState(null);
      setArtisan(null);
      setBuyerProfile(null);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Login Handler: Searches stored accounts by identifier (email, username, or name) & password,
   * cleanly distinguishing Artisan vs Buyer accounts even when credentials/names match.
   */
  const login = async (
    identifier: string,
    pass: string,
    rolePreference?: 'artisan' | 'buyer'
  ): Promise<{ role: 'artisan' | 'buyer'; account: UserAccount }> => {
    setLoading(true);
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      const accounts = getStoredAccounts();

      // Search accounts matching identifier & password
      const matchingAccounts = accounts.filter((acc) => {
        const emailMatch = acc.email?.toLowerCase() === cleanId;
        const nameMatch = acc.name?.toLowerCase() === cleanId;
        const passwordMatch = acc.password === cleanPass;
        return (emailMatch || nameMatch) && passwordMatch;
      });

      let targetAccount: UserAccount | undefined;

      if (matchingAccounts.length === 0) {
        // If not found by name/email in local accounts, check if single email matches
        const emailOnlyAccounts = accounts.filter(
          (acc) => acc.email?.toLowerCase() === cleanId || acc.name?.toLowerCase() === cleanId
        );
        if (emailOnlyAccounts.length > 0) {
          throw new Error('Incorrect password. Please try again.');
        }
        throw new Error('No registered account found with this username/email. Please sign up first.');
      }

      if (matchingAccounts.length === 1) {
        targetAccount = matchingAccounts[0];
      } else {
        // Multiple matching accounts exist (e.g. Sam as Artisan and Sam as Buyer with same password)
        if (rolePreference) {
          targetAccount = matchingAccounts.find((acc) => acc.role === rolePreference);
        }
        if (!targetAccount) {
          // Default to first match if no specific role preference matched
          targetAccount = matchingAccounts[0];
        }
      }

      if (!targetAccount) {
        throw new Error(`Account found, but could not find an account with role "${rolePreference}".`);
      }

      // Authoritative State assignment
      const activeUser = {
        uid: targetAccount.id,
        email: targetAccount.email,
        name: targetAccount.name,
      };

      setUser(activeUser);
      setRoleState(targetAccount.role);
      localStorage.setItem('kalaconnect_user_role', targetAccount.role);

      if (targetAccount.role === 'buyer') {
        const bProfile = targetAccount.buyerProfile || {
          id: targetAccount.id,
          businessName: targetAccount.name,
          contactPerson: targetAccount.name,
          phone: '',
          email: targetAccount.email,
          businessType: 'Retailer',
          cityState: 'India',
          role: 'buyer',
        };
        setBuyerProfile(bProfile);
        setArtisan(null);
        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            id: targetAccount.id,
            name: targetAccount.name,
            email: targetAccount.email,
            role: 'buyer',
            buyerProfile: bProfile,
          })
        );
      } else {
        const aProfile = targetAccount.artisanProfile || {
          name: targetAccount.name,
          businessName: `${targetAccount.name}'s Studio`,
          craftType: 'Traditional Handicrafts',
          experienceYears: 5,
          location: 'Jaipur',
          state: 'Rajasthan',
          phone: '',
          email: targetAccount.email,
          preferredLanguage: 'en',
          pehchanId: `IND-ART-${targetAccount.id.slice(-6).toUpperCase()}`,
          craftMarkVerified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
          bio: 'Authentic artisan crafting with traditional heritage techniques.',
          bankAccountLinked: true,
          upiId: `${targetAccount.name.toLowerCase().replace(/\s+/g, '')}@upi`,
          totalEarnings: 0,
          role: 'artisan',
        };
        setArtisan(aProfile);
        setBuyerProfile(null);
        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            id: targetAccount.id,
            name: targetAccount.name,
            email: targetAccount.email,
            role: 'artisan',
            artisanProfile: aProfile,
          })
        );
      }

      return { role: targetAccount.role, account: targetAccount };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Artisan Signup: Generates a distinct UNIQUE ID and creates an Artisan account.
   */
  const signup = async (
    email: string,
    pass: string,
    profileData: {
      name: string;
      businessName?: string;
      craftType: string;
      experienceYears?: number;
      location?: string;
      state?: string;
      phone?: string;
      preferredLanguage?: LanguageCode;
      bio?: string;
    }
  ): Promise<UserAccount> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = profileData.name.trim();

    // Generate Guaranteed Unique ID
    const uniqueId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newProfile: ArtisanProfile = {
      name: cleanName,
      businessName: profileData.businessName?.trim() || `${cleanName}'s Studio`,
      craftType: profileData.craftType || 'Traditional Handicrafts',
      experienceYears: Number(profileData.experienceYears) || 5,
      location: profileData.location?.trim() || 'Jaipur',
      state: profileData.state?.trim() || 'Rajasthan',
      phone: profileData.phone?.trim() || '',
      email: cleanEmail,
      preferredLanguage: profileData.preferredLanguage || 'en',
      pehchanId: `IND-ART-${uniqueId.slice(-6).toUpperCase()}`,
      craftMarkVerified: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      bio: profileData.bio || 'Authentic artisan crafting with traditional heritage techniques.',
      bankAccountLinked: true,
      upiId: `${cleanName.toLowerCase().replace(/\s+/g, '')}@upi`,
      totalEarnings: 0,
      role: 'artisan',
    };

    const newAccount: UserAccount = {
      id: uniqueId,
      name: cleanName,
      email: cleanEmail,
      password: pass.trim(),
      role: 'artisan',
      createdAt: new Date().toISOString(),
      artisanProfile: newProfile,
    };

    try {
      // 1. Save to local accounts registry
      const accounts = getStoredAccounts();
      // Keep existing accounts intact, append this new unique account
      const updatedAccounts = [...accounts.filter((a) => a.id !== uniqueId), newAccount];
      saveStoredAccounts(updatedAccounts);

      // 2. Optionally sync to Firestore
      try {
        await setDoc(doc(db, 'users', uniqueId), {
          ...newProfile,
          id: uniqueId,
          role: 'artisan',
          createdAt: serverTimestamp(),
        });
      } catch (dbErr) {
        console.warn('Firestore profile sync notice:', dbErr);
      }

      // 3. Set authoritative active session
      const activeUser = { uid: uniqueId, email: cleanEmail, name: cleanName };
      setUser(activeUser);
      setArtisan(newProfile);
      setBuyerProfile(null);
      setRoleState('artisan');
      localStorage.setItem('kalaconnect_user_role', 'artisan');
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          id: uniqueId,
          name: cleanName,
          email: cleanEmail,
          role: 'artisan',
          artisanProfile: newProfile,
        })
      );

      return newAccount;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buyer Signup: Generates a distinct UNIQUE ID and creates a Buyer account.
   */
  const signupBuyer = async (
    email: string,
    pass: string,
    buyerData: {
      businessName: string;
      contactPerson: string;
      phone: string;
      businessType: BuyerBusinessType | string;
      cityState: string;
    }
  ): Promise<UserAccount> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanContactPerson = buyerData.contactPerson.trim();
    const cleanBusinessName = buyerData.businessName.trim();

    // Generate Guaranteed Unique ID
    const uniqueId = `buyer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newBuyerProfile: BuyerProfile = {
      id: uniqueId,
      businessName: cleanBusinessName,
      contactPerson: cleanContactPerson,
      phone: buyerData.phone.trim(),
      email: cleanEmail,
      businessType: buyerData.businessType || 'Retailer',
      cityState: buyerData.cityState.trim(),
      role: 'buyer',
      avatarUrl:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString(),
    };

    const newAccount: UserAccount = {
      id: uniqueId,
      name: cleanContactPerson || cleanBusinessName,
      email: cleanEmail,
      password: pass.trim(),
      role: 'buyer',
      createdAt: new Date().toISOString(),
      buyerProfile: newBuyerProfile,
    };

    try {
      // 1. Save to local accounts registry
      const accounts = getStoredAccounts();
      const updatedAccounts = [...accounts.filter((a) => a.id !== uniqueId), newAccount];
      saveStoredAccounts(updatedAccounts);

      // 2. Optionally sync to Firestore
      try {
        await setDoc(doc(db, 'users', uniqueId), {
          ...newBuyerProfile,
          id: uniqueId,
          role: 'buyer',
          createdAt: serverTimestamp(),
        });
      } catch (dbErr) {
        console.warn('Firestore buyer profile sync notice:', dbErr);
      }

      // 3. Set authoritative active session
      const activeUser = {
        uid: uniqueId,
        email: cleanEmail,
        name: newAccount.name,
      };
      setUser(activeUser);
      setBuyerProfile(newBuyerProfile);
      setArtisan(null);
      setRoleState('buyer');
      localStorage.setItem('kalaconnect_user_role', 'buyer');
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          id: uniqueId,
          name: newAccount.name,
          email: cleanEmail,
          role: 'buyer',
          buyerProfile: newBuyerProfile,
        })
      );

      return newAccount;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout Handler:
   * 1. Clears current authenticated user, role, and profile state.
   * 2. Clears persisted session from storage.
   * 3. Does NOT delete the user's account or products.
   * 4. Guarantees that refreshing after logout remains strictly logged out.
   */
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      try {
        await signOut(auth);
      } catch {
        // ignore Firebase error
      }
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('kalaconnect_active_auth_session');
      localStorage.removeItem('kalaconnect_artisan_active_session');
      localStorage.removeItem('kalaconnect_user_role');

      setUser(null);
      setArtisan(null);
      setBuyerProfile(null);
      setRoleState(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (updates: Partial<ArtisanProfile>) => {
    if (!user || !artisan) return;

    const updatedProfile: ArtisanProfile = { ...artisan, ...updates };
    setArtisan(updatedProfile);

    // Update in local accounts registry
    const accounts = getStoredAccounts();
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === user.uid) {
        return {
          ...acc,
          name: updates.name || acc.name,
          artisanProfile: updatedProfile,
        };
      }
      return acc;
    });
    saveStoredAccounts(updatedAccounts);

    // Update session
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        id: user.uid,
        name: updatedProfile.name,
        email: user.email,
        role: 'artisan',
        artisanProfile: updatedProfile,
      })
    );

    // Firestore sync
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn('Firestore update notice:', err);
    }
  };

  const updateBuyerProfile = async (updates: Partial<BuyerProfile>) => {
    if (!user || !buyerProfile) return;

    const updatedProfile: BuyerProfile = { ...buyerProfile, ...updates };
    setBuyerProfile(updatedProfile);

    // Update in local accounts registry
    const accounts = getStoredAccounts();
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === user.uid) {
        return {
          ...acc,
          name: updates.contactPerson || acc.name,
          buyerProfile: updatedProfile,
        };
      }
      return acc;
    });
    saveStoredAccounts(updatedAccounts);

    // Update session
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        id: user.uid,
        name: updatedProfile.businessName,
        email: user.email,
        role: 'buyer',
        buyerProfile: updatedProfile,
      })
    );

    // Firestore sync
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn('Firestore buyer update notice:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        artisan,
        buyerProfile,
        loading,
        login,
        signup,
        signupBuyer,
        logout,
        updateProfileData,
        updateBuyerProfile,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
