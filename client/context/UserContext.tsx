import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, database, firestore } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { ref, set, push } from "firebase/database";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface User {
  name: string;
  userType: "teacher" | "student";
  email?: string;
  id?: string;
  class?: number;
  section?: string;
  school?: string;
  place?: string; // School location/city
  studentId?: string;
  classes?: { class: number; section: string }[]; // For teachers
}

interface UserContextType {
  user: User | null;
  login: (identifier: string, password: string, userType: "teacher" | "student") => Promise<void>;
  signup: (userData: any, userType: "teacher" | "student") => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        const savedUser = localStorage.getItem("ravya_user");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (error) {
            console.error("Failed to parse saved user:", error);
          }
        }
      } else {
        // User is signed out
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string, userType: "teacher" | "student") => {
    setIsLoading(true);
    setError(null);

    try {
      // Sign in with Firebase Auth using email
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Retrieve user profile from Firestore
      const userDocRef = doc(firestore, userType === "teacher" ? "teachers" : "students", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }

      const userData = userDoc.data();

      const newUser: User = {
        name: userData.name,
        userType,
        email: firebaseUser.email || userData.email,
        id: firebaseUser.uid,
        class: userData.class,
        section: userData.section,
        school: userData.school,
        place: userData.place,
        studentId: userData.studentId,
        classes: userData.classes, // For teachers
      };

      setUser(newUser);
      localStorage.setItem("ravya_user", JSON.stringify(newUser));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any, userType: "teacher" | "student") => {
    setIsLoading(true);
    setError(null);

    try {
      // Create user account with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;

      // Prepare user profile data
      const profileData = {
        id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        userType,
        createdAt: new Date().toISOString(),
        ...(userType === "teacher" && {
          school: userData.school,
          place: userData.place,
          classes: userData.classes || [],
        }),
        ...(userType === "student" && {
          studentId: userData.studentId,
          class: parseInt(userData.class),
          section: userData.section,
          school: userData.school,
          place: userData.place,
        }),
      };

      // Save user profile to Firestore
      const collectionName = userType === "teacher" ? "teachers" : "students";
      const userDocRef = doc(firestore, collectionName, firebaseUser.uid);
      await setDoc(userDocRef, profileData);

      // Also save to Realtime Database
      const dbPath = userType === "teacher" ? "users/teachers" : "users/students";
      const usersRef = ref(database, dbPath);
      const newUserRef = push(usersRef);
      await set(newUserRef, profileData);

      // Create user data object
      const newUser: User = {
        name: userData.name,
        userType,
        email: userData.email,
        id: firebaseUser.uid,
        ...(userType === "teacher" && {
          school: userData.school,
          place: userData.place,
          classes: userData.classes || [],
        }),
        ...(userType === "student" && {
          class: parseInt(userData.class),
          section: userData.section,
          studentId: userData.studentId,
          school: userData.school,
          place: userData.place,
        }),
      };

      setUser(newUser);
      localStorage.setItem("ravya_user", JSON.stringify(newUser));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
      localStorage.removeItem("ravya_user");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, signup, logout, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
