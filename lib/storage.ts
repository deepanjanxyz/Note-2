import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  isBold: boolean;
  isItalic: boolean;
  hasBullets: boolean;
  hasHighlight: boolean;
}

const NOTES_KEY = '@neuronpad_notes';
const AUTH_KEY = '@neuronpad_auth';

export function generateId(): string {
  return Crypto.randomUUID();
}

export function categorizeNote(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase();

  const workKeywords = ['meeting', 'project', 'deadline', 'client', 'report', 'task', 'budget', 'presentation', 'email', 'schedule', 'office', 'team', 'manager', 'sprint', 'review', 'agenda'];
  const ideaKeywords = ['idea', 'brainstorm', 'concept', 'what if', 'maybe', 'innovation', 'creative', 'inspiration', 'design', 'prototype', 'experiment', 'explore'];
  const personalKeywords = ['grocery', 'shopping', 'birthday', 'family', 'vacation', 'recipe', 'workout', 'doctor', 'appointment', 'hobby', 'travel', 'home', 'personal'];

  let workScore = 0;
  let ideaScore = 0;
  let personalScore = 0;

  workKeywords.forEach(k => { if (text.includes(k)) workScore++; });
  ideaKeywords.forEach(k => { if (text.includes(k)) ideaScore++; });
  personalKeywords.forEach(k => { if (text.includes(k)) personalScore++; });

  if (workScore > ideaScore && workScore > personalScore) return 'Work';
  if (ideaScore > workScore && ideaScore > personalScore) return 'Ideas';
  if (personalScore > workScore && personalScore > ideaScore) return 'Personal';
  return 'General';
}

export async function getAllNotes(): Promise<Note[]> {
  try {
    const data = await AsyncStorage.getItem(NOTES_KEY);
    if (!data) return [];
    return JSON.parse(data) as Note[];
  } catch {
    return [];
  }
}

export async function saveNote(note: Note): Promise<void> {
  const notes = await getAllNotes();
  const idx = notes.findIndex(n => n.id === note.id);
  if (idx >= 0) {
    notes[idx] = note;
  } else {
    notes.unshift(note);
  }
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await getAllNotes();
  const filtered = notes.filter(n => n.id !== id);
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
}

export async function setAuthPassed(): Promise<void> {
  await AsyncStorage.setItem(AUTH_KEY, 'true');
}

export async function hasAuthPassed(): Promise<boolean> {
  const val = await AsyncStorage.getItem(AUTH_KEY);
  return val === 'true';
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}
