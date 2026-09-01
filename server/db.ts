/**
 * Universal Firestore database layer using Firebase Client SDK (configured with API Key & Project Config)
 * Handles:
 * - Admin account verification & registration
 * - Restricted database queries only accessible to verified administrators
 * - Server-side data mirroring for game state (players, gamerooms, parties, houses, store, questions)
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  limit,
  query,
  writeBatch,
} from 'firebase/firestore';
import { HOUSES, SHOP_SPELLS } from '../src/data/gameData';
import { ALL_SORTING_HAT_QUESTIONS } from '../src/data/sortingHatQuestions';
import { Player, GameRoom, HouseId, Spell } from '../src/types/game';
import fs from 'fs';
import path from 'path';

let db: Firestore | null = null;
let firebaseApp: FirebaseApp | null = null;

// The official bootstrapped admin email
export const BOOTSTRAP_ADMIN_EMAIL = 'farlodunolusege@gmail.com';

export function initDatabase(): Firestore | null {
  if (db) return db;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('⚠️ firebase-applet-config.json not found, database initialized in memory mode');
      return null;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const projectId = config.projectId;
    const firestoreDatabaseId = config.firestoreDatabaseId;

    if (!projectId) {
      console.warn('⚠️ No projectId in firebase-applet-config.json');
      return null;
    }

    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }

    if (firestoreDatabaseId) {
      db = getFirestore(firebaseApp, firestoreDatabaseId);
    } else {
      db = getFirestore(firebaseApp);
    }

    console.log(`✅ Firestore connected for project: ${projectId} (database: ${firestoreDatabaseId || 'default'})`);
    seedInitialData(db).catch((err) => console.error('Error seeding initial data:', err));

    return db;
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    return null;
  }
}

/**
 * Register or ensure admin record in Firestore /admins/{uid}
 */
export async function registerAdminRecord(adminData: {
  uid: string;
  email: string;
  displayName?: string;
  role?: 'admin' | 'super_admin';
}) {
  if (!db) return { success: false, error: 'Database offline' };
  try {
    const adminDocRef = doc(db, 'admins', adminData.uid);
    const existing = await getDoc(adminDocRef);

    const isBootstrapEmail = adminData.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
    const role = isBootstrapEmail ? 'super_admin' : (adminData.role || 'admin');

    await setDoc(
      adminDocRef,
      {
        uid: adminData.uid,
        email: adminData.email,
        displayName: adminData.displayName || adminData.email.split('@')[0],
        role,
        isVerifiedAdmin: true,
        createdAt: existing.exists() ? existing.data()?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      success: true,
      admin: {
        uid: adminData.uid,
        email: adminData.email,
        role,
      },
    };
  } catch (err: any) {
    console.error('Failed to register admin in Firestore:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check whether a user UID or email has admin privileges
 */
export async function verifyAdminStatus(uid?: string, email?: string): Promise<{ isAdmin: boolean; role?: string }> {
  if (email && email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
    return { isAdmin: true, role: 'super_admin' };
  }

  if (!db || !uid) {
    return { isAdmin: false };
  }

  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      return { isAdmin: true, role: data.role || 'admin' };
    }
    return { isAdmin: false };
  } catch (err) {
    console.warn('Error checking admin document:', err);
    return { isAdmin: false };
  }
}

/**
 * Seed Houses, Sorting Hat Questions, Options, and Store items into Firestore
 */
async function seedInitialData(firestore: Firestore) {
  try {
    // 1. Seed Houses table
    const housesRef = collection(firestore, 'houses');
    const existingHouses = await getDocs(query(housesRef, limit(1)));
    if (existingHouses.empty) {
      console.log('🌱 Seeding Hogwarts Houses table...');
      const batch = writeBatch(firestore);
      Object.values(HOUSES).forEach((house) => {
        const docRef = doc(firestore, 'houses', house.id);
        batch.set(docRef, {
          id: house.id,
          name: house.name,
          crest: house.crest,
          tagline: house.tagline,
          baseHp: house.baseHp,
          baseMp: house.baseMp,
          baseSp: house.baseSp,
          description: house.description,
          specialAbilityName: house.specialAbility.name,
          specialAbilityDesc: house.specialAbility.description,
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
      console.log('✅ Houses seeded successfully.');
    }

    // 2. Seed Sorting Hat Questions and Options tables
    const questionsRef = collection(firestore, 'sorting_hat_questions');
    const existingQuestions = await getDocs(query(questionsRef, limit(1)));
    if (existingQuestions.empty) {
      console.log('🌱 Seeding Sorting Hat Questions and Options tables (14 questions)...');
      const qBatch = writeBatch(firestore);

      ALL_SORTING_HAT_QUESTIONS.forEach((q) => {
        const qDoc = doc(firestore, 'sorting_hat_questions', `question_${q.id}`);
        qBatch.set(qDoc, {
          questionId: q.id,
          question: q.question,
          context: q.context,
          optionsCount: q.answers.length,
          createdAt: new Date().toISOString(),
        });

        q.answers.forEach((ans, oIdx) => {
          const optDoc = doc(firestore, 'sorting_hat_options', `opt_q${q.id}_${ans.house}_${oIdx}`);
          qBatch.set(optDoc, {
            id: `opt_q${q.id}_${ans.house}`,
            questionId: q.id,
            house: ans.house,
            text: ans.text,
            flavor: ans.flavor,
          });
        });
      });
      await qBatch.commit();
      console.log('✅ Sorting Hat Questions & Options seeded successfully.');
    }

    // 3. Seed Store catalog table
    const storeRef = collection(firestore, 'store');
    const existingStore = await getDocs(query(storeRef, limit(1)));
    if (existingStore.empty) {
      console.log('🌱 Seeding Magical Store catalog table...');
      const sBatch = writeBatch(firestore);
      SHOP_SPELLS.forEach((spell) => {
        const docRef = doc(firestore, 'store', spell.id);
        sBatch.set(docRef, {
          id: spell.id,
          name: spell.name,
          category: 'spell',
          tier: spell.tier,
          costSp: spell.costSp,
          mpCost: spell.mpCost,
          element: spell.element,
          description: spell.description,
          runeSymbol: spell.runeSymbol,
          houseAffinity: spell.houseAffinity || 'universal',
          updatedAt: new Date().toISOString(),
        });
      });
      await sBatch.commit();
      console.log('✅ Store catalog seeded successfully.');
    }
  } catch (err) {
    console.error('Seed initial data error:', err);
  }
}

/**
 * Save or update player in Firestore
 */
export async function savePlayer(player: Player, roomCode?: string, partyName?: string, partyLink?: string) {
  if (!db) return;
  try {
    const playerDoc = doc(db, 'players', player.id);
    await setDoc(
      playerDoc,
      {
        id: player.id,
        name: player.name,
        house: player.house || 'Unsorted',
        avatarUrl: player.avatarUrl,
        hp: player.hp,
        maxHp: player.maxHp,
        mp: player.mp,
        maxMp: player.maxMp,
        sp: player.sp,
        gold: player.gold,
        stats: player.stats,
        partyName: partyName || `Party ${roomCode || ''}`,
        partyLink: partyLink || '',
        roomCode: roomCode || '',
        isHost: player.isHost,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error(`Failed to save player ${player.id} to Firestore:`, err);
  }
}

/**
 * Save or update game room in Firestore
 */
export async function saveGameRoom(room: GameRoom, partyLink: string) {
  if (!db) return;
  try {
    const playersList = Object.values(room.players);
    const roomDoc = doc(db, 'gamerooms', room.code);
    await setDoc(
      roomDoc,
      {
        code: room.code,
        name: room.name,
        hostId: room.hostId,
        stage: room.stage,
        partyName: room.name,
        partyLink,
        playerCount: playersList.length,
        playerNames: playersList.map((p) => p.name),
        createdAt: new Date(room.createdAt).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Also sync party entry
    const partyDoc = doc(db, 'parties', room.code);
    await setDoc(
      partyDoc,
      {
        id: room.code,
        name: room.name,
        roomCode: room.code,
        partyLink,
        hostId: room.hostId,
        hostPlayerName: room.players[room.hostId]?.name || 'Unknown',
        memberCount: playersList.length,
        members: playersList.map((p) => ({
          id: p.id,
          name: p.name,
          house: p.house,
          avatarUrl: p.avatarUrl,
        })),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error(`Failed to save gameroom/party ${room.code} to Firestore:`, err);
  }
}

/**
 * Save user spells and abilities when acquired
 */
export async function saveUserSpell(player: Player, spell: Spell) {
  if (!db) return;
  try {
    const docId = `${player.id}_${spell.id}`;
    const spellDoc = doc(db, 'user_spells_and_abilities', docId);
    await setDoc(spellDoc, {
      id: docId,
      playerId: player.id,
      playerName: player.name,
      spellId: spell.id,
      spellName: spell.name,
      tier: spell.tier,
      mpCost: spell.mpCost,
      element: spell.element,
      damage: spell.damage || 0,
      healing: spell.healing || 0,
      shield: spell.shield || 0,
      acquiredAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`Failed to save user spell ${spell.id} for player ${player.id}:`, err);
  }
}

/**
 * Save user special ability when sorted
 */
export async function saveUserAbility(player: Player, houseId: HouseId) {
  if (!db) return;
  try {
    const house = HOUSES[houseId];
    if (!house) return;
    const ability = house.specialAbility;
    const docId = `${player.id}_${ability.id}`;
    const abilityDoc = doc(db, 'user_spells_and_abilities', docId);
    await setDoc(abilityDoc, {
      id: docId,
      playerId: player.id,
      playerName: player.name,
      spellId: ability.id,
      spellName: ability.name,
      tier: 1,
      mpCost: ability.mpCost,
      element: 'special_ability',
      description: ability.description,
      acquiredAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`Failed to save ability for player ${player.id}:`, err);
  }
}

/**
 * Get all database records for the Database Inspector / Stats modal
 * Strictly restricted to verified admins!
 */
export async function getDatabaseSummary(requester?: { uid?: string; email?: string }) {
  if (!db) {
    return {
      status: 'offline',
      message: 'Firestore not connected',
      tables: {},
    };
  }

  // Verify that requester is an authorized admin
  const { isAdmin, role } = await verifyAdminStatus(requester?.uid, requester?.email);
  if (!isAdmin) {
    return {
      status: 'unauthorized',
      message: 'PERMISSION_DENIED: Access restricted to authorized Hogwarts Administrators only.',
      tables: {},
      counts: {},
    };
  }

  try {
    const [
      adminsSnap,
      playersSnap,
      roomsSnap,
      partiesSnap,
      housesSnap,
      questionsSnap,
      optionsSnap,
      spellsSnap,
      storeSnap,
    ] = await Promise.all([
      getDocs(query(collection(db, 'admins'), limit(20))),
      getDocs(query(collection(db, 'players'), limit(20))),
      getDocs(query(collection(db, 'gamerooms'), limit(20))),
      getDocs(query(collection(db, 'parties'), limit(20))),
      getDocs(collection(db, 'houses')),
      getDocs(query(collection(db, 'sorting_hat_questions'), limit(20))),
      getDocs(query(collection(db, 'sorting_hat_options'), limit(20))),
      getDocs(query(collection(db, 'user_spells_and_abilities'), limit(30))),
      getDocs(collection(db, 'store')),
    ]);

    return {
      status: 'connected',
      adminRole: role,
      adminEmail: requester?.email,
      tables: {
        admins: adminsSnap.docs.map((d) => d.data()),
        players: playersSnap.docs.map((d) => d.data()),
        gamerooms: roomsSnap.docs.map((d) => d.data()),
        parties: partiesSnap.docs.map((d) => d.data()),
        houses: housesSnap.docs.map((d) => d.data()),
        sorting_hat_questions: questionsSnap.docs.map((d) => d.data()),
        sorting_hat_options: optionsSnap.docs.map((d) => d.data()),
        user_spells_and_abilities: spellsSnap.docs.map((d) => d.data()),
        store: storeSnap.docs.map((d) => d.data()),
      },
      counts: {
        admins: adminsSnap.size,
        players: playersSnap.size,
        gamerooms: roomsSnap.size,
        parties: partiesSnap.size,
        houses: housesSnap.size,
        sorting_hat_questions: questionsSnap.size,
        sorting_hat_options: optionsSnap.size,
        user_spells_and_abilities: spellsSnap.size,
        store: storeSnap.size,
      },
    };
  } catch (err: any) {
    return {
      status: 'error',
      message: err.message,
      tables: {},
    };
  }
}
